/* רעיונוער · דשבורד יחידת הנוער */
const $ = (s) => document.querySelector(s);

let user = null;
let isAdmin = false;
let topics = [];
let recentComments = [];
let unsubComments = null;
let q = '';
let fStatus = '';
let fCat = '';
let fSort = 'votes';

const CATEGORIES = ['אירועים', 'ספורט', 'תרבות', 'חינוך', 'סביבה', 'תשתיות', 'אחר'];
const STATUSES = ['חדש', 'בטיפול', 'אושר', 'נדחה'];
const STATUS_COLORS = { 'חדש': 'st-new', 'בטיפול': 'st-progress', 'אושר': 'st-ok', 'נדחה': 'st-no' };

const esc = (s) =>
  String(s || '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const votesOf = (t) => (t.voters || []).length;

const AIC = {
  view: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/></svg>',
  reply: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M21 12a8 8 0 0 1-8 8H4l1.7-3.4A8 8 0 1 1 21 12Z" stroke="currentColor" stroke-width="1.7"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M9 4h6l1 7 3 3H5l3-3 1-7Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 14v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  del: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7m4 4v6m4-6v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.hidden = true), 2600);
}

/* ─── התחברות ─── */
Store.onAuth((u) => {
  user = u;
  isAdmin = !!u && ADMIN_EMAILS.includes(u.email);
  renderAuth();
  renderGate();
  if (isAdmin && !unsubComments) {
    unsubComments = Store.onRecentComments((c) => { recentComments = c; renderRecentComments(); });
  }
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

/* ─── סינון הטבלה ─── */
function filteredTopics() {
  let list = [...topics];
  if (fStatus) list = list.filter((t) => (t.status || 'חדש') === fStatus);
  if (fCat) list = list.filter((t) => (t.category || 'אחר') === fCat);
  if (q) list = list.filter((t) => (t.title + ' ' + (t.body || '') + ' ' + t.authorName).includes(q));
  return list.sort((a, b) =>
    fSort === 'new' ? (b.createdAt || 0) - (a.createdAt || 0)
    : fSort === 'comments' ? (b.commentsCount || 0) - (a.commentsCount || 0)
    : fSort === 'chats' ? (b.chatCount || 0) - (a.chatCount || 0)
    : votesOf(b) - votesOf(a)
  );
}

/* ─── ציור בר ─── */
function barRows(pairs, colorFn) {
  const max = Math.max(1, ...pairs.map(([, n]) => n));
  return pairs
    .map(
      ([label, n], i) => `
    <div class="bar-row">
      <span class="name">${esc(label)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(n / max) * 100}%${colorFn ? ';background:' + colorFn(label, i) : ''}"></div></div>
      <b>${n}</b>
    </div>`
    )
    .join('');
}

/* ─── רינדור ראשי ─── */
function render() {
  /* מדדים */
  const votes = topics.reduce((a, t) => a + votesOf(t), 0);
  const comments = topics.reduce((a, t) => a + (t.commentsCount || 0), 0);
  const chats = topics.reduce((a, t) => a + (t.chatCount || 0), 0);
  const week = topics.filter((t) => Date.now() - (t.createdAt || 0) < 7 * 864e5).length;
  const users = new Set();
  topics.forEach((t) => {
    if (t.authorEmail) users.add(t.authorEmail);
    (t.voters || []).forEach((v) => users.add(v));
  });
  $('#kTopics').textContent = topics.length;
  $('#kVotes').textContent = votes;
  $('#kComments').textContent = comments;
  $('#kChats').textContent = chats;
  $('#kWeek').textContent = week;
  $('#kUsers').textContent = users.size;

  /* מובילות */
  const top = [...topics].sort((a, b) => votesOf(b) - votesOf(a)).slice(0, 5);
  $('#bars').innerHTML = barRows(top.map((t) => [t.title, votesOf(t)])) || '<p class="no-comments">אין נתונים עדיין.</p>';

  /* קטגוריות */
  const catCounts = CATEGORIES.map((c) => [c, topics.filter((t) => (t.category || 'אחר') === c).length]).filter(([, n]) => n > 0);
  $('#catBars').innerHTML = barRows(catCounts) || '<p class="no-comments">אין נתונים עדיין.</p>';

  /* סטטוסים */
  const stColors = { 'חדש': '#35b6e9', 'בטיפול': '#e8b93a', 'אושר': '#1e8c46', 'נדחה': '#e63946' };
  const stCounts = STATUSES.map((s) => [s, topics.filter((t) => (t.status || 'חדש') === s).length]);
  $('#statusBars').innerHTML = barRows(stCounts, (label) => stColors[label]);

  /* פעילות 14 ימים */
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
    const next = d.getTime() + 864e5;
    const n = topics.filter((t) => (t.createdAt || 0) >= d.getTime() && (t.createdAt || 0) < next).length;
    days.push([d, n]);
  }
  const maxDay = Math.max(1, ...days.map(([, n]) => n));
  $('#sparkChart').innerHTML = days
    .map(
      ([d, n]) => `
    <div class="spark-col" title="${d.toLocaleDateString('he-IL')} · ${n}">
      <div class="spark-bar" style="height:${Math.max(6, (n / maxDay) * 100)}%${n ? '' : ';opacity:.25'}"></div>
      <small>${d.getDate()}</small>
    </div>`
    )
    .join('');

  /* כותבים מובילים */
  const byAuthor = {};
  topics.forEach((t) => {
    const k = t.authorName || '—';
    byAuthor[k] = byAuthor[k] || { posts: 0, votes: 0 };
    byAuthor[k].posts++;
    byAuthor[k].votes += votesOf(t);
  });
  const authors = Object.entries(byAuthor).sort((a, b) => b[1].posts - a[1].posts || b[1].votes - a[1].votes).slice(0, 6);
  $('#topAuthors').innerHTML = authors.length
    ? authors
        .map(
          ([name, s], i) => `
      <div class="author-row">
        <span class="leader-rank">${i + 1}</span>
        <span class="author-name">${esc(name)}</span>
        <small>${s.posts} סוגיות · ${s.votes} הצבעות</small>
      </div>`
        )
        .join('')
    : '<p class="no-comments">אין נתונים עדיין.</p>';

  renderTable();
}

/* ─── טבלה ─── */
function renderTable() {
  const list = filteredTopics();
  $('#rows').innerHTML = list.length
    ? list
        .map(
          (t) => `
    <tr>
      <td class="t-title">
        ${t.pinned ? '<span class="pin-badge">נעוץ</span> ' : ''}${esc(t.title)}
        <small>${esc(t.authorName)} · ${esc(t.category || 'אחר')} · ${relTime(t.createdAt)}</small>
      </td>
      <td class="tbl-num">${votesOf(t)}</td>
      <td class="tbl-num hide-m">${t.commentsCount || 0}</td>
      <td class="tbl-num hide-m">${t.chatCount || 0}</td>
      <td>
        <select data-id="${t.id}">
          ${STATUSES.map((s) => `<option ${s === (t.status || 'חדש') ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="acts">
          <a class="act" href="index.html#t=${t.id}" target="_blank" title="צפייה בסוגיה באתר">${AIC.view}</a>
          <button class="act" data-reply="${t.id}" title="תגובה רשמית">${AIC.reply}</button>
          <button class="act" data-edit="${t.id}" title="עריכה">${AIC.edit}</button>
          <button class="act ${t.pinned ? 'act-on' : ''}" data-pin="${t.id}" title="${t.pinned ? 'ביטול נעיצה' : 'נעיצה בראש הפיד'}">${AIC.pin}</button>
          <button class="act act-danger" data-del="${t.id}" data-title="${esc(t.title)}" title="מחיקה">${AIC.del}</button>
        </div>
      </td>
    </tr>`
        )
        .join('')
    : '<tr><td colspan="6"><p class="no-comments">אין סוגיות שמתאימות לסינון.</p></td></tr>';

  document.querySelectorAll('#rows select').forEach((sel) =>
    sel.addEventListener('change', () => {
      Store.setStatus(sel.dataset.id, sel.value);
      toast('הסטטוס עודכן — מוצג עכשיו גם לנוער באתר');
    })
  );
}

/* ─── תגובות אחרונות (פיקוח) ─── */
function renderRecentComments() {
  const box = $('#recentComments');
  if (!box) return;
  box.innerHTML = recentComments.length
    ? recentComments
        .map((c) => {
          const t = topics.find((x) => x.id === c.topicId);
          return `
      <div class="cmt-row">
        <div class="cmt-main">
          <b>${esc(c.author)}</b>
          <p>${esc(c.text)}</p>
          <small>${t ? 'על: ' + esc(t.title) + ' · ' : ''}${relTime(c.createdAt)}</small>
        </div>
        <button class="act act-danger" data-delc="${c.topicId}:${c.id}" title="מחיקת תגובה">${AIC.del}</button>
      </div>`;
        })
        .join('')
    : '<p class="no-comments">עוד אין תגובות במערכת.</p>';
}

/* ─── מודאל ─── */
function openModal(html) {
  $('#modalBody').innerHTML = html;
  $('#dashBackdrop').hidden = false;
  $('#dashModal').hidden = false;
}
function closeModal() {
  $('#dashBackdrop').hidden = true;
  $('#dashModal').hidden = true;
}
$('#dashBackdrop').addEventListener('click', closeModal);

function openReplyModal(t) {
  openModal(`
    <h2>תגובה רשמית</h2>
    <p class="sheet-sub">על: ${esc(t.title)} — התגובה תוצג לנוער עם תג יחידת הנוער.</p>
    <form id="replyForm">
      <textarea id="replyText" rows="4" maxlength="300" placeholder="למשל: קיבלנו! נבדוק מול מחלקת תשתיות ונעדכן כאן עד סוף החודש." required></textarea>
      <button type="submit" class="btn-primary">פרסום התגובה</button>
    </form>`);
  $('#replyForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('#replyText').value.trim();
    if (!text) return;
    Store.addComment(t.id, { author: user.name, email: user.email, text })
      .then(() => toast('התגובה הרשמית פורסמה'))
      .catch(() => toast('הפרסום נכשל, נסו שוב'));
    closeModal();
  });
}

function openEditModal(t) {
  openModal(`
    <h2>עריכת סוגיה</h2>
    <p class="sheet-sub">של ${esc(t.authorName)} — עריכה שקופה, בלי לשנות את הכותב.</p>
    <form id="editForm">
      <input type="text" id="editTitle" maxlength="80" value="${esc(t.title)}" required>
      <textarea id="editBody" rows="3" maxlength="400" placeholder="תיאור (לא חובה)">${esc(t.body || '')}</textarea>
      <select id="editCat">
        ${CATEGORIES.map((c) => `<option ${c === (t.category || 'אחר') ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
      <button type="submit" class="btn-primary">שמירה</button>
    </form>`);
  $('#editForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('#editTitle').value.trim();
    if (!title) return;
    Store.updateTopic(t.id, { title, body: $('#editBody').value.trim(), category: $('#editCat').value })
      .then(() => toast('הסוגיה עודכנה'))
      .catch(() => toast('העדכון נכשל, נסו שוב'));
    closeModal();
  });
}

/* ─── קליקים ─── */
document.addEventListener('click', async (e) => {
  const reply = e.target.closest('[data-reply]');
  if (reply) { openReplyModal(topics.find((t) => t.id === reply.dataset.reply)); return; }

  const edit = e.target.closest('[data-edit]');
  if (edit) { openEditModal(topics.find((t) => t.id === edit.dataset.edit)); return; }

  const pin = e.target.closest('[data-pin]');
  if (pin) {
    const t = topics.find((x) => x.id === pin.dataset.pin);
    Store.updateTopic(t.id, { pinned: !t.pinned })
      .then(() => toast(t.pinned ? 'הנעיצה בוטלה' : 'הסוגיה ננעצה בראש הפיד'));
    return;
  }

  const del = e.target.closest('[data-del]');
  if (del) {
    if (!confirm('למחוק את "' + del.dataset.title + '"?\nהמחיקה כוללת את כל התגובות וההתייעצויות — ואי אפשר לבטל.')) return;
    del.disabled = true;
    try {
      await Store.deleteTopic(del.dataset.del);
      toast('הסוגיה נמחקה');
    } catch {
      del.disabled = false;
      toast('המחיקה נכשלה, נסו שוב');
    }
    return;
  }

  const delc = e.target.closest('[data-delc]');
  if (delc) {
    if (!confirm('למחוק את התגובה?')) return;
    const [topicId, commentId] = delc.dataset.delc.split(':');
    Store.deleteComment(topicId, commentId)
      .then(() => toast('התגובה נמחקה'))
      .catch(() => toast('המחיקה נכשלה, נסו שוב'));
  }
});

/* ─── סרגל כלים ─── */
$('#fCat').innerHTML += CATEGORIES.map((c) => `<option>${c}</option>`).join('');
$('#dashSearch').addEventListener('input', (e) => { q = e.target.value.trim(); renderTable(); });
$('#fStatus').addEventListener('change', (e) => { fStatus = e.target.value; renderTable(); });
$('#fCat').addEventListener('change', (e) => { fCat = e.target.value; renderTable(); });
$('#fSort').addEventListener('change', (e) => { fSort = e.target.value; renderTable(); });

/* ─── ייצוא CSV ─── */
$('#csvBtn').addEventListener('click', () => {
  const rows = [
    ['כותרת', 'כותב', 'אימייל', 'קטגוריה', 'סטטוס', 'הצבעות', 'תגובות', 'התייעצויות', 'נעוץ', 'תאריך'],
    ...filteredTopics().map((t) => [
      t.title, t.authorName, t.authorEmail || '', t.category || 'אחר', t.status || 'חדש',
      votesOf(t), t.commentsCount || 0, t.chatCount || 0, t.pinned ? 'כן' : '',
      t.createdAt ? new Date(t.createdAt).toLocaleDateString('he-IL') : '',
    ]),
  ];
  const csv = '﻿' + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'reayonoar-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('הקובץ ירד — נפתח יפה באקסל');
});
