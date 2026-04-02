const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config');
const showcaseCommand = require('./commands/showcase');
const { handleComponent, handleModal } = require('./interactions/router');

const commands = [showcaseCommand];

async function registerCommands(applicationId) {
  const rest = new REST({ version: '10' }).setToken(config.token);
  const body = commands.map((command) => command.data.toJSON());
  await rest.put(Routes.applicationCommands(applicationId), { body });
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  if (config.autoRegisterCommands && client.application?.id) {
    await registerCommands(client.application.id);
  }
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = commands.find((entry) => entry.data.name === interaction.commandName);
      if (command) await command.execute(interaction);
      return;
    }

    if (interaction.isButton() || interaction.isAnySelectMenu()) {
      await handleComponent(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      await handleModal(interaction);
    }
  } catch (error) {
    console.error('Interaction handling failed:', error);

    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({ ephemeral: true, content: 'Something went wrong while handling that interaction.' }).catch(() => undefined);
    }
  }
});

client.login(config.token);
