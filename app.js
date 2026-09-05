const key = 'aqua-water-tracker-v1';
const today = new Date().toISOString().slice(0,10);
let state = JSON.parse(localStorage.getItem(key) || '{}');
if (state.date !== today) state = { date: today, goal: state.goal || 2000, entries: [] };
const $ = s => document.querySelector(s);
const total = () => state.entries.reduce((sum, e) => sum + e.amount, 0);
const save = () => localStorage.setItem(key, JSON.stringify(state));
const time = iso => new Intl.DateTimeFormat([], {hour:'numeric', minute:'2-digit'}).format(new Date(iso));
function render() {
  const ml = total(), pct = Math.min(100, Math.round((ml / state.goal) * 100));
  $('#total').textContent = ml.toLocaleString(); $('#goalText').textContent = state.goal.toLocaleString();
  $('#percent').textContent = `${pct}% of your goal`; $('#ring').style.setProperty('--progress', `${pct}%`);
  $('#message').textContent = pct >= 100 ? 'Goal reached — amazing!' : pct >= 50 ? 'You’re over halfway there.' : ml ? 'Nice start. Keep it flowing.' : 'Let’s take the first sip.';
  const list = $('#entries'); list.innerHTML = '';
  state.entries.slice().reverse().forEach(entry => { const li = document.createElement('li'); li.innerHTML = `<span class="drop">💧</span><div><strong>${entry.amount} ml</strong><small>${time(entry.time)}</small></div><button class="remove" aria-label="Remove ${entry.amount} ml">×</button>`; li.querySelector('button').onclick = () => { state.entries = state.entries.filter(e => e.id !== entry.id); save(); render(); }; list.append(li); });
  $('#empty').hidden = state.entries.length > 0;
}
function add(amount) { if (!Number.isFinite(amount) || amount < 1) return; state.entries.push({ id: crypto.randomUUID(), amount: Math.round(amount), time: Date.now() }); save(); render(); }
document.querySelectorAll('[data-amount]').forEach(button => button.onclick = () => add(+button.dataset.amount));
$('#customForm').onsubmit = event => { event.preventDefault(); add(+$('#customAmount').value); $('#customAmount').value = ''; };
$('#reset').onclick = () => { if (state.entries.length && confirm('Clear today’s water log?')) { state.entries = []; save(); render(); } };
$('#goalButton').onclick = () => { $('#goalInput').value = state.goal; $('#goalDialog').showModal(); };
$('#goalForm').onsubmit = event => { event.preventDefault(); const value = +$('#goalInput').value; if (value >= 250) { state.goal = value; save(); render(); $('#goalDialog').close(); } };
render();