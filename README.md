# Discord Components V2 Showcase

A premium-quality showcase demonstrating the full breadth of **Discord Components V2** features using discord.js. This project provides multiple realistic interaction flows, detailed showcase messages, and polished UI patterns.

## Features Demonstrated

### Display Components
- **Text Display** - Markdown-formatted text content
- **Section** - Text with button or thumbnail accessories
- **Thumbnail** - Image accessories for sections
- **Media Gallery** - Grid of up to 10 images with spoilers support
- **File** - Attachment references as components
- **Separator** - Visual dividers with spacing options
- **Container** - Grouped components with accent colors

### Interactive Components
- **Buttons** - All five styles (Primary, Secondary, Success, Danger, Link)
- **String Select Menu** - Dropdown with custom options
- **User Select Menu** - Member selection
- **Role Select Menu** - Role selection
- **Channel Select Menu** - Channel selection with type filtering
- **Mentionable Select Menu** - Combined user/role selection

### Modal Components
- **Text Input** - Short and paragraph style inputs
- **Select Menus in Modals** - Dropdowns inside modal dialogs
- **Form Validation** - Required fields and length constraints

## Commands

| Command | Description |
|---------|-------------|
| `/showcase-components` | Comprehensive display of all V2 component types |
| `/interactive-demo` | Multi-step interactive journey with stateful UI |
| `/modal-demo` | Modal form demonstrations (feedback, profile, bug report) |
| `/event-demo` | Event RSVP system with real-time attendance tracking |
| `/products-demo` | E-commerce product browser with purchase flow |

## Project Structure

```
src/
├── index.js                 # Main bot entry point
├── utils/
│   └── component-helpers.js # Reusable component builder functions
└── showcases/
    ├── index.js             # Module exports
    ├── component-showcase.js # Full component demonstration
    ├── interactive-flow.js   # Multi-step interaction flow
    ├── modal-flow.js         # Modal form examples
    ├── event-rsvp.js         # Event management system
    └── product-browser.js    # E-commerce showcase
```

## Setup

### Prerequisites
- Node.js 16.9.0 or higher
- A Discord Bot application from the [Developer Portal](https://discord.com/developers/applications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd discord-components-v2-showcase
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your credentials:
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_test_guild_id_here
```

5. Start the bot:
```bash
npm start
```

## Usage

Once the bot is running and commands are registered:

1. In your Discord server, use any of the available commands
2. Interact with the components to see real-time responses
3. Explore different flows to understand component capabilities

## Key Implementation Details

### IS_COMPONENTS_V2 Flag
All V2 messages require the `MessageFlags.IsComponentsV2` flag (value: 32768):

```javascript
await channel.send({
  flags: MessageFlags.IsComponentsV2,
  components: [/* your components */]
});
```

### Component Limits
- Maximum **40 components** per message (nested components count!)
- Maximum **4000 characters** across all text display components
- Up to **10 items** in a Media Gallery
- Up to **5 action rows** at the top level

### Important Notes
- Once `IS_COMPONENTS_V2` is set on a message, it cannot be removed
- V2 messages cannot use `content`, `embeds`, `poll`, or `stickers`
- All attached files must be explicitly referenced in components

## Resources

- [Discord Components Overview](https://discord.com/developers/docs/components/overview)
- [Component Reference](https://discord.com/developers/docs/components/reference)
- [Using Message Components](https://discord.com/developers/docs/components/using-message-components)
- [Using Modal Components](https://discord.com/developers/docs/components/using-modal-components)
- [discord.js Guide](https://discordjs.guide/popular-topics/display-components.html)

## Best Practices Demonstrated

1. **Visual Hierarchy** - Using containers and separators for organization
2. **Consistent Styling** - Accent colors matching content purpose
3. **Accessibility** - Alt text for images via Thumbnail descriptions
4. **State Management** - Tracking user progress through flows
5. **Error Handling** - Graceful handling of missing data
6. **Responsive Design** - Mobile-friendly component layouts

## License

ISC License - Feel free to use this code in your own projects!
