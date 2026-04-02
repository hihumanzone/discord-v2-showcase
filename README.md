# discord-v2-showcase

A polished Discord Display Message Components V2 showcase built with `discord.js`.

## Highlights

- Full V2 message payloads using `MessageFlags.IsComponentsV2`
- No `content` or `embeds` in showcase V2 messages
- Rich layout with `TextDisplay`, `Section`, `Thumbnail`, `Separator`, and `Container`
- Real interaction flow with Buttons + Select menus + Modal
- Stateful message updates (`interaction.update` + message edits)
- Follow-up outcomes and a generated file shown with a V2 `File` component
- Media preview pack with `MediaGallery`

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set values:

   - `DISCORD_TOKEN`
   - `AUTO_REGISTER_COMMANDS=true`

3. Start the bot:

   ```bash
   npm start
   ```

## Command

- `/showcase` — launches the full Components V2 showcase studio flow

## Project structure

- `src/index.js` — bot bootstrap + command registration + interaction routing
- `src/commands/showcase.js` — slash command entry point
- `src/interactions/router.js` — button/select/modal handlers
- `src/showcase/builders.js` — V2 message builders for main UI + asset pack
- `src/showcase/modal.js` — modal definition using V2 label-based modal components
- `src/showcase/sessionStore.js` — in-memory showcase session state

## Notes

- This project intentionally models realistic UI journeys (drafting, targeting, reviewing assets, publishing).
- The session store is in-memory for demo simplicity and resets on bot restart.
