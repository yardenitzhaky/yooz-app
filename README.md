# 📋 Task Management Application
A simple full-stack web application built with Angular, Firebase, and Material Design for task management and user profile handling.

<div align="center">

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Material](https://img.shields.io/badge/Material_UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)

</div>

## 🚀 Getting Started

### 📋 Prerequisites

1. **Node.js and npm**

macOS:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```
Windows:
- Download and install from [nodejs.org](https://nodejs.org/)

```

2. **Angular CLI and Firebase Tools** (macOS & Windows)
```bash
npm install -g @angular/cli
npm install -g firebase-tools

```

### ⚙️ Project Setup

1. **Clone and Install** (macOS & Windows)
```bash
git clone https://github.com/yardenitzhaky/yooz-app
cd yooz-app
npm install
```

2. **Firebase Setup**

a. **Create Firebase Project**
- Visit [Firebase Console](https://console.firebase.google.com/)
- Click "Add Project"
- Name your project
- Create project

b. **Initialize Firebase** (macOS & Windows)
```bash
firebase login
firebase init
```

When prompted:
- Select `Firestore`, `Authentication`, and `Hosting`
- Choose to use an existing project
- Select your newly created project
- Use these settings:
  - Firestore rules: `firestore.rules`
  - Firestore indexes: `firestore.indexes.json`
  - Public directory: `dist/browser`
  - Configure as single-page app: `Yes`
  - Set up automatic builds: `No`

c. **Enable Authentication**
- Go to Firebase Console > Authentication > Sign-in methods
- Enable Email/Password
- Enable Google Sign-in
- Add your domain to authorized domains

d. **Set Up Firestore Database**
- Go to Firebase Console > Firestore Database
- Create database
- Start in test mode
- Choose nearest location

3. **Configure Firebase in Your App**

a. **Get Firebase Config**
- Go to Firebase Console > Project Settings
- Under "Your apps", click web icon (</>)
- Register app and copy config

b. **Update Environment File**

Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  useEmulators: true, // Set false for production
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

4. **Configure Firebase Emulators**

Update `firebase.json`:
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "emulators": {
    "auth": {
      "port": 9099,
      "host": "127.0.0.1"
    },
    "firestore": {
      "port": 8080,
      "host": "127.0.0.1"
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

Update `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

5. **Start Development** (macOS & Windows)

In first terminal:
```bash
firebase emulators:start
```

In second terminal:
```bash
ng serve
```

🌐 Visit `http://localhost:4200` in your browser

