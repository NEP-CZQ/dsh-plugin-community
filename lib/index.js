const NL = '\n'

function dshHome() {
  try {
    if (process.env.DSH_HOME) return process.env.DSH_HOME
  } catch (e) {}
  return 'D:/codex/deepseek-harness/dsh-home'
}

const CATALOG = [
  { id: 'time-context', title: '时间上下文', description: '为模型注入当前时区时间、浏览器时区与请求耗时，让 agent 正确理解相对时间。默认关闭，可一键开启。', author: 'DeepSeek', version: '1.0.0', tags: ['上下文', '时间'], row: { id: 'time-context', name: '@deepseek-ai/dsh-time-context' } },
  { id: 'session-reference', title: '跨会话引用', description: '提供跨会话只读快照引用解析，支持 @ 提及其他会话作为模型上下文。', author: 'DeepSeek', version: '1.0.0', tags: ['会话', '引用'], row: { id: 'session-reference', name: '@deepseek-ai/dsh-session-reference' } },
  { id: 'mcp-client', title: 'MCP 客户端', description: '连接外部 Model Context Protocol 服务器，并将其工具注册为模型可用的原生工具。', author: 'DeepSeek', version: '1.0.0', tags: ['MCP', '工具'], row: { id: 'mcp-client', name: '@deepseek-ai/dsh-mcp-client' } }
]

export const inject = ['fs', 'webServer']

