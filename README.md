# @deepseek-ai/dsh-plugin-community

内置「插件社区」store：在 DSH Web 设置面板提供 **已安装 / 插件社区 / 待更新** 三个分区，支持精选与社区插件的**一键安装 / 卸载**，以及**版本比对更新检测**。安装即写入（或移除）部署配置 `cordis.patch.yml`，改动由 `watchUserPatches` 热重载生效，无需重启。

## 目录结构

```
dsh-plugin-community/
├── package.json      # exports + dsh.client 元数据（含 ./package.json 导出，扫描必需）
└── lib/
    ├── index.js      # 宿主面：注册 HTTP 路由 + 读/写 cordis.patch.yml
    └── client.js     # 客户端面：window.__ModuleLoader__ bundle，设置栏 UI
```

## 架构

这是一个**双面（dual-face）包**，由同一条 `cordis.patch.yml` 行挂载：

- **宿主面**（`lib/index.js`，`main`/`exports["."]`）：`inject ['fs','webServer']`，用 `webServer.register` 暴露三个 `exact` 路由；用 `ctx.get('fs')` 读写 `cordis.patch.yml`。
- **客户端面**（`lib/client.js`，`exports["./client"]`）：`window.__ModuleLoader__.load` bundle，`inject ['slots']`，通过 `ctx.slots.inject('settings.section')` 注册「插件社区」分区，用浏览器 `fetch` 调用宿主面路由。

## HTTP 路由（同源、未鉴权）

| 方法 | 路径 | 作用 |
|---|---|---|
| GET | `/plugin-community/list` | 返回目录 + 各插件已安装状态 |
| POST | `/plugin-community/install` | body `{ "id": "..." }`，安装一个插件 |
| POST | `/plugin-community/uninstall` | body `{ "id": "..." }`，卸载一个插件 |
| POST | `/plugin-community/install-community` | body `{ "id", "defaultBranch" }`，社区插件一键安装（读取仓库 package.json） |

> 说明：这些路由无鉴权，适合本地/受信内网；公网部署请自行加鉴权。

## 安装 / 卸载机制

- 安装 = 向 `cordis.patch.yml` 追加一条 `- insert:` 条目（`id` + 包名）。
- 卸载 = 精确移除对应 `- insert:` 条目；移除后若无剩余条目，自动回退为合法空数组 `[]`（避免“仅注释文件”解析抛错）。
- 已安装状态 = 读取 `cordis.patch.yml`，按 `id: <pluginId>` 判断。

补丁写入两种结果：

1. 直接写成功（部署默认 `danger-full-access` 时）→ 立即热重载生效。
2. 被沙箱拦截（默认 `workspace-write`）→ 把完整新补丁暂存到 `<workspaceRoot>/.plugin-community-<action>-<id>.patch.yml`，返回 `needsAuthorization: true`，等待一次 `danger-full-access` 授权落盘。

## 沙箱与授权

部署默认沙箱（`dsh-base`）：

```yaml
- id: sandbox-policy
  name: '@deepseek-ai/dsh-sandbox-policy'
  config:
    mode: !!js process.env.DSH_PERMISSION_MODE ?? 'workspace-write'
    workspaceRoot: !!js process.cwd()
```

- 写 `cordis.patch.yml`（位于 `DSH_HOME` 下）在 `workspace-write` 下会被 `dsh-fs-sandbox` 围栏拦截。
- 要让「一键安装」完全自动落盘，把部署默认设为 `DSH_PERMISSION_MODE=danger-full-access`。
- 读取不受围栏限制（`fs` 的读操作全部放行），所以「已安装」状态判断始终可用。

## 部署与重启

1. 把整个包目录放到 `$DSH_HOME/profiles/node_modules/@deepseek-ai/dsh-plugin-community/`（`healProfilesModuleFallback` 只维护内置包软链、不删除外来目录，故安全持久）。
2. 在 `$DSH_HOME/profiles/web/cordis.patch.yml` 追加：

   ```yaml
   - insert:
       - id: plugin-community
         name: '@deepseek-ai/dsh-plugin-community'
   ```

