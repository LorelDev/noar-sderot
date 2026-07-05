/* רעיונוער · הרשת החברתית של הרעיונות */
const $ = (s) => document.querySelector(s);

/* עדכון אוטומטי — כשעולה גרסה חדשה, הדף מרענן את עצמו */
const APP_V = 10;
async function checkVersion() {
  try {
    const r = await fetch('version.json?ts=' + Date.now(), { cache: 'no-store' });
    const j = await r.json();
    const last = +sessionStorage.getItem('noar-reloaded') || 0;
    if (j.v > APP_V && Date.now() - last > 60000) {
      sessionStorage.setItem('noar-reloaded', Date.now());
      location.reload();
    }
  } catch { /* אין רשת — לא נורא */ }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });
setInterval(checkVersion, 90000);
checkVersion();

/* רטט עדין באנדרואיד — תחושת אפליקציה */
const buzz = () => { if (navigator.vibrate) navigator.vibrate(8); };

let user = null;
let isAdmin = false;
let topics = [];
let openId = null;
let comments = [];
let chat = [];
let sortBy = 'hot';
let filterCat = 'הכל';
let statusFilter = '';
let searchQ = '';
let newCat = 'אחר';
let unsubComments = null;
let unsubChat = null;
let loaded = false;
let deepLinked = false;

const CATEGORIES = ['אירועים', 'ספורט', 'תרבות', 'חינוך', 'סביבה', 'תשתיות', 'אחר'];
const AVATAR_COLORS = ['#2b3990', '#e63946', '#1e8c46', '#0f7fae', '#7a2f7d', '#b47d00'];

const esc = (s) =>
  String(s || '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const votesOf = (t) => (t.voters || []).length;
const votedBy = (t) => user && (t.voters || []).includes(user.email);
const savedBy = (t) => user && (t.savers || []).includes(user.email);
const isStaff = (email) => ADMIN_EMAILS.includes(email);
const officialTag = '<span class="official">יחידת הנוער</span>';
const catOf = (t) => t.category || 'אחר';
const avatarColor = (name) => AVATAR_COLORS[(String(name || 'א').charCodeAt(0) || 0) % AVATAR_COLORS.length];

const STATUS_COLORS = { 'חדש': 'st-new', 'בטיפול': 'st-progress', 'אושר': 'st-ok', 'נדחה': 'st-no' };

const ICONS = {
  up: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M12 4 4 14h5v6h6v-6h5L12 4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M21 12a8 8 0 0 1-8 8H4l1.7-3.4A8 8 0 1 1 21 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><circle cx="6" cy="12" r="2.6" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="5.5" r="2.6" stroke="currentColor" stroke-width="1.8"/><circle cx="17.5" cy="18.5" r="2.6" stroke="currentColor" stroke-width="1.8"/><path d="m8.4 10.8 6.8-4M8.4 13.2l6.8 4" stroke="currentColor" stroke-width="1.8"/></svg>',
  save: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none"><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
};

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.hidden = true), 2800);
}

/* ─── התחברות והיררכיה ─── */
Store.onAuth((u) => {
  user = u;
  isAdmin = !!u && isStaff(u.email);
  renderAuth();
  renderComposer();
  renderCatBar();
  renderWelcome();
  renderList();
  if (openId) renderTopicHead();
});

/* ─── כרטיס פתיחה — רק למי שלא מחובר, נסגר לתמיד ─── */
function renderWelcome() {
  $('#welcomeCard').hidden = !!user || localStorage.getItem('noar-welcome-closed') === '1';
}
$('#welcomeX').addEventListener('click', () => {
  localStorage.setItem('noar-welcome-closed', '1');
  $('#welcomeCard').hidden = true;
});
$('#welcomeLogin').addEventListener('click', () => doLogin());

/* ─── חיפוש מתקפל במובייל ─── */
$('#searchWrap').addEventListener('click', () => {
  const w = $('#searchWrap');
  if (window.innerWidth <= 760 && !w.classList.contains('open')) {
    w.classList.add('open');
    setTimeout(() => $('#searchInput').focus(), 250);
  }
});
$('#searchInput').addEventListener('blur', () => {
  if (window.innerWidth <= 760 && !$('#searchInput').value.trim()) {
    $('#searchWrap').classList.remove('open');
  }
});

