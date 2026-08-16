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
      '.pcs-btn.done{background:transparent;color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary);}' +
      '.pcs-btn.staged{background:transparent;color:var(--dsw-alias-state-warn-primary);border-color:var(--dsw-alias-state-warn-primary);}' +
      '.pcs-hint{font-size:11px;color:var(--dsw-alias-label-secondary);line-height:1.4;}' +
      '.pcs-error{font-size:11px;color:var(--dsw-alias-state-error-primary);}' +
      '.pcs-empty{font-size:12px;color:var(--dsw-alias-label-secondary);}' +
      '.pcs-search{width:100%;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:7px 10px;font-size:12px;outline:none;}' +
      '.pcs-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;}' +
      '.pcs-chip{border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:3px 10px;font-size:11px;cursor:pointer;}' +
      '.pcs-chip.active{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary);}' +
      '.pcs-select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:8px;padding:6px 8px;font-size:12px;outline:none;}' +
      '.pcs-link{font-size:12px;color:var(--dsw-alias-brand-primary);text-decoration:none;cursor:pointer;}';

    var inject = ['slots'];

    function Card(props) {
      var e = props.entry;
      var st = props.status;
      var label = '一键安装';
      var cls = '';
      var disabled = false;
      var hint = null;
      var action = props.onInstall;
      if (e.installed) {
        action = props.onUninstall;
        if (st === 'uninstalling') { label = '卸载中…'; disabled = true; }
        else if (st && st.staged) { label = '待授权卸载'; cls = 'staged'; hint = '已生成部署补丁，需授权写入部署配置后热重载生效。'; }
        else if (st && st.error) { label = '重试'; hint = st.error; }
        else { label = '卸载'; cls = 'uninstall'; }
      } else {
        if (st === 'installing') { label = '安装中…'; disabled = true; }
        else if (st && st.staged) { label = '待授权部署'; cls = 'staged'; hint = '已生成部署补丁，需授权写入部署配置后热重载生效。'; }
        else if (st && st.error) { label = '重试'; hint = st.error; }
      }
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
          hint ? React.createElement('div', { className: 'pcs-hint' }, hint) : null),
        React.createElement('button', { className: 'pcs-btn ' + cls, disabled: disabled, onClick: function () { action(e.id); } }, label));
    }

    function CommunitySection() {
      var state = React.useState({ loading: true, entries: [], community: [], communityTotal: 0, communityError: null, error: null });
      var data = state[0];
      var setData = state[1];
      var busyState = React.useState({});
      var busy = busyState[0];
      var setBusy = busyState[1];
      var refreshingState = React.useState(false);
      var refreshing = refreshingState[0];
      var setRefreshing = refreshingState[1];
      var queryState = React.useState('');
      var query = queryState[0];
      var setQuery = queryState[1];
      var categoryState = React.useState('all');
      var category = categoryState[0];
      var setCategory = categoryState[1];
      var sortState = React.useState('stars');
      var sort = sortState[0];
      var setSort = sortState[1];
      var commBusyState = React.useState({});
      var commBusy = commBusyState[0];
      var setCommBusy = commBusyState[1];

      function load() {
        setRefreshing(true);
        fetch('/plugin-community/list').then(function (r) { return r.json(); }).then(function (res) {
          setData({ loading: false, entries: (res && res.entries) || [], community: (res && res.community) || [], communityTotal: (res && res.communityTotal) || 0, communityError: (res && res.communityError) || null, error: null });
          setRefreshing(false);
        }).catch(function (err) {
          setData({ loading: false, entries: [], community: [], communityTotal: 0, communityError: null, error: String(err && err.message ? err.message : err) });
          setRefreshing(false);
        });
      }

      React.useEffect(function () {
        load();
        return function () {};
      }, []);

      function post(path, id) {
        return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: id }) }).then(function (r) { return r.json(); });
      }

      function onInstall(id) {
        setBusy(function (b) { return Object.assign({}, b, { [id]: 'installing' }); });
        post('/plugin-community/install', id).then(function (res) {
          if (res && res.applied) {
            setData(function (d) { return Object.assign({}, d, { entries: d.entries.map(function (e) { return e.id === id ? Object.assign({}, e, { installed: true }) : e; }) }); });
            setBusy(function (b) { return Object.assign({}, b, { [id]: null }); });
          } else if (res && res.staged) {
            setBusy(function (b) { return Object.assign({}, b, { [id]: { staged: true, stagedPath: res.stagedPath } }); });
          } else {
            var m = (res && (res.error || res.stageError)) || '安装失败';
            setBusy(function (b) { return Object.assign({}, b, { [id]: { error: m } }); });
          }
        }).catch(function (err) {
          setBusy(function (b) { return Object.assign({}, b, { [id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      function onUninstall(id) {
        setBusy(function (b) { return Object.assign({}, b, { [id]: 'uninstalling' }); });
        post('/plugin-community/uninstall', id).then(function (res) {
          if (res && res.removed) {
            setData(function (d) { return Object.assign({}, d, { entries: d.entries.map(function (e) { return e.id === id ? Object.assign({}, e, { installed: false }) : e; }) }); });
            setBusy(function (b) { return Object.assign({}, b, { [id]: null }); });
          } else if (res && res.staged) {
            setBusy(function (b) { return Object.assign({}, b, { [id]: { staged: true, stagedPath: res.stagedPath } }); });
          } else {
            var m2 = (res && (res.error || res.stageError)) || '卸载失败';
            setBusy(function (b) { return Object.assign({}, b, { [id]: { error: m2 } }); });
          }
        }).catch(function (err) {
          setBusy(function (b) { return Object.assign({}, b, { [id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      function onCommunityInstall(repo) {
        setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: 'installing' }); });
        fetch('/plugin-community/install-community', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: repo.id, defaultBranch: repo.defaultBranch }) }).then(function (r) { return r.json(); }).then(function (res) {
          if (res && res.applied) {
            setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { done: true, packageName: res.packageName } }); });
          } else if (res && res.staged) {
            setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { staged: true, stagedPath: res.stagedPath } }); });
          } else {
            var m3 = (res && (res.error || res.stageError)) || '安装失败';
            setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { error: m3 } }); });
          }
        }).catch(function (err) {
          setCommBusy(function (b) { return Object.assign({}, b, { [repo.id]: { error: String(err && err.message ? err.message : err) } }); });
        });
      }

      if (data.loading) return React.createElement('div', { className: 'pcs-root' }, React.createElement('div', { className: 'pcs-empty' }, '加载中…'));
      if (data.error) return React.createElement('div', { className: 'pcs-root' }, React.createElement('div', { className: 'pcs-error' }, '无法读取插件目录：' + data.error));

      var catMap = {};
      data.community.forEach(function (c) { if (c.category) catMap[c.category] = true; });
      var categories = Object.keys(catMap);
      var q = query.trim().toLowerCase();
      var filtered = data.community.filter(function (c) {
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
        var label = '一键安装';
        var cls = '';
        var disabled = false;
        var hint = null;
        if (st === 'installing') { label = '安装中…'; disabled = true; }
        else if (st && st.done) { label = '已安装'; cls = 'done'; disabled = true; hint = st.packageName ? ('已写入 ' + st.packageName) : null; }
        else if (st && st.staged) { label = '待授权'; cls = 'staged'; hint = '已生成补丁，需授权写入部署配置。'; }
        else if (st && st.error) { label = '重试'; hint = st.error; }
        return React.createElement('div', { className: 'pcs-card' },
          React.createElement('div', { className: 'pcs-main' },
            React.createElement('div', { className: 'pcs-row' },
              React.createElement('span', { className: 'pcs-name' }, c.name),
              React.createElement('span', { className: 'pcs-ver' }, '★ ' + c.stars)),
            React.createElement('div', { className: 'pcs-desc' }, c.description),
            React.createElement('div', { className: 'pcs-meta' },
              React.createElement('span', { className: 'pcs-author' }, c.author),
              React.createElement('span', { className: 'pcs-tag' }, c.category)),
            hint ? React.createElement('div', { className: 'pcs-hint' }, hint) : null),
          React.createElement('div', { className: 'pcs-row' },
            React.createElement('a', { className: 'pcs-link', href: c.htmlUrl, target: '_blank', rel: 'noreferrer' }, '仓库'),
            React.createElement('button', { className: 'pcs-btn ' + cls, disabled: disabled, onClick: function () { props.onInstall(c); } }, label)));
      }

      var refreshBtn = React.createElement('button', { className: 'pcs-btn', disabled: refreshing, onClick: load }, refreshing ? '刷新中…' : '刷新');
      var searchInput = React.createElement('input', { className: 'pcs-search', type: 'search', placeholder: '搜索社区插件（名称 / 简介 / 作者）…', value: query, onChange: function (ev) { setQuery(ev.target.value); } });
      var sortSelect = React.createElement('select', { className: 'pcs-select', value: sort, onChange: function (ev) { setSort(ev.target.value); } },
        React.createElement('option', { value: 'stars' }, '最多人安装'),
        React.createElement('option', { value: 'updated' }, '最近更新'));
      var chipAll = React.createElement('button', { className: 'pcs-chip' + (category === 'all' ? ' active' : ''), onClick: function () { setCategory('all'); } }, '全部');
      var chips = categories.map(function (cat) {
        return React.createElement('button', { key: cat, className: 'pcs-chip' + (category === cat ? ' active' : ''), onClick: function () { setCategory(cat); } }, cat);
      });

      return React.createElement('div', { className: 'pcs-root' },
        React.createElement('div', { className: 'pcs-row' },
          React.createElement('div', { className: 'pcs-title' }, '插件社区'),
          refreshBtn),
        React.createElement('div', { className: 'pcs-sub' }, '精选：一键安装/卸载写入 cordis.patch.yml。社区：实时同步 GitHub topic「dsh-plugin」。'),
        data.entries.map(function (e) {
          return React.createElement(Card, { key: e.id, entry: e, status: busy[e.id], onInstall: onInstall, onUninstall: onUninstall });
        }),
        React.createElement('div', { className: 'pcs-sub' }, '社区插件（' + data.communityTotal + '）'),
        data.communityError ? React.createElement('div', { className: 'pcs-error' }, '社区同步失败：' + data.communityError) : null,
        React.createElement('div', { className: 'pcs-toolbar' }, searchInput, sortSelect),
        React.createElement('div', { className: 'pcs-toolbar' }, chipAll, chips),
        sorted.map(function (c) {
          return React.createElement(CommunityCard, { key: c.id, repo: c, status: commBusy[c.id], onInstall: onCommunityInstall });
        }));
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
