/* Stepper component — drives a horizontal step indicator (desktop) and the
 * compact mobile variant. Steps are described by an array of { id, labelKey }
 * passed during init. The component manages active/done state and panel
 * visibility (any element with id `panel-N` / `m-panel-N`).
 */
(function () {
  const CHECK_DESKTOP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12l5 5 9-11"/></svg>';
  const CHECK_MOBILE  = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 12l5 5 9-11"/></svg>';

  function create(opts) {
    const steps = opts.steps;
    const total = steps.length;
    let current = 1;

    function applyDesktop(n) {
      steps.forEach((step, idx) => {
        const i = idx + 1;
        const circle = document.getElementById('sc-' + i);
        const lineEl = document.getElementById('sl-' + i);
        if (!circle) return;
        circle.className = 'step-circle';
        if (i < n) {
          circle.classList.add('done');
          circle.innerHTML = CHECK_DESKTOP;
        } else if (i === n) {
          circle.classList.add('active');
          circle.textContent = i;
        } else {
          circle.textContent = i;
        }
        const lbl = circle.closest('.step-wrap')?.querySelector('.step-label');
        if (lbl) {
          lbl.className = 'step-label';
          if (i < n) lbl.classList.add('done');
          else if (i === n) lbl.classList.add('active');
        }
        if (lineEl && i < total) {
          lineEl.className = 'step-line' + (i < n ? ' done' : '');
        }
      });
      document.querySelectorAll('.desktop-wrap .step-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('panel-' + n);
      if (panel) panel.classList.add('active');
    }

    function applyMobile(n) {
      steps.forEach((step, idx) => {
        const i = idx + 1;
        const c = document.getElementById('m-sc-' + i);
        const lineEl = document.getElementById('m-sl-' + i);
        if (!c) return;
        c.className = 'm-step';
        if (i < n) {
          c.classList.add('done');
          c.innerHTML = CHECK_MOBILE;
        } else if (i === n) {
          c.classList.add('active');
          c.textContent = i;
        } else {
          c.textContent = i;
        }
        if (lineEl && i < total) {
          lineEl.className = 'm-line' + (i < n ? ' done' : '');
        }
      });
      document.querySelectorAll('.mobile-wrap .step-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('m-panel-' + n);
      if (panel) panel.classList.add('active');
      const titleEl = document.getElementById('m-step-title');
      if (titleEl && window.AppI18n) {
        titleEl.textContent = window.AppI18n.t(steps[n - 1].labelKey);
      }
    }

    function go(n) {
      current = Math.min(total, Math.max(1, n));
      applyDesktop(current);
      applyMobile(current);
      if (typeof opts.onChange === 'function') opts.onChange(current);
    }

    function next() { go(current + 1); }
    function back() { go(current - 1); }
    function get() { return current; }

    return { go, next, back, get };
  }

  window.AppStepper = { create };
})();
