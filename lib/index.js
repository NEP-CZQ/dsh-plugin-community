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

const CATEGORY_RULES = [
  { key: '界面设计', words: ['ui', 'theme', '界面', '设置', 'settings', 'sidebar', '侧边栏', 'panel', '面板', '前端', 'frontend', '样式', 'layout', 'visual', 'desktop', 'overlay', '主题', '悬浮', '颜色'] },
  { key: '功能实现', words: ['tool', 'bash', 'fs', 'file', '文件', '命令', 'command', '功能', 'feature', 'editor', '编辑', 'search', '检索', '处理', 'transform', 'convert', '转换', '生成', 'generate', '终端', 'terminal', 'shell'] },
  { key: '工作流编排', words: ['workflow', '编排', 'flow', 'task', '任务', 'queue', '计划', 'plan', 'goal', '目标', 'subagent', '子代理', 'agent', '智能体', '多智能体', 'ralph', 'orchestrat'] },
  { key: '集成对接', words: ['mcp', 'integration', '集成', 'provider', 'api', '连接', 'connect', '服务', 'server', '桥接', 'bridge', 'llm', 'model', 'claude', 'codex', 'openai', '飞书', 'lark', '钉钉', 'slack'] },
  { key: '开发脚手架', words: ['scaffold', '脚手架', 'create', '模板', 'template', '构建', 'build', '开发', 'develop', 'skill', '发布', 'publish', '文档', 'doc', 'cli', '命令行'] },
  { key: '目录聚合', words: ['awesome', '目录', '聚合', 'list', 'collection', 'hub', 'marketplace', 'registry', '精选', '商店', 'store', '市场', 'awesome-'] }
]

function classifyRepo(repo) {
  const hay = (repo.name + ' ' + (repo.description || '') + ' ' + (repo.topics || []).join(' ')).toLowerCase()
  for (const rule of CATEGORY_RULES) {
    for (const w of rule.words) {
      if (hay.indexOf(w.toLowerCase()) !== -1) return rule.key
    }
  }
  return '其他'
}

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

  const INSTALLED_FILE = WORKSPACE + '/.plugin-community-installed.json'

  async function readInstalled() {
    try {
      const target = await fs.resolve(INSTALLED_FILE)
      const text = await fs.readText(target)
      const obj = JSON.parse(text)
      return (obj && typeof obj === 'object') ? obj : {}
    } catch (e) { return {} }
  }

  async function saveInstalled(obj) {
    try {
      const target = await fs.resolve(INSTALLED_FILE)
      await fs.writeText(target, JSON.stringify(obj, null, 2))
      return true
    } catch (e) { return false }
  }

  async function installedVersionOf(packageName) {
    try {
      const pkgPath = dshHome() + '/profiles/node_modules/' + packageName + '/package.json'
      const target = await fs.resolve(pkgPath)
      const text = await fs.readText(target)
      const pkg = JSON.parse(text)
      return (pkg && typeof pkg.version === 'string') ? pkg.version : '0.0.0'
    } catch (e) { return '0.0.0' }
  }

  async function fetchLatestVersion(rec) {
    if (typeof fetch !== 'function') return null
    try {
      if (rec.source === 'community' && rec.repoId) {
        const branch = rec.defaultBranch || 'main'
        const url = 'https://raw.githubusercontent.com/' + rec.repoId + '/' + branch + '/package.json'
        const res = await fetch(url, { headers: { 'user-agent': 'dsh-plugin-community-store' } })
        if (!res.ok) return null
        const pkg = await res.json()
        return (pkg && typeof pkg.version === 'string') ? pkg.version : null
      }
      const url = 'https://registry.npmjs.org/' + rec.packageName
      const res = await fetch(url, { headers: { 'user-agent': 'dsh-plugin-community-store' } })
      if (!res.ok) return null
      const data = await res.json()
      return (data && data['dist-tags'] && data['dist-tags'].latest) ? data['dist-tags'].latest : null
    } catch (e) { return null }
  }

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
        const repo = { id: r.full_name, name: r.name, description: r.description || '', author: (r.owner && r.owner.login) || '', stars: r.stargazers_count || 0, htmlUrl: r.html_url || '', topics: topics, defaultBranch: r.default_branch || 'main', updatedAt: r.updated_at || '' }
        repo.category = classifyRepo(repo)
        return repo
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
    const inst = await readInstalled()
    let seeded = false
    for (const e of CATALOG) {
      if (isInstalledIn(text, e.id) && !inst[e.id]) {
        inst[e.id] = { packageName: e.row.name, source: 'official', installedVersion: await installedVersionOf(e.row.name) }
        seeded = true
      }
    }
    if (seeded) await saveInstalled(inst)
    const installed = Object.keys(inst).map(function (id) {
      const rec = inst[id]
      return { id: id, packageName: rec.packageName, source: rec.source, installedVersion: rec.installedVersion, repoId: rec.repoId || null }
    })
    const updates = []
    for (const id of Object.keys(inst)) {
      const rec = inst[id]
      const latest = await fetchLatestVersion(rec)
      if (latest && rec.installedVersion && latest !== rec.installedVersion) {
        updates.push({ id: id, packageName: rec.packageName, source: rec.source, installedVersion: rec.installedVersion, latestVersion: latest })
      }
    }
    return { entries: entries, community: community.repos, communityTotal: community.total, communityError: community.error, installed: installed, updates: updates, patchPath: PATCH_PATH }
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
    const res = await writePatch(appendInsertBlock(text, entry.row), 'install', id)
    if (res && res.applied) {
      const inst = await readInstalled()
      inst[id] = { packageName: entry.row.name, source: 'official', installedVersion: await installedVersionOf(entry.row.name) }
      await saveInstalled(inst)
    }
    return res
  }

  async function doUninstall(id) {
    const entry = byId[id]
    if (!entry) return { ok: false, error: 'unknown plugin: ' + String(id) }
    const text = await readPatchText()
    if (!isInstalledIn(text, id)) return { ok: true, removed: true, alreadyRemoved: true, patchPath: PATCH_PATH }
    const res = await writePatch(removeInsertBlock(text, id), 'uninstall', id)
    if (res && res.removed) {
      const inst = await readInstalled()
      delete inst[id]
      await saveInstalled(inst)
    }
    return res
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
    const res = await writePatch(appendInsertBlock(text, { id: rowId, name: name }), 'install', rowId)
    if (res && res.applied) {
      const inst = await readInstalled()
      inst[rowId] = { packageName: name, source: 'community', installedVersion: (pkg && typeof pkg.version === 'string') ? pkg.version : '0.0.0', repoId: repoId, defaultBranch: defaultBranch }
      await saveInstalled(inst)
    }
    return res
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