function renderAuth() {
  const area = $('#authArea');
  if (!user) {
    area.innerHTML = `<button class="btn-login" id="loginBtn">כניסה עם Google</button>`;
    $('#loginBtn').addEventListener('click', doLogin);
    return;
  }
  area.innerHTML = `
    ${isAdmin ? '<a class="btn-dash" href="dashboard.html">דשבורד ניהול</a>' : ''}
    <span class="user-chip">
      ${user.photo ? `<img class="user-photo" src="${esc(user.photo)}" alt="">` : `<span class="user-initial">${esc(user.name[0])}</span>`}
      <span class="user-name">${esc(user.name)}</span>
      ${isAdmin ? '<span class="role-chip">מנהל</span>' : ''}
    </span>
    <button class="btn-logout" id="logoutBtn">יציאה</button>`;
  $('#logoutBtn').addEventListener('click', () => Store.logout());
}

function renderComposer() {
  const av = $('#composerAvatar');
  if (user && user.photo) av.innerHTML = `<img src="${esc(user.photo)}" alt="">`;
  else av.textContent = user ? user.name[0] : '?';
  $('#composerBtn').textContent = user
    ? `מה הרעיון שלך, ${user.name.split(' ')[0]}?`
    : 'מה הרעיון שלך לשדרות?';
}

function doLogin() {
  Store.login().catch(() => toast('ההתחברות נכשלה, נסו שוב'));
}
function requireLogin() {
  if (user) return true;
  toast('צריך להתחבר עם Google כדי להשתתף');
  return false;
}

/* ─── נתונים חיים ─── */
Store.onTopics((list) => {
  topics = list;
  loaded = true;
  renderList();
  renderStats();
  renderLeaders();
  renderStatusFlow();
  if (openId) renderTopicHead();
  if (!deepLinked && location.hash.startsWith('#t=')) {
    deepLinked = true;
    const id = location.hash.slice(3);
    if (topics.some((t) => t.id === id)) showTopic(id);
  }
});

