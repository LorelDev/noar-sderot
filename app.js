/* נוער שדרות · אפליקציה ראשית */
const $ = (s) => document.querySelector(s);

let user = null;
let isAdmin = false;
let topics = [];
let openId = null;
let comments = [];
let chat = [];
let sortBy = 'top';
let unsubComments = null;
let unsubChat = null;

const esc = (s) =>
  String(s || '').replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const votesOf = (t) => (t.voters || []).length;
const votedBy = (t) => user && (t.voters || []).includes(user.email);

const STATUS_COLORS = { 'חדש': 'st-new', 'בטיפול': 'st-progress', 'אושר': 'st-ok', 'נדחה': 'st-no' };

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => (t.hidden = true), 2800);
}

/* ─── התחברות ─── */
Store.onAuth((u) => {
  user = u;
  isAdmin = !!u && ADMIN_EMAILS.includes(u.email);
  renderAuth();
  renderList();
  if (openId) renderTopic();
});

function renderAuth() {
  const area = $('#authArea');
  if (!user) {
    area.innerHTML = `<button class="btn-login" id="loginBtn">כניסה עם Google</button>`;
    $('#loginBtn').addEventListener('click', doLogin);
    return;
  }
  area.innerHTML = `
    ${isAdmin ? '<a class="btn-dash" href="dashboard.html">דשבורד</a>' : ''}
    ${user.photo ? `<img class="user-photo" src="${esc(user.photo)}" alt="">` : `<span class="user-photo user-initial">${esc(user.name[0])}</span>`}
    <button class="btn-logout" id="logoutBtn">יציאה</button>`;
  $('#logoutBtn').addEventListener('click', () => Store.logout());
}

function doLogin() {
  Store.login().catch(() => toast('ההתחברות נכשלה, נסו שוב'));
}
function requireLogin() {
  if (user) return true;
  toast('צריך להתחבר עם Google כדי להשתתף');
  return false;
}

/* ─── נתונים ─── */
Store.onTopics((list) => {
  topics = list;
  renderList();
  if (openId) renderTopicHead();
});

/* ─── רשימה ─── */
function renderList() {
  const sorted = [...topics].sort((a, b) =>
    sortBy === 'top' ? votesOf(b) - votesOf(a) : (b.createdAt || 0) - (a.createdAt || 0)
  );
  $('#topicList').innerHTML = sorted.length
    ? sorted
        .map((t) => {
          const voted = votedBy(t);
          return `
      <article class="topic" data-id="${t.id}">
        <button class="vote ${voted ? 'voted' : ''}" data-vote="${t.id}" aria-label="הצבעה בעד">
          <span class="arrow"></span><b>${votesOf(t)}</b><small>בעד</small>
        </button>
        <div class="topic-main">
          <h2>${esc(t.title)}</h2>
          ${t.body ? `<p>${esc(t.body)}</p>` : ''}
          <div class="topic-meta">
            <span class="status ${STATUS_COLORS[t.status] || 'st-new'}">${esc(t.status || 'חדש')}</span>
            <b>${esc(t.authorName)}</b> · ${esc(t.hood || 'שדרות')} · ${relTime(t.createdAt)} · ${t.commentsCount} תגובות
          </div>
        </div>
      </article>`;
        })
        .join('')
    : '<p class="no-comments">עוד אין נושאים. פתחו את הראשון.</p>';
}

/* ─── נושא בודד ─── */
function renderTopicHead() {
  const t = topics.find((x) => x.id === openId);
  if (!t) return;
  const voted = votedBy(t);
  $('#topicDetail').innerHTML = `
    <div class="detail">
      <h2>${esc(t.title)}</h2>
      ${t.body ? `<p class="body">${esc(t.body)}</p>` : ''}
      <div class="topic-meta">
        <span class="status ${STATUS_COLORS[t.status] || 'st-new'}">${esc(t.status || 'חדש')}</span>
        <b>${esc(t.authorName)}</b> · ${esc(t.hood || 'שדרות')} · ${relTime(t.createdAt)}
      </div>
      <button class="vote ${voted ? 'voted' : ''}" data-vote="${t.id}">
        <span class="arrow"></span><b>${votesOf(t)}</b><small>${voted ? 'הצבעת בעד' : 'מצביעים בעד'}</small>
      </button>
    </div>`;
}

