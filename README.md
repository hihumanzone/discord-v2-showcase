# ✨ Discord Components V2 Showcase

A polished, production-ready showcase app for Discord Components V2 using `discord.js`.

## 📋 What this project demonstrates

- Components V2 messages built without legacy `content` or embeds
- Rich layouts using containers, sections, separators, media galleries, thumbnails, and file components
- Stateful button and select-menu interactions inside one public showcase message
- Modal flows using current modal-native patterns such as `Label`, `Text Display`, modal selects, text inputs, and file uploads
- Realistic publish-style follow-ups and ephemeral interaction outcomes
- A modular architecture with validation helpers, scene rendering, message builders, and interaction routing

## 🧭 Scenes

- **🏠 Home** — polished entry view with visual overview, scene shortcuts, and a manifest file
- **✨ Product Tour** — hero storytelling, media gallery presentation, personalization modal, and teaser publishing
- **🚀 Launch Builder** — message select menus plus a modal using user, role, mentionable, and channel selects
- **🐞 Bug Desk** — structured bug intake with severity, text input, file upload, and a triage receipt
- **📦 Release Room** — readiness room with artifact delivery and public publish outcomes
- **🧪 Labs** — a stable modal drafting workflow for concise experiment briefs

## 🧱 Project structure

```text
assets/
src/
  commands.js
  config.js
  deploy-commands.js
  index.js
  logger.js
  verify.js
  showcase/
    assets.js
    constants.js
    helpers.js
    ids.js
    messages.js
    modals.js
    primitives.js
    responses.js
    router.js
    scenes.js
    sessions.js
    validation.js
.gitignore
```

## 🚀 Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy the environment template

   ```bash
   cp .env.example .env
   ```

3. Fill in `BOT_TOKEN`

   - `GUILD_ID` is optional and recommended for faster development deploys
   - `AUTO_DEPLOY_COMMANDS` defaults to `true`

4. Start the bot

   ```bash
   npm start
   ```

5. Optional manual deploy

   ```bash
   npm run deploy
   ```

6. Optional local verification

   ```bash
   npm run verify
   ```

7. Run `/v2-showcase`

## ✅ Production notes

- The bot resolves the application ID from the bot token, so `CLIENT_ID` is not required.
- The command definition is restricted to guild contexts when the installed discord.js surface supports command contexts, with a safe fallback for older builder support.
- When `GUILD_ID` is set, startup deployment automatically removes any global `/v2-showcase` registration so Discord does not show the same command twice.
- The showcase validates its outgoing Components V2 payloads before sending them, which helps catch component-count and attachment-limit mistakes early.
- Shared message assets are attached once to the main showcase message and only exposed through V2 components.

## 🗂️ Asset strategy

Discord Components V2 attachments do not render automatically. A V2 message has to expose uploaded files through `Thumbnail`, `Media Gallery`, or `File` components. The main showcase therefore uploads a curated shared asset bundle once and reuses those attachments across scene switches.