/* ─── סטטיסטיקות ─── */
const statPrev = { topics: 0, votes: 0, comments: 0 };
function renderStats() {
  const totals = {
    topics: topics.length,
    votes: topics.reduce((a, t) => a + votesOf(t), 0),
    comments: topics.reduce((a, t) => a + (t.commentsCount || 0), 0),
  };
  Object.entries(totals).forEach(([key, val]) => {
    const el = document.querySelector(`[data-stat="${key}"]`);
    if (!el) return;
    const from = statPrev[key];
    statPrev[key] = val;
    if (from === val) { el.textContent = val; return; }
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min(1, (now - t0) / 700);
      el.textContent = Math.round(from + (val - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

/* ─── מובילים ─── */
function renderLeaders() {
  const top = [...topics].sort((a, b) => votesOf(b) - votesOf(a)).slice(0, 3);
  $('#leaders').innerHTML = top.length
    ? top
        .map(
          (t, i) => `
      <div class="leader" data-open="${t.id}">
        <span class="leader-rank">${i + 1}</span>
        <span class="leader-title">${esc(t.title)}</span>
        <span class="leader-votes">${votesOf(t)} בעד</span>
      </div>`
        )
        .join('')
    : '<p class="no-comments">ברגע שיהיו פוסטים — הם יופיעו כאן.</p>';
}

/* ─── זרימת סטטוסים חיה (לחיצה מסננת את הפיד) ─── */
const STATUS_META = [
  ['חדש', 'נפתח וממתין לצוות'],
  ['בטיפול', 'יחידת הנוער על זה'],
  ['אושר', 'יוצא לדרך'],
  ['נדחה', 'עם הסבר, תמיד'],
];
function renderStatusFlow() {
  const el = $('#statusFlow');
  if (!el) return;
  el.innerHTML =
    STATUS_META.map(([s, d]) => {
      const n = topics.filter((t) => (t.status || 'חדש') === s).length;
      return `
      <button class="status-row ${statusFilter === s ? 'active' : ''}" data-status="${s}">
        <span class="status ${STATUS_COLORS[s]}">${s}</span>
        <span class="status-desc">${d}</span>
        <b class="status-count">${n}</b>
      </button>`;
    }).join('') +
    `<p class="status-hint">${statusFilter ? 'לחיצה נוספת מבטלת את הסינון' : 'לחיצה על סטטוס מסננת את הפיד'}</p>`;
}

/* ─── הדגשת צעדים מתחלפת ─── */
let stepIdx = 1;
let stepPause = 0;
setInterval(() => {
  const steps = document.querySelectorAll('.step');
  if (!steps.length || document.hidden || Date.now() < stepPause) return;
  steps.forEach((s, i) => s.classList.toggle('lit', i === stepIdx));
  stepIdx = (stepIdx + 1) % steps.length;
}, 2400);

/* ─── סרגל קטגוריות ─── */
function renderCatBar() {
  const chips = ['הכל', ...CATEGORIES];
  if (user) chips.push('שלי', 'שמורים');
  $('#catBar').innerHTML = chips
    .map((c) => `<button class="cat-chip ${c === filterCat ? 'active' : ''}" data-cat="${c}">${c}</button>`)
    .join('');
}

/* ─── פיד ─── */
function visibleTopics() {
  let list = [...topics];
  if (filterCat === 'שלי') list = list.filter((t) => user && t.authorEmail === user.email);
  else if (filterCat === 'שמורים') list = list.filter((t) => savedBy(t));
  else if (filterCat !== 'הכל') list = list.filter((t) => catOf(t) === filterCat);
  if (statusFilter) list = list.filter((t) => (t.status || 'חדש') === statusFilter);
  if (searchQ) list = list.filter((t) => (t.title + ' ' + (t.body || '') + ' ' + t.authorName).includes(searchQ));
  return list.sort((a, b) =>
    sortBy === 'hot' ? votesOf(b) - votesOf(a)
    : sortBy === 'talked' ? (b.commentsCount || 0) - (a.commentsCount || 0)
    : (b.createdAt || 0) - (a.createdAt || 0)
  );
}

function avatarHtml(t) {
  return t.authorPhoto
    ? `<span class="pavatar"><img src="${esc(t.authorPhoto)}" alt=""></span>`
    : `<span class="pavatar" style="background:${avatarColor(t.authorName)}">${esc((t.authorName || 'א')[0])}</span>`;
}

function postHead(t) {
  return `
    <header class="post-head">
      ${avatarHtml(t)}
      <div class="post-who">
        <div class="post-name">${esc(t.authorName)} ${isStaff(t.authorEmail) ? officialTag : ''}</div>
        <div class="post-sub">${relTime(t.createdAt)} · <span class="cat cat-${catOf(t)}">${catOf(t)}</span> · <span class="status ${STATUS_COLORS[t.status] || 'st-new'}">${esc(t.status || 'חדש')}</span></div>
      </div>
    </header>`;
}

function actionsBar(t) {
  const voted = votedBy(t);
  const saved = savedBy(t);
  return `
    <footer class="post-actions">
      <button class="pact pact-vote ${voted ? 'on' : ''}" data-vote="${t.id}">${ICONS.up}<b>${votesOf(t)}</b> בעד</button>
      <button class="pact" data-comments="${t.id}">${ICONS.chat}<b>${t.commentsCount || 0}</b> תגובות</button>
      <button class="pact" data-share="${t.id}">${ICONS.share} שיתוף</button>
      <button class="pact ${saved ? 'on' : ''}" data-save="${t.id}">${ICONS.save} ${saved ? 'נשמר' : 'שמירה'}</button>
    </footer>`;
}

let firstRender = true;
function renderList(animate) {
  if (!loaded) return;
  $('#topicList').classList.toggle('animate', !!animate || firstRender);
  firstRender = false;
  const list = visibleTopics();
  $('#topicList').innerHTML = list.length
    ? list
        .map(
          (t) => `
      <article class="post" data-id="${t.id}">
        <div class="post-inner" data-open-post="${t.id}">
          ${postHead(t)}
          <h2 class="post-title">${esc(t.title)}</h2>
          ${t.body ? `<p class="post-body">${esc(t.body)}</p>` : ''}
        </div>
        ${actionsBar(t)}
      </article>`
        )
        .join('')
    : `<p class="no-comments">${
        filterCat === 'שלי' ? 'עוד לא פרסמתם פוסט. זה הזמן.' :
        filterCat === 'שמורים' ? 'אין פוסטים שמורים. לחצו "שמירה" על פוסט כדי לחזור אליו.' :
        searchQ ? 'לא נמצא כלום. נסו חיפוש אחר.' :
        'עוד אין פוסטים בקטגוריה הזו. פתחו את הראשון.'
      }</p>`;
}

/* ─── פוסט בודד ─── */
function renderTopicHead() {
  const t = topics.find((x) => x.id === openId);
  if (!t) return;
  const voted = votedBy(t);
  const saved = savedBy(t);
  $('#topicDetail').innerHTML = `
    <div class="detail">
      ${postHead(t)}
      <h2 class="post-title">${esc(t.title)}</h2>
      ${t.body ? `<p class="body">${esc(t.body)}</p>` : ''}
      <div class="detail-actions">
        <button class="vote-big ${voted ? 'voted' : ''}" data-vote="${t.id}">${ICONS.up}<b>${votesOf(t)}</b> ${voted ? 'הצבעת בעד' : 'מצביעים בעד'}</button>
        <button class="vote-big" data-share="${t.id}">${ICONS.share} שיתוף</button>
        <button class="vote-big ${saved ? 'voted' : ''}" data-save="${t.id}">${ICONS.save} ${saved ? 'נשמר' : 'שמירה'}</button>
      </div>
    </div>`;
}

function renderComments() {
  $('#commentsHead').textContent = comments.length ? `תגובות (${comments.length})` : 'תגובות';
  $('#commentList').innerHTML = comments.length
    ? comments
        .map((c) => {
          const staff = isStaff(c.email);
          return `
      <div class="comment ${staff ? 'comment-official' : ''}">
        <div class="comment-author"><b>${esc(c.author)}</b>${staff ? officialTag : ''}</div>
        <p>${esc(c.text)}</p>
        <small>${relTime(c.createdAt)}</small>
      </div>`;
        })
        .join('')
    : '<p class="no-comments">עוד אין תגובות. תהיו ראשונים.</p>';
}

function renderChat(thinking) {
  const thread = $('#chatThread');
  thread.innerHTML =
    chat
      .map(
        (m) => `
    <div class="bubble ${m.role === 'bot' ? 'bubble-bot' : 'bubble-user'}">
      <b>${m.role === 'bot' ? 'היועץ' : esc(m.name)}</b>
      <p>${esc(m.text).replace(/\n/g, '<br>')}</p>
    </div>`
      )
      .join('') +
    (thinking ? '<div class="bubble bubble-bot bubble-thinking"><b>היועץ</b><p>חושב...</p></div>' : '') ||
    '<p class="no-comments">אף אחד עוד לא התייעץ על הפוסט הזה. תהיו ראשונים.</p>';
  thread.scrollTop = thread.scrollHeight;
}

function showTopic(id) {
  openId = id;
  history.replaceState(null, '', '#t=' + id);
  if (unsubComments) unsubComments();
  if (unsubChat) unsubChat();
  comments = [];
  chat = [];
  unsubComments = Store.onComments(id, (c) => { comments = c; renderComments(); });
  unsubChat = Store.onChat(id, (c) => { chat = c; renderChat(); });
  renderTopicHead();
  $('#view-list').hidden = true;
  $('#view-topic').hidden = false;
  window.scrollTo(0, 0);
}

function showList() {
  openId = null;
  history.replaceState(null, '', location.pathname);
  if (unsubComments) unsubComments();
  if (unsubChat) unsubChat();
  unsubComments = unsubChat = null;
  $('#view-topic').hidden = true;
  $('#view-list').hidden = false;
  renderList();
  window.scrollTo(0, 0);
}

/* ─── שיתוף ושמירה ─── */
function shareTopic(id) {
  const t = topics.find((x) => x.id === id);
  const url = location.origin + location.pathname + '#t=' + id;
  if (navigator.share) {
    navigator.share({ title: t.title, text: t.title + ' · רעיונוער', url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(
      () => toast('הקישור הועתק — שתפו איפה שבא לכם'),
      () => toast(url)
    );
  }
}

/* ─── קליקים ─── */
document.addEventListener('click', (e) => {
  const voteBtn = e.target.closest('[data-vote]');
  if (voteBtn) {
    e.stopPropagation();
    if (!requireLogin()) return;
    buzz();
    Store.toggleVote(voteBtn.dataset.vote, user.email);
    return;
  }
  const saveBtn = e.target.closest('[data-save]');
  if (saveBtn) {
    e.stopPropagation();
    if (!requireLogin()) return;
    const t = topics.find((x) => x.id === saveBtn.dataset.save);
    Store.toggleSave(saveBtn.dataset.save, user.email, savedBy(t));
    if (!savedBy(t)) toast('נשמר — תמצאו את זה בסינון "שמורים"');
    return;
  }
  const shareBtn = e.target.closest('[data-share]');
  if (shareBtn) {
    e.stopPropagation();
    shareTopic(shareBtn.dataset.share);
    return;
  }
  const catChip = e.target.closest('[data-cat]');
  if (catChip) {
    buzz();
    filterCat = catChip.dataset.cat;
    renderCatBar();
    renderList(true);
    return;
  }
  const statusRow = e.target.closest('[data-status]');
  if (statusRow) {
    buzz();
    statusFilter = statusFilter === statusRow.dataset.status ? '' : statusRow.dataset.status;
    renderStatusFlow();
    renderList(true);
    if (statusFilter) toast('הפיד מסונן: ' + statusFilter);
    return;
  }
  const step = e.target.closest('.step');
  if (step) {
    stepPause = Date.now() + 9000;
    document.querySelectorAll('.step').forEach((s) => s.classList.toggle('lit', s === step));
    return;
  }
  const opener = e.target.closest('[data-open], [data-open-post], [data-comments]');
  if (opener) {
    showTopic(opener.dataset.open || opener.dataset.openPost || opener.dataset.comments);
    if (opener.dataset.comments) setTimeout(() => $('#commentInput').focus(), 350);
  }
});

$('#backBtn').addEventListener('click', showList);
$('#heroHow').addEventListener('click', () => $('#howCard').scrollIntoView({ behavior: 'smooth', block: 'center' }));
$('#searchInput').addEventListener('input', (e) => {
  searchQ = e.target.value.trim();
  renderList(true);
});

document.querySelectorAll('.sort').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('.sort').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    sortBy = b.dataset.sort;
    renderList(true);
  })
);

/* ─── תגובות ─── */
$('#commentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (!requireLogin()) return;
  const text = $('#commentInput').value.trim();
  if (!text) return;
  Store.addComment(openId, { author: user.name, email: user.email, text });
  $('#commentInput').value = '';
});

/* ─── פוסט חדש (נוער ומנהלים) ─── */
function renderCatPick() {
  $('#catPick').innerHTML = CATEGORIES.map(
    (c) => `<button type="button" class="cat-chip ${c === newCat ? 'active' : ''}" data-pick="${c}">${c}</button>`
  ).join('');
  document.querySelectorAll('[data-pick]').forEach((b) =>
    b.addEventListener('click', () => { newCat = b.dataset.pick; renderCatPick(); })
  );
}
function openNewSheet() {
  if (!requireLogin()) return;
  newCat = 'אחר';
  renderCatPick();
  $('#backdrop').hidden = false;
  $('#newSheet').hidden = false;
  $('#newTitle').focus();
}
$('#heroNew').addEventListener('click', openNewSheet);
$('#composerBtn').addEventListener('click', openNewSheet);
$('#fab').addEventListener('click', openNewSheet);
$('#stepCta').addEventListener('click', openNewSheet);
$('#backdrop').addEventListener('click', closeSheets);
function closeSheets() {
  $('#backdrop').hidden = true;
  $('#newSheet').hidden = true;
  $('#profileSheet').hidden = true;
}

/* ─── טאב-בר (מובייל) ─── */
function setTab(name) {
  document.querySelectorAll('.tabbtn').forEach((b) =>
    b.classList.toggle('active', b.dataset.tab === name)
  );
}
document.querySelectorAll('.tabbtn').forEach((btn) =>
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    buzz();
    if (tab === 'new') { openNewSheet(); return; }
    if (tab === 'profile') { openProfile(); return; }
    closeSheets();
    if (tab === 'home') filterCat = 'הכל';
    if (tab === 'saved') { if (!requireLogin()) return; filterCat = 'שמורים'; }
    if (tab === 'mine') { if (!requireLogin()) return; filterCat = 'שלי'; }
    setTab(tab);
    renderCatBar();
    if (openId) showList();
    else { renderList(true); window.scrollTo({ top: 0, behavior: 'instant' }); }
  })
);

/* ─── פרופיל ─── */
function openProfile() {
  const box = $('#profileContent');
  if (!user) {
    box.innerHTML = `
      <div class="profile-login">
        <h2>מתחברים ומשתתפים</h2>
        <p>כניסה עם חשבון Google — בלי סיסמאות ובלי הרשמה.</p>
        <button class="btn-primary" id="profileLogin">כניסה עם Google</button>
      </div>`;
    $('#profileLogin').addEventListener('click', () => { closeSheets(); doLogin(); });
  } else {
    const mine = topics.filter((t) => t.authorEmail === user.email);
    const myVotes = topics.filter((t) => votedBy(t)).length;
    const mySaved = topics.filter((t) => savedBy(t)).length;
    box.innerHTML = `
      <div class="profile-head">
        <span class="profile-avatar">${user.photo ? `<img src="${esc(user.photo)}" alt="">` : esc(user.name[0])}</span>
        <div>
          <b>${esc(user.name)} ${isAdmin ? '<span class="role-chip">מנהל</span>' : ''}</b>
          <small>${esc(user.email)}</small>
        </div>
      </div>
      <div class="profile-stats">
        <div class="profile-stat"><b>${mine.length}</b><span>פוסטים</span></div>
        <div class="profile-stat"><b>${myVotes}</b><span>הצבעות</span></div>
        <div class="profile-stat"><b>${mySaved}</b><span>שמורים</span></div>
      </div>
      <div class="profile-menu">
        ${isAdmin ? `<a class="profile-item" href="dashboard.html">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none"><rect x="3" y="3" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3" width="8" height="6" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="11" width="8" height="10" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="15" width="8" height="6" rx="2" stroke="currentColor" stroke-width="1.8"/></svg>
          דשבורד ניהול יחידת הנוער</a>` : ''}
        <button class="profile-item" data-profile-go="שלי">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none"><path d="M4 6h16M4 12h16M4 18h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          הפוסטים שלי</button>
        <button class="profile-item" data-profile-go="שמורים">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none"><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
          פוסטים שמורים</button>
        <button class="profile-item danger" id="profileLogout">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none"><path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3M15 8l4 4-4 4M19 12H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          יציאה מהחשבון</button>
      </div>`;
    $('#profileLogout').addEventListener('click', () => { closeSheets(); Store.logout(); setTab('home'); filterCat = 'הכל'; renderCatBar(); renderList(); });
    document.querySelectorAll('[data-profile-go]').forEach((b) =>
      b.addEventListener('click', () => {
        filterCat = b.dataset.profileGo;
        closeSheets();
        setTab(filterCat === 'שלי' ? 'mine' : 'saved');
        renderCatBar();
        if (openId) showList(); else renderList();
        window.scrollTo({ top: 0, behavior: 'instant' });
      })
    );
  }
  $('#backdrop').hidden = false;
  $('#profileSheet').hidden = false;
}
$('#newForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('#newTitle').value.trim();
  if (!title) return;
  Store.addTopic({
    title,
    body: $('#newBody').value.trim(),
    category: newCat,
    authorName: user.name,
    authorEmail: user.email,
    authorPhoto: user.photo || '',
    hood: 'שדרות',
  })
    .then(() => toast('הפוסט פורסם'))
    .catch(() => toast('הפרסום נכשל, נסו שוב'));
  $('#newForm').reset();
  $('#backdrop').hidden = true;
  $('#newSheet').hidden = true;
});

