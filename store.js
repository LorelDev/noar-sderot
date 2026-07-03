/* שכבת נתונים — Firebase (פרודקשן) */

function relTime(ts) {
  if (!ts) return '';
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return 'לפני ' + m + ' דק׳';
  const h = Math.floor(m / 60);
  if (h < 24) return 'לפני ' + (h === 1 ? 'שעה' : h + ' שעות');
  const d = Math.floor(h / 24);
  if (d === 1) return 'לפני יום';
  if (d === 2) return 'לפני יומיים';
  if (d < 7) return 'לפני ' + d + ' ימים';
  const w = Math.floor(d / 7);
  return w === 1 ? 'לפני שבוע' : w === 2 ? 'לפני שבועיים' : 'לפני ' + w + ' שבועות';
}

firebase.initializeApp(FIREBASE_CONFIG);
const _auth = firebase.auth();
const _db = firebase.firestore();
const _topics = () => _db.collection('topics');

const Store = {
  onAuth(cb) {
    _auth.onAuthStateChanged((u) =>
      cb(u ? { name: u.displayName || u.email, email: u.email, photo: u.photoURL } : null)
    );
  },
  login() {
    return _auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  },
  logout() {
    return _auth.signOut();
  },
  onTopics(cb) {
    return _topics().onSnapshot((s) =>
      cb(s.docs.map((d) => ({ id: d.id, commentsCount: 0, chatCount: 0, ...d.data() })))
    );
  },
  addTopic(t) {
    return _topics().add({
      ...t,
      status: 'חדש',
      voters: [t.authorEmail],
      commentsCount: 0,
      chatCount: 0,
      createdAt: Date.now(),
    });
  },
  setStatus(id, status) {
    return _topics().doc(id).update({ status });
  },
  toggleVote(id, email) {
    const ref = _topics().doc(id);
    return _db.runTransaction(async (tr) => {
      const d = await tr.get(ref);
      const voters = d.data().voters || [];
      tr.update(ref, {
        voters: voters.includes(email) ? voters.filter((v) => v !== email) : [...voters, email],
      });
    });
  },
  toggleSave(id, email, isSaved) {
    return _topics().doc(id).update({
      savers: isSaved
        ? firebase.firestore.FieldValue.arrayRemove(email)
        : firebase.firestore.FieldValue.arrayUnion(email),
    });
  },
  onComments(id, cb) {
    return _topics().doc(id).collection('comments').orderBy('createdAt')
      .onSnapshot((s) => cb(s.docs.map((d) => d.data())));
  },
  addComment(id, c) {
    _topics().doc(id).update({ commentsCount: firebase.firestore.FieldValue.increment(1) });
    return _topics().doc(id).collection('comments').add({ ...c, createdAt: Date.now() });
  },
  onChat(id, cb) {
    return _topics().doc(id).collection('chat').orderBy('createdAt')
      .onSnapshot((s) => cb(s.docs.map((d) => d.data())));
  },
  addChat(id, m) {
    _topics().doc(id).update({ chatCount: firebase.firestore.FieldValue.increment(1) });
    return _topics().doc(id).collection('chat').add({ ...m, createdAt: Date.now() });
  },
};
