# rustic-ai-demo

A production-ready rustic-ai-demo template with a built-in chat feature, Firebase auth, and a pre-configured component library.

## Features

- ⚡ Angular 21 with standalone components
- 💬 Chat feature (list, detail, new chat) using `ngx-twang-ui`
- 🔐 Firebase Authentication with auth guard
- 🎨 Tailwind CSS + Flowbite
- 📦 Lazy-loaded routes
- 🔔 Notification service
- 🌙 Dark mode support

## Prerequisites

- Node.js 22+
- Angular CLI 21
- Access to [ngx-twang-ui](https://github.com/your-org/ngx-twang-ui-repo)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-org/rustic-ai-demo.git my-new-app
cd my-new-app
```

### 2. Clone and build the component library

```bash
git clone https://github.com/your-org/ngx-twang-ui-repo.git ../ngx-twang-ui-repo
cd ../ngx-twang-ui-repo
npm install
ng build ngx-twang-ui
cd ../my-new-app
```

### 3. Configure Firebase

Copy the environment template and fill in your Firebase project details:

```bash
cp src/environments/environment.template.ts src/environments/environment.ts
```

```ts
// src/environments/environment.ts
export const environment = {
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    appId: "YOUR_APP_ID"
  }
};
```

### 4. Install and run

```bash
npm install
ng serve
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/         # auth.guard
│   │   └── services/       # data, notification services
│   ├── models/             # Chat, LlmProvider etc.
│   ├── pages/
│   │   └── chats/          # chat list, detail, new chat
│   └── app.routes.ts
├── environments/
│   ├── environment.ts           # your local config (gitignored)
│   └── environment.template.ts  # safe to commit
```

## Component Library

This app uses [ngx-twang-ui](https://github.com/your-org/ngx-twang-ui-repo), a local Angular component library. It is referenced as a `file:` dependency in `package.json`:

```json
"ngx-twang-ui": "file:../ngx-twang-ui-repo/dist/ngx-twang-ui"
```

> ⚠️ The library must be built before running this app. See step 2 above.

### Important: Keep Angular versions in sync

The library and this app must use the **exact same Angular version**. All `@angular/*` packages are pinned without `^` or `~` for this reason.

## VS Code Setup

A `.vscode/settings.json` is included to prevent Angular internal chunk files from being auto-imported:

```json
{
  "typescript.preferences.autoImportFileExcludePatterns": [
    "@angular/*/types/*",
    "@angular/*/esm*",
    "@angular/*/fesm*"
  ]
}
```

## New Project Checklist

- [ ] Update `name` in `package.json`
- [ ] Clone and build `ngx-twang-ui-repo`
- [ ] Add Firebase config to `environment.ts`
- [ ] Run `npm install`
- [ ] Run `ng serve`