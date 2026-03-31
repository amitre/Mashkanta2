# Mashkanta2 - הגדרות פרויקט

## פרויקט
- **Repository:** `amitre/Mashkanta2`
- **Branch ראשי:** `main`

## הגדרת GitHub בתחילת סשן
כאשר המשתמש נותן טוקן, הגדר אותו כך:
```bash
git remote set-url origin "https://amitre:TOKEN@github.com/amitre/Mashkanta2.git"
```
החלף `TOKEN` בטוקן שניתן. לאחר כל push, החזר את ה-remote לכתובת המקורית:
```bash
git remote set-url origin "http://local_proxy@127.0.0.1:37579/git/amitre/Mashkanta2"
```

## דחיפה ל-main
```bash
git remote set-url origin "https://amitre:TOKEN@github.com/amitre/Mashkanta2.git"
git push origin HEAD:main
git remote set-url origin "http://local_proxy@127.0.0.1:37579/git/amitre/Mashkanta2"
```

## טכנולוגיות
- Next.js
- עברית (RTL)
- Deployed on Vercel

## חוק תמהיל משכנתא — חובה
**בכל תמהיל משכנתא שמוצע למשתמש, לפחות שליש (33%) מהמימון חייב להיות בריבית קבועה.**

- ריבית קבועה = `fixed_unlinked` (קבועה לא צמודה) ו/או `fixed_cpi` (קבועה צמודה)
- כלל זה חל על `recommendMix()` ב-`lib/calculations.js` ועל כל תמהיל שמוצג בממשק
- אם סכום `fixed_unlinked + fixed_cpi` בתמהיל נמוך מ-33% — יש להעלות אחד מהם עד לעמידה בדרישה
- הכלל נובע מרגולציה ומפרקטיקה מקצועית של יועצי משכנתאות בישראל