/* ─── היועץ ─── */
$('#chatForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!requireLogin()) return;
  const q = $('#chatInput').value.trim();
  if (!q) return;
  $('#chatInput').value = '';
  const t = topics.find((x) => x.id === openId);
  await Store.addChat(openId, { role: 'user', name: user.name, email: user.email, text: q });
  renderChat(true);
  let answer;
  try {
    answer = AI_CONFIG.anthropicApiKey
      ? await aiAdvisor(t, comments, chat, q)
      : localAdvisor(t, comments, chat, q);
  } catch {
    answer = localAdvisor(t, comments, chat, q);
  }
  await Store.addChat(openId, { role: 'bot', name: 'היועץ', text: answer });
});

function localAdvisor(t, comments, chat, q) {
  const votes = votesOf(t);
  const pts = comments.slice(-4).map((c) => '- ' + c.author + ': "' + c.text + '"').join('\n');
  const prev = chat.filter((m) => m.role === 'user').length;
  let focus = '';
  if (/תקציב|כסף|עולה|מחיר|עלות/.test(q))
    focus = 'לגבי תקציב: מתחילים בהערכת עלות פשוטה — שלוש הצעות מחיר. אחר כך בודקים את תקציב מחלקת הנוער והקולות הקוראים העירוניים. פנייה עם מספרים מתקבלת פי כמה יותר ברצינות.';
  else if (/עירייה|אישור|רשות|פנייה|פניה/.test(q))
    focus = 'לגבי פנייה לעירייה: מסמך של עמוד אחד — מה הבעיה, מה הפתרון, כמה תומכים יש (' + votes + ' הצבעות כאן), ומה מבקשים בפועל. מגישים למחלקת הנוער ומבקשים תשובה תוך שבועיים.';
  else if (/בטיחות|מסוכן|סכנה/.test(q))
    focus = 'לגבי בטיחות: מתעדים את המצב בתמונות עם תאריכים ושעות. זה גם מגן עליכם וגם הופך את הפנייה לעירייה להרבה יותר חזקה.';
  else if (/מתנדבים|צוות|להצטרף|עזרה/.test(q))
    focus = 'לגבי צוות: לפי התגובות כאן כבר יש מתעניינים. הצעד הנכון הוא מפגש ראשון קצר — חצי שעה, חלוקת תפקידים, ותאריך לצעד הראשון.';
  return (
    'הנה תמונת המצב של "' + t.title + '":\n\n' +
    votes + ' הצבעות בעד, ' + comments.length + ' תגובות' + (prev > 1 ? ', ו-' + prev + ' שאלות שכבר נשאלו כאן' : '') + '.' +
    (pts ? '\n\nנקודות מרכזיות מהדיון:\n' + pts : '') +
    '\n\n' + (focus || 'ההמלצה שלי: להתחיל בצעד הקטן ביותר שמוכיח שהרעיון עובד, ולצרף את מי שכבר הגיב כאן.') +
    '\n\nאפשר לשאול אותי גם על תקציב, פנייה לעירייה או גיוס צוות.'
  );
}

