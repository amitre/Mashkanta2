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