function renderComments() {
  $('#commentsHead').textContent = comments.length ? `תגובות (${comments.length})` : 'תגובות';
  $('#commentList').innerHTML = comments.length
    ? comments
        .map((c) => `<div class="comment"><b>${esc(c.author)}</b><p>${esc(c.text)}</p><small>${relTime(c.createdAt)}</small></div>`)
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
    '<p class="no-comments">אף אחד עוד לא התייעץ על הרעיון הזה.</p>';
  thread.scrollTop = thread.scrollHeight;
}

function renderTopic() {
  renderTopicHead();
  renderComments();
  renderChat();
}

function showTopic(id) {
  openId = id;
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
  if (unsubComments) unsubComments();
  if (unsubChat) unsubChat();
  unsubComments = unsubChat = null;
  $('#view-topic').hidden = true;
  $('#view-list').hidden = false;
  renderList();
  window.scrollTo(0, 0);
}

/* ─── קליקים: הצבעה ופתיחה ─── */
document.addEventListener('click', (e) => {
  const voteBtn = e.target.closest('[data-vote]');
  if (voteBtn) {
    e.stopPropagation();
    if (!requireLogin()) return;
    Store.toggleVote(voteBtn.dataset.vote, user.email);
    return;
  }
  const card = e.target.closest('.topic');
  if (card) showTopic(card.dataset.id);
});

$('#backBtn').addEventListener('click', showList);

document.querySelectorAll('.sort').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('.sort').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    sortBy = b.dataset.sort;
    renderList();
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

/* ─── נושא חדש ─── */
$('#newBtn').addEventListener('click', () => {
  if (!requireLogin()) return;
  $('#backdrop').hidden = false;
  $('#newSheet').hidden = false;
  $('#newTitle').focus();
});
$('#backdrop').addEventListener('click', () => {
  $('#backdrop').hidden = true;
  $('#newSheet').hidden = true;
});
$('#newForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('#newTitle').value.trim();
  if (!title) return;
  Store.addTopic({
    title,
    body: $('#newBody').value.trim(),
    authorName: user.name,
    authorEmail: user.email,
    hood: 'שדרות',
  });
  $('#newForm').reset();
  $('#backdrop').hidden = true;
  $('#newSheet').hidden = true;
  toast('הנושא פורסם');
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

/* יועץ בסיסי — עובד בלי API, מסכם את מה שכולם אמרו */
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

/* יועץ חכם — Claude API עם הקשר מלא של הרעיון */
async function aiAdvisor(t, comments, chat, q) {
  const context =
    'הרעיון: ' + t.title + '\n' +
    (t.body ? 'תיאור: ' + t.body + '\n' : '') +
    'סטטוס: ' + (t.status || 'חדש') + ' | הצבעות בעד: ' + votesOf(t) + '\n\n' +
    'תגובות מהקהילה:\n' + (comments.map((c) => c.author + ': ' + c.text).join('\n') || 'אין') + '\n\n' +
    'התייעצויות קודמות על הרעיון הזה:\n' +
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
        'התבסס על ההקשר: התגובות וההתייעצויות של כל המשתמשים על הרעיון הזה. ' +
        'תן צעדים מעשיים וספציפיים לנוער מול עירייה, תקציבים וגיוס חברים. אל תמציא עובדות או התחייבויות של העירייה.',
      messages: [{ role: 'user', content: context }],
    }),
  });
  if (!res.ok) throw new Error('api');
  const data = await res.json();
  return data.content[0].text;
}