async function aiAdvisor(t, comments, chat, q) {
  const context =
    'הפוסט: ' + t.title + '\n' +
    (t.body ? 'תיאור: ' + t.body + '\n' : '') +
    'קטגוריה: ' + catOf(t) + ' | סטטוס: ' + (t.status || 'חדש') + ' | הצבעות בעד: ' + votesOf(t) + '\n\n' +
    'תגובות מהקהילה:\n' + (comments.map((c) => c.author + (isStaff(c.email) ? ' (יחידת הנוער)' : '') + ': ' + c.text).join('\n') || 'אין') + '\n\n' +
    'התייעצויות קודמות על הפוסט הזה:\n' +
    (chat.slice(-16).map((m) => (m.role === 'bot' ? 'היועץ' : m.name) + ': ' + m.text).join('\n') || 'אין') +
    '\n\nהשאלה החדשה של ' + user.name + ': ' + q;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': AI_CONFIG.anthropicApiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      max_tokens: 600,
      system:
        'אתה "היועץ" — יועץ חדשנות לבני נוער בשדרות שמקדמים רעיונות לשיפור העיר. ' +
        'ענה בעברית, קצר וענייני (עד 6 משפטים), בלי אימוג\'ים. ' +
        'התבסס על ההקשר: התגובות וההתייעצויות של כל המשתמשים על הפוסט הזה. ' +
        'תן צעדים מעשיים וספציפיים לנוער מול עירייה, תקציבים וגיוס חברים. אל תמציא עובדות או התחייבויות של העירייה.',
      messages: [{ role: 'user', content: context }],
    }),
  });
  if (!res.ok) throw new Error('api');
  const data = await res.json();
  return data.content[0].text;
}
