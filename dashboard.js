/* דשבורד יחידת הנוער */
const $ = (s) => document.querySelector(s);

let user = null;
let isAdmin = false;
let topics = [];

const esc = (s) =>
  String(s || '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const votesOf = (t) => (t.voters || []).length;
const STATUSES = ['חדש', 'בטיפול', 'אושר', 'נדחה'];

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.hidden = true), 2500);
}

Store.onAuth((u) => {
  user = u;
  isAdmin = !!u && ADMIN_EMAILS.includes(u.email);
  renderAuth();
  renderGate();
});

function renderAuth() {
  const area = $('#authArea');
  if (!user) {
    area.innerHTML = `<a class="btn-dash" href="index.html">לאתר</a>
      <button class="btn-login" id="loginBtn">כניסה עם Google</button>`;
    $('#loginBtn').addEventListener('click', () => Store.login());
    return;
  }
  area.innerHTML = `
    <a class="btn-dash" href="index.html">לאתר</a>
    ${user.photo ? `<img class="user-photo" src="${esc(user.photo)}" alt="">` : `<span class="user-photo user-initial">${esc(user.name[0])}</span>`}
    <button class="btn-logout" id="logoutBtn">יציאה</button>`;
  $('#logoutBtn').addEventListener('click', () => Store.logout());
}

function renderGate() {
  const gate = $('#gate');
  if (!user) {
    gate.hidden = false;
    $('#dashContent').hidden = true;
    gate.innerHTML = '<h2>כניסת מנהלים</h2><p>הדשבורד פתוח למנהלי יחידת הנוער בלבד. יש להתחבר למעלה.</p>';
    return;
  }
  if (!isAdmin) {
    gate.hidden = false;
    $('#dashContent').hidden = true;
    gate.innerHTML = '<h2>אין הרשאה</h2><p>החשבון ' + esc(user.email) + ' אינו מוגדר כמנהל. פנו למנהל המערכת להוספה.</p>';
    return;
  }
  gate.hidden = true;
  $('#dashContent').hidden = false;
  render();
}

Store.onTopics((list) => {
  topics = list;
  if (isAdmin) render();
});

function render() {
  const votes = topics.reduce((a, t) => a + votesOf(t), 0);
  const comments = topics.reduce((a, t) => a + (t.commentsCount || 0), 0);
  const chats = topics.reduce((a, t) => a + (t.chatCount || 0), 0);
  const week = topics.filter((t) => Date.now() - (t.createdAt || 0) < 7 * 864e5).length;
  $('#kTopics').textContent = topics.length;
  $('#kVotes').textContent = votes;
  $('#kComments').textContent = comments;
  $('#kChats').textContent = chats;
  $('#kWeek').textContent = week;

  const top = [...topics].sort((a, b) => votesOf(b) - votesOf(a)).slice(0, 5);
  const max = votesOf(top[0] || {}) || 1;
  $('#bars').innerHTML = top
    .map(
      (t) => `
    <div class="bar-row">
      <span class="name">${esc(t.title)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(votesOf(t) / max) * 100}%"></div></div>
      <b>${votesOf(t)}</b>
    </div>`
    )
    .join('');

  $('#rows').innerHTML = [...topics]
    .sort((a, b) => votesOf(b) - votesOf(a))
    .map(
      (t) => `
    <tr>
      <td class="t-title">${esc(t.title)}<small>${esc(t.authorName)} · ${esc(t.hood || 'שדרות')} · ${relTime(t.createdAt)}</small></td>
      <td class="tbl-num">${votesOf(t)}</td>
      <td class="tbl-num hide-m">${t.commentsCount || 0}</td>
      <td class="tbl-num hide-m">${t.chatCount || 0}</td>
      <td>
        <select data-id="${t.id}">
          ${STATUSES.map((s) => `<option ${s === (t.status || 'חדש') ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>`
    )
    .join('');

  document.querySelectorAll('#rows select').forEach((sel) =>
    sel.addEventListener('change', () => {
      Store.setStatus(sel.dataset.id, sel.value);
      toast('הסטטוס עודכן — מוצג עכשיו גם לנוער באתר');
    })
  );
}
