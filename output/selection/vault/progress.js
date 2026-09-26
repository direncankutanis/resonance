(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const panel = document.createElement('section');
  panel.className = 'panel';
  panel.id = 'rule-progress';
  panel.setAttribute('aria-label', 'Rule progress');
  panel.innerHTML = '<div class="eyebrow">Follow your rule</div><ol class="row" style="list-style:none;padding:0" aria-label="Execution stages"><li class="badge" data-phase="reserve">1 · Reserve budget</li><li class="badge" data-phase="waiting">2 · Wait for condition</li><li class="badge" data-phase="queued">3 · Check execution</li><li class="badge" data-phase="result">4 · Outcome</li></ol><p id="progress-reason" role="status"></p><p id="progress-deadline" class="muted"></p>';
  $('workspace').querySelector('.grid').before(panel);
  let snapshot = { state: 'idle', step: 0, reserved: 0, reviewing: false };
  const terminal = state => ['completed', 'failed', 'expired', 'cancelled'].includes(state);
  function render() {
    const d = snapshot;
    const price = Number($('price').value);
    const valid = $('price').value.trim() !== '' && Number.isFinite(price) && price >= 1 && price <= 200;
    const stale = $('stale').checked;
    const phase = terminal(d.state) ? 'result' : d.state === 'idle' ? 'reserve' : d.state;
    for (const item of panel.querySelectorAll('[data-phase]')) {
      const current = item.dataset.phase === phase;
      if (current) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.style.background = current ? '#294e45' : 'transparent';
      item.style.borderColor = current ? '#d8eec2' : '#526571';
      item.style.fontWeight = current ? '700' : '400';
    }
    let reason;
    if (d.state === 'idle') reason = d.reviewing ? 'Review your limits. Nothing is reserved until you confirm.' : 'Start by reviewing a rule. No budget is reserved yet.';
    else if (terminal(d.state)) reason = { completed: 'Purchased once. This rule cannot spend again.', failed: 'Execution stopped. The reserved budget was returned.', expired: 'The deadline arrived. The reserved budget was returned.', cancelled: 'Cancelled before execution. The reserved budget was returned.' }[d.state];
    else if (!valid) reason = 'Enter a price from 1 to 200 before advancing. Invalid input does not advance time.';
    else if (d.step + 1 >= d.expires) reason = 'The next advance reaches the deadline. This rule will expire without buying.';
    else if (stale) reason = 'Price data is marked stale. The next advance will skip evaluation and execution, but time still advances.';
    else if (d.state === 'waiting') reason = Math.round(price * 100) <= d.limit ? 'The displayed price meets your limit. Advance to evaluate the condition and queue the purchase; no purchase happens yet.' : 'The displayed price is above your limit. Advancing will keep the rule waiting.';
    else reason = Math.round(price * 100) > d.limit ? 'The displayed price is now above your limit. The next execution check will stop the purchase and return the reserve.' : 'The purchase is queued. Advance to recheck the price, budget and deadline before buying.';
    $('progress-reason').textContent = reason;
    $('progress-deadline').textContent = d.expires == null ? 'Simulation steps are manual. No background purchases run.' : 'Current step ' + d.step + ' · Deadline step ' + d.expires + (terminal(d.state) ? ' · Rule closed.' : ' · ' + Math.max(0, d.expires - d.step) + ' advance(s) until expiry. Execution must happen before the deadline.');
  }
  window.addEventListener('resonance:vault-state', event => { snapshot = event.detail; render(); });
  $('price').addEventListener('input', render);
  $('stale').addEventListener('change', render);
  render();
})();
