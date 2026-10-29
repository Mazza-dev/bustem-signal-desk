import { demoSignals, scoreSignal } from './score.js';

const KEY = 'bustem-signal-desk-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
let signals = load();
const save = () => localStorage.setItem(KEY, JSON.stringify(signals));
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = value => { try { const u = new URL(value); return ['http:','https:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
const link = (url, label) => { const safe = safeUrl(url); return safe ? `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener">${escapeHtml(label)} ↗</a>` : ''; };

function render() {
  const scored = signals.map(s => ({...s, result: scoreSignal(s)}));
  const order = {'Review now':0,'Research first':1,'Route internally':2,'Do not pitch yet':3};
  scored.sort((a,b) => (order[a.result.lane] - order[b.result.lane]) || (b.result.score - a.result.score));
  document.querySelector('#count').textContent = scored.length;
  document.querySelector('#review').textContent = scored.filter(s => s.result.lane === 'Review now').length;
  document.querySelector('#routed').textContent = scored.filter(s => ['Route internally','Do not pitch yet'].includes(s.result.lane)).length;
  document.querySelector('#queue').innerHTML = scored.length ? scored.map((s, i) => `
    <article class="signal">
      <div class="signal-top"><div><span class="lane ${s.result.lane.toLowerCase().replaceAll(' ','-')}">${escapeHtml(s.result.lane)}</span><span class="score">${s.result.score}/100</span></div><button class="remove" data-url="${escapeHtml(s.sourceUrl)}" aria-label="Remove ${escapeHtml(s.brand)}">Remove</button></div>
      <h3>${escapeHtml(s.brand)}</h3><p class="signal-person">${escapeHtml(s.person || 'Person to identify')} · ${escapeHtml(s.sourceDate || 'Date to verify')}</p>
      <p>${escapeHtml(s.issue)}</p><div class="links">${link(s.sourceUrl,'Public evidence')}${link(s.brandUrl,'Brand site')}</div>
      <div class="signal-bottom"><strong>Why</strong> ${escapeHtml(s.result.reasons.join(' · '))}</div>
      ${s.notes ? `<div class="signal-bottom"><strong>Check</strong> ${escapeHtml(s.notes)}</div>` : ''}
    </article>`).join('') : '<p class="empty">Load the researched examples or add a public post above.</p>';
  document.querySelectorAll('.remove').forEach(b => b.addEventListener('click', () => { signals = signals.filter(s => s.sourceUrl !== b.dataset.url); save(); render(); }));
}

document.querySelector('#signalForm').addEventListener('submit', e => {
  e.preventDefault();
  const s = Object.fromEntries(new FormData(e.currentTarget).entries());
  s.sourceUrl = safeUrl(s.sourceUrl);
  s.brandUrl = s.brandUrl ? safeUrl(s.brandUrl) : '';
  const m = document.querySelector('#formMessage');
  if (!s.sourceUrl) { m.textContent = 'Add a valid public source URL.'; return; }
  if (signals.some(x => x.sourceUrl === s.sourceUrl)) { m.textContent = 'That source is already in the queue.'; return; }
  signals.unshift(s); save(); render(); e.currentTarget.reset(); m.textContent = 'Added. Review the source before outreach.';
});
document.querySelector('#loadDemo').addEventListener('click', () => { signals = [...demoSignals]; save(); render(); });
document.querySelector('#clear').addEventListener('click', () => { signals = []; save(); render(); });
document.querySelector('#exportCsv').addEventListener('click', () => {
  const fields = ['brand','person','brandUrl','sourceUrl','sourceDate','sourceType','issue','evidence','channel','status','relationship','notes','score','lane'];
  const csv = [fields.join(','), ...signals.map(s => fields.map(k => { let v = ['score','lane'].includes(k) ? scoreSignal(s)[k] : (s[k] || ''); return '"'+String(v).replaceAll('"','""')+'"'; }).join(','))].join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download = 'bustem-brand-report-queue.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
render();
