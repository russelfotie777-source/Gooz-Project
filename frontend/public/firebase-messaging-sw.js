// Handles push notifications while the app isn't focused/open. Service
// workers can't `import` npm packages, so this loads Firebase from the CDN
// via importScripts instead — the version below is pinned to match the
// "firebase" package in package.json; bump both together.
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.17.1/firebase-messaging-compat.js");

// Same public Web app config as lib/firebase/config.ts — duplicated because
// this file is served as-is from /public and never passes through Next.js's
// bundler, so it can't read that module or any process.env value.
firebase.initializeApp({
  apiKey: "AIzaSyCYmmBzE0Ao8pmRkA5MWrEMl9KjXf9WmmM",
  authDomain: "shopitechmessage.firebaseapp.com",
  projectId: "shopitechmessage",
  storageBucket: "shopitechmessage.firebasestorage.app",
  messagingSenderId: "590203958596",
  appId: "1:590203958596:web:0c369225620c9f1d0cd311",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? "Shopitech";
  const options = {
    body: payload.notification?.body,
    icon: "/icon-shopitech/logoFichier 33ICON.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});
