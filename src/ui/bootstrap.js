// A classic entry script can report failures even when an ES module never loads.
(() => {
  const host = document.querySelector('#app');
  const showFailure = (message, error = '') => {
    if (!host.querySelector('.initial-loading')) return;
    const panel = document.createElement('div');
    panel.className = 'initial-loading';
    const title = document.createElement('h2'); title.textContent = message;
    const detail = document.createElement('p'); detail.textContent = error;
    const retry = document.createElement('button'); retry.className = 'button primary';
    retry.textContent = '重新加载'; retry.onclick = () => location.reload();
    panel.append(title, detail, retry);
    if (location.protocol === 'file:') {
      const link = document.createElement('a'); link.href = 'http://127.0.0.1:4173/';
      link.textContent = '打开本地网页预览'; panel.append(link);
    }
    host.replaceChildren(panel);
  };
  if (location.protocol === 'file:') {
    showFailure('请通过本地网页打开', '直接打开HTML文件会阻止模块加载，请点击下方本地预览链接。');
    return;
  }
  const timeout = setTimeout(() => showFailure('页面加载超时', '请检查本地服务是否运行，然后重新加载。'), 10000);
  import('./app-entry.js').then(() => clearTimeout(timeout)).catch(error => {
    clearTimeout(timeout);
    showFailure('页面加载失败', error.message || '脚本未能加载，请重新加载。');
  });
})();
