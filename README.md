# Discord Components V2 Showcase (discord.js)

A production-style showcase project demonstrating rich **Discord Display Components V2** UX in `discord.js`.

This project is intentionally structured as a cohesive product demo—not isolated snippets—so you can explore realistic patterns for:

- V2-first message composition (`IS_COMPONENTS_V2` flag on every showcase message)
- Modern layout components (`Container`, `Section`, `Separator`)
- Rich content components (`Text Display`, `Media Gallery`, `File`)
- Interactive controls (`Buttons`, `String Select`, `Channel Select`, `Mentionable Select`)
- Modal-driven journeys (`Label` + `Text Input` + `Radio Group` + `Checkbox Group`)
- Stateful message updates, follow-up outcomes, and multi-step flow transitions

## Highlights

### 1) Launch Dashboard
- Premium landing view with hierarchy, spacing, sectioned content, gallery visuals, and downloadable release-plan file exposure.
- Multiple action rows for fast branching.

### 2) Onboarding Journey
- Realistic onboarding progression using section accessories and mentionable selection.
- Supports personalized state injected from modal submission.

### 3) Release Console
- Practical release-routing flow with channel selection and docs deep-linking.
- Demonstrates state-sensitive messaging based on selected feature track.

### 4) Personalization Modal
- Uses current modal patterns with `Label` wrappers.
- Captures role/team name, launch strategy, and priorities in one polished form.
- Applies user input back into a generated onboarding experience.

---

## Project Structure

```txt
src/
  config.js                 # env config and validation
  index.js                  # bot bootstrap, command registration, interaction router
  showcase/
    constants.js            # component type IDs, flags, and custom IDs
    handlers.js             # command/component/modal handlers
    views.js                # all V2 message + modal payload builders
```

## Prerequisites

- Node.js `20.11+`
- A Discord application bot token
- Bot invited to a server with command and message component permissions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` in project root:
   ```env
   DISCORD_TOKEN=your_bot_token
   # Optional: faster command updates during development
   DISCORD_GUILD_ID=your_test_guild_id
   ```

3. Start the showcase bot:
   ```bash
   npm start
   ```

4. Run the command in Discord:
   ```
   /showcase
   ```

## Important V2 Notes

- All showcase message payloads rely on `flags: 32768` (`IS_COMPONENTS_V2`).
- No `content` or `embeds` are used for V2 showcase messages.
- Attachments are intentionally surfaced through `File` components.
- Interaction feedback messages are also rendered using V2 text display components.

## References Used

Primary (source of truth):
- https://docs.discord.com/developers/components/overview
- https://docs.discord.com/developers/components/reference
- https://docs.discord.com/developers/components/using-message-components
- https://docs.discord.com/developers/components/using-modal-components

Implementation support:
- https://raw.githubusercontent.com/discordjs/guide/refs/heads/main/guide/popular-topics/display-components.md
- https://raw.githubusercontent.com/ZarScape/discord.js-v2-components/refs/heads/main/README.md