export function apply(ctx) {
  const fs = ctx.get('fs')
  const webServer = ctx.get('webServer')
  const sandboxPolicy = ctx.get('sandboxPolicy')
  if (!fs || !webServer) return

  const PATCH_PATH = dshHome() + '/profiles/web/cordis.patch.yml'
  const WORKSPACE = (sandboxPolicy && typeof sandboxPolicy.workspaceRoot === 'string') ? sandboxPolicy.workspaceRoot : 'D:/ds'
  const byId = {}
  for (const e of CATALOG) byId[e.id] = e

  async function readPatchText() {
    try {
      const target = await fs.resolve(PATCH_PATH)
      return await fs.readText(target)
    } catch (e) { return '' }
  }

  function isInstalledIn(text, id) { return text.indexOf('id: ' + id) !== -1 }

  function appendInsertBlock(text, row) {
    const lines = '- insert:' + NL + '    - id: ' + row.id + NL + '      name: ' + JSON.stringify(row.name)
    const body = text.trim()
    if (body.endsWith('[]')) return body.slice(0, body.length - 2) + lines + NL
    return body + NL + lines + NL
  }

  function removeInsertBlock(text, id) {
    const lines = text.split(NL)
    const out = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line.trim() === '- id: ' + id) {
        if (out.length && out[out.length - 1].trim() === '- insert:') out.pop()
        if (i + 1 < lines.length && lines[i + 1].trim().startsWith('name:')) i = i + 2
        else i = i + 1
        continue
      }
      out.push(line)
      i = i + 1
    }
    let result = out.join(NL).trim()
    if (result.indexOf('- insert:') === -1) result = result + NL + '[]'
    return result + NL
  }

  async function fetchCommunity() {
    const url = 'https://api.github.com/search/repositories?q=topic:dsh-plugin&per_page=50&sort=stars'
    if (typeof fetch !== 'function') return { repos: [], total: 0, error: 'no native fetch' }
    try {
      const res = await fetch(url, { headers: { 'user-agent': 'dsh-plugin-community-store', 'accept': 'application/vnd.github+json' } })
      if (!res.ok) return { repos: [], total: 0, error: 'github http ' + res.status }
      const data = await res.json()
      const repos = (data.items || []).map(function (r) {
        const topics = (r.topics || []).filter(function (t) { return t !== 'dsh-plugin' })
        return { id: r.full_name, name: r.name, description: r.description || '', author: (r.owner && r.owner.login) || '', stars: r.stargazers_count || 0, htmlUrl: r.html_url || '', topics: topics, category: topics.length > 0 ? topics[0] : '其他', defaultBranch: r.default_branch || 'main', updatedAt: r.updated_at || '' }
      })
      return { repos: repos, total: data.total_count || 0, error: null }
    } catch (e) {
      return { repos: [], total: 0, error: String(e && e.message ? e.message : e) }
    }
  }

  async function doList() {
    const text = await readPatchText()
    const entries = CATALOG.map(function (e) {
      return { id: e.id, packageName: e.row.name, title: e.title, description: e.description, author: e.author, version: e.version, tags: e.tags, installed: isInstalledIn(text, e.id) }
    })
    const community = await fetchCommunity()
    return { entries: entries, community: community.repos, communityTotal: community.total, communityError: community.error, patchPath: PATCH_PATH }
  }

  async function writePatch(next, action, id) {
    try {
      const target = await fs.resolve(PATCH_PATH)
      await fs.writeText(target, next)
      return { ok: true, applied: action === 'install', removed: action === 'uninstall', patchPath: PATCH_PATH }
    } catch (err) {
      const stagedPath = WORKSPACE + '/.plugin-community-' + action + '-' + id + '.patch.yml'
      let staged = false
      let stageError = null
      try {
        const t = await fs.resolve(stagedPath)
        await fs.writeText(t, next)
        staged = true
      } catch (e2) { stageError = String(e2 && e2.message ? e2.message : e2) }
      return { ok: false, applied: false, removed: false, staged: staged, stagedPath: stagedPath, stageError: stageError, patchPath: PATCH_PATH, needsAuthorization: true, error: String(err && err.message ? err.message : err), content: next }
    }
  }

  async function doInstall(id) {
    const entry = byId[id]
    if (!entry) return { ok: false, error: 'unknown plugin: ' + String(id) }
    const text = await readPatchText()
    if (isInstalledIn(text, id)) return { ok: true, applied: true, alreadyInstalled: true, patchPath: PATCH_PATH }
    return writePatch(appendInsertBlock(text, entry.row), 'install', id)
  }

  async function doUninstall(id) {
    const entry = byId[id]
    if (!entry) return { ok: false, error: 'unknown plugin: ' + String(id) }
    const text = await readPatchText()
    if (!isInstalledIn(text, id)) return { ok: true, removed: true, alreadyRemoved: true, patchPath: PATCH_PATH }
    return writePatch(removeInsertBlock(text, id), 'uninstall', id)
  }

  async function doCommunityInstall(args) {
    const repoId = args && args.id
    const defaultBranch = (args && args.defaultBranch) || 'main'
    if (!repoId) return { ok: false, error: 'missing repo id' }
    if (typeof fetch !== 'function') return { ok: false, error: 'no native fetch' }
    let pkg
    try {
      const url = 'https://raw.githubusercontent.com/' + repoId + '/' + defaultBranch + '/package.json'
      const res = await fetch(url, { headers: { 'user-agent': 'dsh-plugin-community-store' } })
      if (!res.ok) return { ok: false, error: '无法读取仓库 package.json（HTTP ' + res.status + '）' }
      pkg = await res.json()
    } catch (e) {
      return { ok: false, error: String(e && e.message ? e.message : e) }
    }
    const name = pkg && typeof pkg.name === 'string' ? pkg.name : ''
    if (!name) return { ok: false, error: '该仓库 package.json 未声明 name，无法一键安装（请按其 README 手动安装）' }
    const rowId = String(name).split('/').pop()
    const text = await readPatchText()
    if (isInstalledIn(text, rowId)) return { ok: true, applied: true, alreadyInstalled: true, packageName: name, patchPath: PATCH_PATH }
    return writePatch(appendInsertBlock(text, { id: rowId, name: name }), 'install', rowId)
  }

  function send(res, status, body) {
    res.statusCode = status
    res.setHeader('content-type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(body))
  }

  async function bodyOf(req) {
    const chunks = []
    for await (const c of req) chunks.push(c)
    const text = Buffer.concat(chunks).toString('utf8')
    try { return JSON.parse(text || '{}') } catch (e) { return {} }
  }

  ctx.effect(function () {
    const routes = [
      webServer.register({ kind: 'exact', path: '/plugin-community/list', handler: async function (req, res) { try { send(res, 200, await doList()) } catch (e) { send(res, 500, { error: String(e && e.message || e) }) } } }),
      webServer.register({ kind: 'exact', path: '/plugin-community/install', handler: async function (req, res) { const b = await bodyOf(req); try { send(res, 200, await doInstall(b && b.id)) } catch (e) { send(res, 500, { error: String(e && e.message || e) }) } } }),
      webServer.register({ kind: 'exact', path: '/plugin-community/uninstall', handler: async function (req, res) { const b = await bodyOf(req); try { send(res, 200, await doUninstall(b && b.id)) } catch (e) { send(res, 500, { error: String(e && e.message || e) }) } } }),
      webServer.register({ kind: 'exact', path: '/plugin-community/install-community', handler: async function (req, res) { const b = await bodyOf(req); try { send(res, 200, await doCommunityInstall(b)) } catch (e) { send(res, 500, { error: String(e && e.message || e) }) } } })
    ]
    return function () { for (const d of routes) d() }
  }, 'plugin-community: routes')
}
