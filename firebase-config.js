/* הגדרות המערכת */

/* Firebase — פרויקט noar-sderot */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDGVaAJH1dCivV9VU2WHSSCDS_0HUgcmhY',
  authDomain: 'noar-sderot.firebaseapp.com',
  projectId: 'noar-sderot',
  storageBucket: 'noar-sderot.firebasestorage.app',
  messagingSenderId: '258465201469',
  appId: '1:258465201469:web:0b9b80261aebc3badfd954',
};

/* מנהלי יחידת הנוער — רק האימיילים האלה רואים את הדשבורד ומשנים סטטוסים.
   חשוב: כל שינוי כאן צריך להתעדכן גם ב-firestore.rules (רשימת המנהלים שם). */
const ADMIN_EMAILS = [
  'teenovationsderot@gmail.com',
  'ori432777@gmail.com',
  'ori13kraus@gmail.com',
];

/* היועץ (צ'אט בוט) — מפתח Anthropic API הופך אותו ל-Claude אמיתי.
   בלי מפתח היועץ עובד במצב בסיסי (מסכם את הדיון ומציע צעדים).
   אזהרה: מפתח בדפדפן חשוף — מתאים לפיילוט בלבד. לייצור מעבירים ל-Cloud Function. */
const AI_CONFIG = {
  anthropicApiKey: '',
  model: 'claude-haiku-4-5-20251001',
};
