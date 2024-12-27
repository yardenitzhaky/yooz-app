// src/environments/environment.ts
export const environment = {
    production: false,
    firebase: {
      apiKey: "AIzaSyBA8xvn6CPX3RQF40Zbc874sucboFDB-7Q",
      authDomain: "yooz-app-fc6cb.firebaseapp.com",
      projectId: "yooz-app-fc6cb",
      storageBucket: "yooz-app-fc6cb.firebasestorage.app",
      messagingSenderId: "203612095839",
      appId: "1:203612095839:web:f0e3e2fe857978de66e2ea",
      measurementId: "G-82STNQXDVX"
    },
    supertokens: {
      apiDomain: "http://localhost:4200",
      websiteDomain: "http://localhost:4200",
      apiBasePath: "/auth",
      googleClientId: "your-google-client-id",
      googleClientSecret: "your-google-client-secret",
      appName: "YoozApp"
    }
  };