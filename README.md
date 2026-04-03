# ✨ Discord Components V2 Showcase

A polished, production-ready showcase app for Discord Components V2 using `discord.js`.

## 📋 What this project demonstrates

- Components V2 messages built without legacy `content` or embeds
- Rich layouts using containers, sections, separators, media galleries, thumbnails, and file components
- Stateful button and select-menu interactions inside one public showcase message
- Modal flows using current modal-native patterns such as `Label`, `Text Display`, modal selects, text inputs, file uploads, radio groups, checkbox groups, and checkboxes
- Realistic publish-style follow-ups and ephemeral interaction outcomes
- A modular architecture with scene-specific renderers, payload validation helpers, message builders, and interaction routing

## 🧭 Scenes

- **🏠 Home** — polished entry view with visual overview, scene shortcuts, and a manifest file
- **✨ Product Tour** — hero storytelling, media gallery presentation, personalization modal, and teaser publishing
- **🚀 Launch Builder** — message select menus plus a modal using approver/channel selects and modal-native rollout controls
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
    sessions.js
    validation.js
    scenes/
      bug.js
      builder.js
      home.js
      index.js
      labs.js
      navigation.js
      release.js
      shared.js
      tour.js
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
   - When `GUILD_ID` is set, the bot keeps `/v2-showcase` only in that guild and removes duplicate registrations outside that scope during automatic startup deployment
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
- Command deployment is single-scope: with `GUILD_ID` it keeps `/v2-showcase` only in that guild; without `GUILD_ID` it keeps `/v2-showcase` global and removes duplicate guild copies during automatic startup deployment.
- The showcase validates outgoing Components V2 payloads before sending them, including message/modal structure, action row rules, duplicate `custom_id` detection, attachment limits, and component-count limits.
- Shared message assets are attached once to the main showcase message and only exposed through V2 components.

## 🗂️ Asset strategy

Discord Components V2 attachments do not render automatically. A V2 message has to expose uploaded files through `Thumbnail`, `Media Gallery`, or `File` components. The main showcase therefore uploads a curated shared asset bundle once and reuses those attachments across scene switches.
