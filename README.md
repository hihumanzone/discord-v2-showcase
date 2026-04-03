# 📘 Discord Components V2 Reference Bot

A simpler, beginner-friendly companion project for learning **Discord Display Message Components V2** with `discord.js`.

This version is intentionally written like an educational reference:
- fewer files than the production showcase
- heavier helper comments
- scene renderers that are easy to read top-to-bottom
- practical examples for both **message components** and **modal components**

## What this project teaches

### Message-side Components V2
- `TextDisplay`
- `Section` with both **Thumbnail** and **Button** accessories
- `Container`
- `Separator`
- `MediaGallery`
- `File`
- `ActionRow`
- `Button`
- `String Select`
- `User Select`
- `Role Select`
- `Mentionable Select`
- `Channel Select`

### Modal-side Components
- `TextDisplay` inside a modal
- `Label`
- `TextInput`
- `String Select` inside a modal
- `User Select` inside a modal
- `Role Select` inside a modal
- `Mentionable Select` inside a modal
- `Channel Select` inside a modal
- `File Upload`
- `Radio Group`
- `Checkbox Group`
- `Checkbox`

## Scenes

- **🏠 Home** — quick overview and the core rules for Components V2
- **🧱 Layouts** — layout and content components working together
- **🎛️ Interactions** — buttons and all supported message select menus
- **🪟 Modals** — three teaching modals covering the modal component surface
- **🚀 Workflow** — updates, follow-ups, state changes, and attached file display

## Project structure

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
    ids.js
    modals.js
    router.js
    scenes.js
    state.js
    utils.js
    validation.js
```

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy the example environment file

   ```bash
   cp .env.example .env
   ```

3. Add your bot token to `.env`

4. Start the bot

   ```bash
   npm start
   ```

5. Run the command

   ```text
   /v2-reference
   ```

## Command deployment

- `BOT_TOKEN` is the only required environment variable.
- `GUILD_ID` is optional and is useful during development.
- If `GUILD_ID` is set, `/v2-reference` is registered in that guild only.
- If `GUILD_ID` is not set, `/v2-reference` is registered globally.
- `AUTO_DEPLOY_COMMANDS=true` is enabled by default.

## Notes for learners

### Why there is no `content` field
Components V2 messages should use components for all message content. That is why this project uses `TextDisplay`, `Section`, and `Container` instead of the legacy `content` or `embeds` fields.

### Why some modal controls use raw objects
At the time this project was assembled, Discord documents `Radio Group`, `Checkbox Group`, and `Checkbox` as supported modal components. Builder coverage in libraries can lag behind the API, so this reference keeps those pieces close to the documented wire format rather than inventing unsupported builders.

### Why there is a validator
Discord rejects invalid component trees. This project includes a small validator that catches the most common mistakes locally:
- more than 40 total message components
- more than 10 attachments
- invalid action row shapes
- invalid section, container, and label children
- duplicate `custom_id` values

## Local verification

Run:

```bash
npm run verify
```

This builds each scene and modal in memory and validates their structure. It does **not** replace a real bot test in Discord, but it is useful while editing the project.
