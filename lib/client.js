window.__ModuleLoader__.load({
  id: '@deepseek-ai/dsh-plugin-community',
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
    var React = require('react');

    var CSS = '.pcs-root{display:flex;flex-direction:column;gap:12px;}' +
      '.pcs-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary);}' +
      '.pcs-sub{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.5;}' +
      '.pcs-card{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;padding:12px 14px;}' +
      '.pcs-main{display:flex;flex-direction:column;gap:6px;min-width:0;flex:1;}' +
      '.pcs-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
      '.pcs-name{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);}' +
      '.pcs-ver{font-size:11px;color:var(--dsw-alias-label-secondary);}' +
      '.pcs-desc{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.5;}' +
      '.pcs-meta{display:flex;flex-wrap:wrap;gap:6px;align-items:center;}' +
      '.pcs-tag{font-size:11px;padding:1px 7px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}' +
      '.pcs-author{font-size:11px;color:var(--dsw-alias-label-secondary);}' +
      '.pcs-btn{flex-shrink:0;border:1px solid var(--dsw-alias-brand-primary);background:var(--dsw-alias-brand-primary);color:#fff;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;}' +
      '.pcs-btn:disabled{cursor:not-allowed;opacity:.55;}' +
      '.pcs-btn.uninstall{background:transparent;color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary);}' +
      '.pcs-hint{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;}' +
      '.pcs-error{font-size:11px;color:var(--dsw-alias-state-error-primary);}' +
      '.pcs-empty{font-size:12px;color:var(--dsw-alias-label-secondary);}' +
      '.pcs-prompt-wrap{display:flex;flex-direction:column;gap:6px;}' +
      '.pcs-prompt{font-family:ui-monospace,Consolas,monospace;font-size:11px;white-space:pre-wrap;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:8px 10px;color:var(--dsw-alias-label-primary);word-break:break-all;line-height:1.5;}' +
      '.pcs-search{width:100%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:7px 10px;font-size:12px;outline:none;}' +
      '.pcs-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}' +
      '.pcs-chip{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:3px 10px;font-size:11px;cursor:pointer;}' +
      '.pcs-chip.active{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);}' +
      '.pcs-select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 8px;font-size:12px;outline:none;}' +
      '.pcs-link{font-size:12px;color:var(--dsw-alias-brand-primary);text-decoration:none;cursor:pointer;}' +
      '.pcs-tabs{display:flex;gap:2px;border-bottom:1px solid var(--dsw-alias-border-l1);}' +
      '.pcs-tab{border:none;background:transparent;color:var(--dsw-alias-label-secondary);padding:8px 12px;font-size:13px;cursor:pointer;border-bottom:2px solid transparent;font-weight:500;}' +
      '.pcs-tab.active{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary);font-weight:600;}' +
      '.pcs-badge{font-size:10px;padding:1px 6px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);}' +
      '.pcs-count{font-size:11px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border-radius:999px;padding:0 7px;margin-left:4px;}';

    var inject = ['slots'];

    function PromptBlock(props) {
      var state = React.useState(false);
      var copied = state[0];
      var setCopied = state[1];
      function fallbackCopy() {
        var ta = document.createElement('textarea');
        ta.value = props.text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
      }
      function copy() {
        function markDone() { setCopied(true); setTimeout(function () { setCopied(false); }, 1500); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(props.text).then(markDone).catch(function () { fallbackCopy(); markDone(); });
        } else {
          fallbackCopy();
          markDone();
        }
      }
      return React.createElement('div', { className: 'pcs-prompt-wrap' },
        React.createElement('div', { className: 'pcs-prompt' }, props.text),
        React.createElement('button', { className: 'pcs-btn', onClick: copy }, copied ? '已复制' : '复制'));
    }

    function Card(props) {
      var e = props.entry;
      var st = props.status;
      var label = '获取安装提示词';
      var disabled = false;
      var prompt = null;
      var error = null;
      if (st === 'loading') { label = '加载中…'; disabled = true; }
      else if (st && st.prompt) { prompt = st.prompt; }
      else if (st && st.error) { label = '重试'; error = st.error; }
      return React.createElement('div', { className: 'pcs-card' },
        React.createElement('div', { className: 'pcs-main' },
          React.createElement('div', { className: 'pcs-row' },
            React.createElement('span', { className: 'pcs-name' }, e.title),
            React.createElement('span', { className: 'pcs-ver' }, 'v' + e.version)),
          React.createElement('div', { className: 'pcs-desc' }, e.description),
          React.createElement('div', { className: 'pcs-meta' },
            React.createElement('span', { className: 'pcs-tag' }, e.packageName),
            (e.tags || []).map(function (t) { return React.createElement('span', { key: t, className: 'pcs-tag' }, t); }),
            React.createElement('span', { className: 'pcs-author' }, e.author)),
          prompt ? React.createElement(PromptBlock, { text: prompt }) : null,
          error ? React.createElement('div', { className: 'pcs-error' }, error) : null),
        React.createElement('button', { className: 'pcs-btn', disabled: disabled, onClick: function () { props.onInstall(e.id); } }, label));
    }

    function CommunitySection() {
      var state = React.useState({ loading: true, entries: [], community: [], communityTotal: 0, communityError: null, installed: [], updates: [], error: null });
      var data = state[0];
      var setData = state[1];
      var busyState = React.useState({});
      var busy = busyState[0];
      var setBusy = busyState[1];
      var refreshingState = React.useState(false);
      var refreshing = refreshingState[0];
      var setRefreshing = refreshingState[1];
      var tabState = React.useState('installed');
      var tab = tabState[0];
      var setTab = tabState[1];
      var queryState = React.useState('');
      var query = queryState[0];
      var setQuery = queryState[1];
      var categoryState = React.useState('all');
      var category = categoryState[0];
      var setCategory = categoryState[1];
      var sortState = React.useState('stars');
      var sort = sortState[0];
      var setSort = sortState[1];
      var langState = React.useState('zh');
      var lang = langState[0];
      var setLang = langState[1];
      var commBusyState = React.useState({});
      var commBusy = commBusyState[0];
      var setCommBusy = commBusyState[1];
      var updateBusyState = React.useState({});
      var updateBusy = updateBusyState[0];
      var setUpdateBusy = updateBusyState[1];

      function load() {
        setRefreshing(true);
        fetch('/plugin-community/list').then(function (r) { return r.json(); }).then(function (res) {
          setData({ loading: false, entries: (res && res.entries) || [], community: (res && res.community) || [], communityTotal: (res && res.communityTotal) || 0, communityError: (res && res.communityError) || null, installed: (res && res.installed) || [], updates: (res && res.updates) || [], error: null });
          setRefreshing(false);
        }).catch(function (err) {
          setData({ loading: false, entries: [], community: [], communityTotal: 0, communityError: null, installed: [], updates: [], error: String(err && err.message ? err.message : err) });
          setRefreshing(false);
        });
      }

      React.useEffect(function () {
        load();
        return function () {};
      }, []);

      function post(path, body) {
        return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) }).then(function (r) { return r.json(); });
      }

      function onInstall(id) {
        setBusy(function (b) { return Object.assign({}, b, { [id]: 'loading' }); });
        post('/plugin-community/install', { id: id }).then(function (res) {
          if (res && res.prompt) setBusy(function (b) { return Object.assign({}, b, { [id]: { prompt: res.prompt } }); });
          else setBusy(function (b) { return Object.assign({}, b, { [id]: { error: (res && res.error) || '获取失败' } }); });
        }).catch(function (err) {
          setBusy(function (b) { return Object.assign({}, b, { [id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      function onUninstall(id) {
        setBusy(function (b) { return Object.assign({}, b, { [id]: 'loading' }); });
        post('/plugin-community/uninstall', { id: id }).then(function (res) {
          if (res && res.prompt) setBusy(function (b) { return Object.assign({}, b, { [id]: { prompt: res.prompt } }); });
          else setBusy(function (b) { return Object.assign({}, b, { [id]: { error: (res && res.error) || '获取失败' } }); });
        }).catch(function (err) {
          setBusy(function (b) { return Object.assign({}, b, { [id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      function onCommunityInstall(repo) {
        setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: 'loading' }); });
        post('/plugin-community/install-community', { id: repo.id, defaultBranch: repo.defaultBranch }).then(function (res) {
          if (res && res.prompt) setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { prompt: res.prompt } }); });
          else setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { error: (res && res.error) || '获取失败' } }); });
        }).catch(function (err) {
          setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      function onUpdate(id) {
        setUpdateBusy(function (b) { return Object.assign({}, b, { [id]: 'loading' }); });
        post('/plugin-community/update', { id: id }).then(function (res) {
          if (res && res.prompt) setUpdateBusy(function (b) { return Object.assign({}, b, { [id]: { prompt: res.prompt } }); });
          else setUpdateBusy(function (b) { return Object.assign({}, b, { [id]: { error: (res && res.error) || '获取失败' } }); });
        }).catch(function (err) {
          setUpdateBusy(function (b) { return Object.assign({}, b, { [id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      function titleOf(packageName) {
        for (var i = 0; i < data.entries.length; i++) {
          if (data.entries[i].packageName === packageName) return data.entries[i].title;
        }
        return packageName;
      }

      if (data.loading) return React.createElement('div', { className: 'pcs-root' }, React.createElement('div', { className: 'pcs-empty' }, '加载中…'));
      if (data.error) return React.createElement('div', { className: 'pcs-root' }, React.createElement('div', { className: 'pcs-error' }, '无法读取插件目录：' + data.error));

      var refreshBtn = React.createElement('button', { className: 'pcs-btn', disabled: refreshing, onClick: load }, refreshing ? '刷新中…' : '刷新');

      function tabBtn(key, label, count) {
        return React.createElement('button', { className: 'pcs-tab' + (tab === key ? ' active' : ''), onClick: function () { setTab(key); } },
          label,
          count > 0 ? React.createElement('span', { className: 'pcs-count' }, count) : null);
      }

      var tabs = React.createElement('div', { className: 'pcs-tabs' },
        tabBtn('installed', '已安装', data.installed.length),
        tabBtn('community', '插件社区', data.communityTotal),
        tabBtn('updates', '待更新', data.updates.length));

      var header = React.createElement('div', { className: 'pcs-row' },
        React.createElement('div', { className: 'pcs-title' }, '插件社区'),
        refreshBtn);

      // ---- 已安装 tab ----
      function installedTab() {
        if (data.installed.length === 0) return React.createElement('div', { className: 'pcs-empty' }, '暂无已安装插件。');
        return React.createElement('div', { className: 'pcs-root' },
          data.installed.map(function (it) {
            var isOfficial = it.source === 'official';
            var st = busy[it.id];
            var btns = isOfficial
              ? React.createElement('button', { className: 'pcs-btn uninstall', disabled: st === 'loading', onClick: function () { onUninstall(it.id); } }, st === 'loading' ? '加载中…' : '获取卸载提示词')
              : React.createElement('span', { className: 'pcs-hint' }, '社区安装');
            var prompt = (st && st.prompt) ? React.createElement(PromptBlock, { text: st.prompt }) : null;
            var err = (st && st.error) ? React.createElement('div', { className: 'pcs-error' }, st.error) : null;
            return React.createElement('div', { key: it.id, className: 'pcs-card' },
              React.createElement('div', { className: 'pcs-main' },
                React.createElement('div', { className: 'pcs-row' },
                  React.createElement('span', { className: 'pcs-name' }, titleOf(it.packageName)),
                  React.createElement('span', { className: 'pcs-badge' }, isOfficial ? '官方' : '社区')),
                React.createElement('div', { className: 'pcs-meta' },
                  React.createElement('span', { className: 'pcs-tag' }, it.packageName),
                  React.createElement('span', { className: 'pcs-ver' }, 'v' + it.installedVersion)),
                prompt,
                err),
              btns);
          }));
      }

      // ---- 待更新 tab ----
      function updatesTab() {
        if (data.updates.length === 0) return React.createElement('div', { className: 'pcs-empty' }, '所有插件均为最新版本。');
        return React.createElement('div', { className: 'pcs-root' },
          data.updates.map(function (u) {
            var ub = updateBusy[u.id];
            var right = React.createElement('button', { className: 'pcs-btn', disabled: ub === 'loading', onClick: function () { onUpdate(u.id); } }, ub === 'loading' ? '加载中…' : '获取更新提示词');
            var prompt = (ub && ub.prompt) ? React.createElement(PromptBlock, { text: ub.prompt }) : null;
            var err = (ub && ub.error) ? React.createElement('div', { className: 'pcs-error' }, ub.error) : null;
            return React.createElement('div', { key: u.id, className: 'pcs-card' },
              React.createElement('div', { className: 'pcs-main' },
                React.createElement('div', { className: 'pcs-row' },
                  React.createElement('span', { className: 'pcs-name' }, titleOf(u.packageName)),
                  React.createElement('span', { className: 'pcs-badge' }, u.source === 'official' ? '官方' : '社区')),
                React.createElement('div', { className: 'pcs-meta' },
                  React.createElement('span', { className: 'pcs-tag' }, u.packageName),
                  React.createElement('span', { className: 'pcs-ver' }, 'v' + u.installedVersion + ' → v' + u.latestVersion)),
                prompt,
                err),
              right);
          }));
      }

      // ---- 插件社区 tab ----
      var catMap = {};
      data.community.forEach(function (c) { if (c.category) catMap[c.category] = true; });
      var categories = Object.keys(catMap);
      var installedRepoIds = {};
      data.installed.forEach(function (it) { if (it.source === 'community' && it.repoId) installedRepoIds[it.repoId] = true; });
      var q = query.trim().toLowerCase();
      var filtered = data.community.filter(function (c) {
        if (installedRepoIds[c.id]) return false;
        if (category !== 'all' && c.category !== category) return false;
        if (!q) return true;
        return ((c.name || '') + ' ' + (c.description || '') + ' ' + (c.author || '') + ' ' + (c.id || '')).toLowerCase().indexOf(q) !== -1;
      });
      var sorted = filtered.slice().sort(function (a, b) {
        if (sort === 'updated') {
          var ta = a.updatedAt || ''; var tb = b.updatedAt || '';
          return ta < tb ? 1 : (ta > tb ? -1 : 0);
        }
        return (b.stars || 0) - (a.stars || 0);
      });

      function CommunityCard(props) {
        var c = props.repo;
        var st = props.status;
        var label = '获取安装提示词';
        var disabled = false;
        var prompt = null;
        var error = null;
        if (st === 'loading') { label = '加载中…'; disabled = true; }
        else if (st && st.prompt) { prompt = st.prompt; }
        else if (st && st.error) { label = '重试'; error = st.error; }
        return React.createElement('div', { className: 'pcs-card' },
          React.createElement('div', { className: 'pcs-main' },
            React.createElement('div', { className: 'pcs-row' },
              React.createElement('span', { className: 'pcs-name' }, c.name),
              React.createElement('span', { className: 'pcs-ver' }, '★ ' + c.stars)),
            React.createElement('div', { className: 'pcs-desc' }, lang === 'zh' ? (c.descZh || c.description) : c.description),
            React.createElement('div', { className: 'pcs-meta' },
              React.createElement('span', { className: 'pcs-author' }, c.author),
              React.createElement('span', { className: 'pcs-tag' }, c.category)),
            prompt ? React.createElement(PromptBlock, { text: prompt }) : null,
            error ? React.createElement('div', { className: 'pcs-error' }, error) : null),
          React.createElement('div', { className: 'pcs-row' },
            React.createElement('a', { className: 'pcs-link', href: c.htmlUrl, target: '_blank', rel: 'noreferrer' }, '仓库'),
            React.createElement('button', { className: 'pcs-btn', disabled: disabled, onClick: function () { props.onInstall(c); } }, label)));
      }

      var searchInput = React.createElement('input', { className: 'pcs-search', type: 'search', placeholder: '搜索社区插件（名称 / 简介 / 作者）…', value: query, onChange: function (ev) { setQuery(ev.target.value); } });
      var sortSelect = React.createElement('select', { className: 'pcs-select', value: sort, onChange: function (ev) { setSort(ev.target.value); } },
        React.createElement('option', { value: 'stars' }, '最多人安装'),
        React.createElement('option', { value: 'updated' }, '最近更新'));
      var langZh = React.createElement('button', { className: 'pcs-chip' + (lang === 'zh' ? ' active' : ''), onClick: function () { setLang('zh'); } }, '中文');
      var langEn = React.createElement('button', { className: 'pcs-chip' + (lang === 'en' ? ' active' : ''), onClick: function () { setLang('en'); } }, 'English');
      var chipAll = React.createElement('button', { className: 'pcs-chip' + (category === 'all' ? ' active' : ''), onClick: function () { setCategory('all'); } }, '全部');
      var chips = categories.map(function (cat) {
        return React.createElement('button', { key: cat, className: 'pcs-chip' + (category === cat ? ' active' : ''), onClick: function () { setCategory(cat); } }, cat);
      });

      var communityTab = React.createElement('div', { className: 'pcs-root' },
        React.createElement('div', { className: 'pcs-sub' }, '精选（官方）：点击「获取安装提示词」查看安装步骤。社区：实时同步 GitHub topic「dsh-plugin」。已装插件不再显示。'),
        data.entries.filter(function (e) { return !e.installed; }).map(function (e) {
          return React.createElement(Card, { key: e.id, entry: e, status: busy[e.id], onInstall: onInstall });
        }),
        React.createElement('div', { className: 'pcs-sub' }, '社区插件（' + data.communityTotal + '）'),
        data.communityError ? React.createElement('div', { className: 'pcs-error' }, '社区同步失败：' + data.communityError) : null,
        React.createElement('div', { className: 'pcs-toolbar' }, searchInput, sortSelect, langZh, langEn),
        React.createElement('div', { className: 'pcs-toolbar' }, chipAll, chips),
        sorted.map(function (c) {
          return React.createElement(CommunityCard, { key: c.id, repo: c, status: commBusy[c.id], onInstall: onCommunityInstall });
        }));

      var body = tab === 'installed' ? installedTab() : (tab === 'updates' ? updatesTab() : communityTab);

      return React.createElement('div', { className: 'pcs-root' },
        header,
        tabs,
        body);
    }

    function apply(ctx) {
      ctx.effect(function () {
        var tag = document.createElement('style');
        tag.dataset.plugin = '@deepseek-ai/dsh-plugin-community';
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return function () { tag.remove(); };
      }, 'plugin-community: styles');
      ctx.slots.inject('settings.section', function () {
        return ctx.slots.register(
          { name: 'settings.section', id: 'plugin-community', order: 16, label: '插件社区' },
          function () { return React.createElement(CommunitySection); });
      });
    }

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