3. **重启 `dsh web`**，再刷新页面。

> 关键点：客户端 bundle 由 `@deepseek-ai/dsh-client-modules` 在**进程启动时**扫描 `dsh.client` 行并注入 `window.__DSH_BOOT__`。通过 patch 热重载新增的客户端行不会被增量重扫，因此**必须重启进程**客户端 UI 才会出现。宿主面路由则会随 patch 热重载立即生效。

> 依赖：`package.json` 的 `exports` 必须包含 `"./package.json": "./package.json"`，否则 `client-modules` 用 `require.resolve('<pkg>/package.json')` 定位包会失败（ERR_PACKAGE_PATH_NOT_EXPORTED），扫描静默跳过。

## 内置目录（CATALOG）

| id | 标题 | 包名 |
|---|---|---|
| `time-context` | 时间上下文 | `@deepseek-ai/dsh-time-context` |
| `session-reference` | 跨会话引用 | `@deepseek-ai/dsh-session-reference` |
| `mcp-client` | MCP 客户端 | `@deepseek-ai/dsh-mcp-client` |

## 扩展目录

目录是宿主面 `lib/index.js` 里的 `CATALOG` 常量数组，每项结构：

```js
{
  id: 'xxx',            // 插件 id（也是补丁里的 - id）
  title: '标题',
  description: '简介',
  author: '作者',
  version: '1.0.0',
  tags: ['标签'],
  row: { id: 'xxx', name: '@scope/pkg-name' }  // 补丁 insert 行的 id + 包名
}
```

新增条目后改 `CATALOG` 并重载；「安装」即向 `cordis.patch.yml` 追加该 `row` 对应的 `insert` 条目。

## 页面编排（三 Tab）

设置分区顶部三个 Tab（带计数角标）：

| Tab | 内容 |
|---|---|
| **已安装** | 已装插件（官方/社区徽章 + 包名 + 版本）；官方插件可「卸载」 |
| **插件社区** | 精选（官方）+ 社区市场（搜索 / 分类 / 最多人安装排序 / 一键安装） |
| **待更新** | 已装插件中检测到新版的项：`v当前 → v最新` |

## 语义分类

社区插件按 `名称 + 简介 + topics` 关键词归类到：**界面设计 / 功能实现 / 工作流编排 / 集成对接 / 开发脚手架 / 目录聚合 / 其他**。规则在宿主面 `CATEGORY_RULES`，改数组即可增删分区。

## 版本追踪与待更新

- 状态文件 `<workspaceRoot>/.plugin-community-installed.json`：在安装/卸载时记录 `{ packageName, source, installedVersion, repoId?, defaultBranch? }`。
- 首启播种：`doList` 会把已装但未记录的官方插件自动补录（避免老安装不显示在「已安装」）。
- 最新版来源：官方 → `registry.npmjs.org/<包名>` 的 `dist-tags.latest`；社区 → 仓库 `package.json` 的 `version`。
- 版本字符串不同即判「待更新」；真实升级仍需手动 `npm install` / `dsh plugin add`（插件不接管包安装）。

## 社区实时同步

宿主面 `doList` 会实时抓取 GitHub topic「dsh-plugin」：

- 数据源：`https://api.github.com/search/repositories?q=topic:dsh-plugin&per_page=50&sort=stars`
- 通路：宿主面是普通 Node 进程，用原生 `fetch` 直连（不经 `ctx.web`，因为本部署未注册 fetch provider）。
- 展示：社区仓库显示名称 / 星标 / 描述 / 作者 / 分类，带「仓库」链接、搜索、分类 chips、最多人安装/最近更新排序、以及「一键安装」。
- 一键安装约定：读取仓库 `package.json` 的 `name`（npm 包名），写入 `cordis.patch.yml` 的 `insert` 条目；未声明 `name` 的仓库（awesome 目录等）会明确报错。
- 抓取失败时优雅降级：仅显示内置精选，并在 UI 提示 `communityError`。
