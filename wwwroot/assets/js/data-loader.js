/* Demo data loader — fetches JSON files from /demo, with a fallback for file://
 * environments where fetch() can't read local resources. Each call returns a
 * Promise so the caller can use the data once it's ready. */
(function () {
  const cache = new Map();

  function fetchJson(path) {
    if (cache.has(path)) return cache.get(path);
    const promise = fetch(path)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(err => {
        // file:// or offline — fall back to data exposed on window.AppData
        const key = path.split('/').pop().replace(/\.json$/, '');
        if (window.AppData && window.AppData[key]) return window.AppData[key];
        console.warn('[data-loader] failed for', path, err.message);
        return null;
      });
    cache.set(path, promise);
    return promise;
  }

  function load(name) { return fetchJson('demo/' + name + '.json'); }

  /** Convenience: load multiple files in parallel. */
  function loadAll(names) {
    return Promise.all(names.map(n => load(n))).then(values => {
      const out = {};
      names.forEach((n, i) => { out[n] = values[i]; });
      return out;
    });
  }

  /** Allow pages to provide an inline fallback so they still work via file://. */
  function provide(name, data) {
    window.AppData = window.AppData || {};
    window.AppData[name] = data;
  }

  window.AppData = window.AppData || {};
  window.AppDataLoader = { load, loadAll, provide };
})();
