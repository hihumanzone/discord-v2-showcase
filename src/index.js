import { Client, GatewayIntentBits, Collection, SlashCommandBuilder, MessageFlags } from 'discord.js';
import { REST, Routes } from '@discordjs/rest';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Store commands for registration
const commands = [];

/**
 * Initialize all showcase modules
 */
async function initializeShowcases() {
  const { setupComponentShowcase } = await import('./showcases/component-showcase.js');
  const { setupInteractiveFlow } = await import('./showcases/interactive-flow.js');
  const { setupModalFlow } = await import('./showcases/modal-flow.js');
  const { setupEventRSVP } = await import('./showcases/event-rsvp.js');
  const { setupProductBrowser } = await import('./showcases/product-browser.js');

  // Setup each showcase and collect commands
  commands.push(await setupComponentShowcase(client));
  commands.push(await setupInteractiveFlow(client));
  commands.push(await setupModalFlow(client));
  commands.push(await setupEventRSVP(client));
  commands.push(await setupProductBrowser(client));
}

/**
 * Register slash commands with Discord
 */
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    const clientId = client.user.id;

    // Format commands for the API
    const commandData = commands.map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      options: []
    }));

    // Always use global commands - works everywhere without guild ID
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandData }
    );
    console.log(`Successfully registered ${commandData.length} global commands.`);
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

/**
 * Bot ready event
 */
client.once('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📦 Serving ${client.guilds.cache.size} guild(s)`);
  
  // Register commands after bot is ready
  await registerCommands();
  
  console.log('\n🎮 Available Commands:');
  commands.forEach(cmd => {
    console.log(`   /${cmd.name} - ${cmd.description}`);
  });
  console.log('\n✨ Components V2 Showcase is ready!\n');
});

/**
 * Handle errors gracefully
 */
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('Uncaught exception:', error);
});

/**
 * Main initialization
 */
async function main() {
  // Validate required environment variables
  if (!process.env.DISCORD_TOKEN) {
    console.error('❌ Missing DISCORD_TOKEN in environment variables');
    console.error('   Copy .env.example to .env and add your bot token');
    process.exit(1);
  }

  try {
    // Initialize all showcase modules
    await initializeShowcases();
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Start the bot
main();
