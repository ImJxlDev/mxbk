Why this folder exists

If the CDN hosting Firebase compat libraries is blocked or unreliable in your environment, you can download the required compat script and place it here to allow the app to load Firestore from a local file.

Which file to place here

- firebase-firestore-compat.js (version matching the CDN: 9.22.1)

Where to get it

1. Visit https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js in your browser and save the contents to `js/vendor/firebase-firestore-compat.js`.
2. Alternatively, use curl/wget:

```bash
curl -o js/vendor/firebase-firestore-compat.js https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore-compat.js
```

Notes

- This README doesn't include the actual library file to keep repo size small.
- Ensure the version matches the other compat scripts (firebase-app-compat.js and firebase-auth-compat.js) in `js/firebase-config.js`.
- After placing the file, reload your app — the loader will attempt to use the local file if the CDN script previously failed.
