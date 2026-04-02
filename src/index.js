require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  InteractionType,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');
const { getConfig } = require('./config');
const {
  handleShowcaseCommand,
  handleComponentInteraction,
  handleModalSubmit,
} = require('./showcase/handlers');

const config = getConfig();

const commands = [
  new SlashCommandBuilder()
    .setName('showcase')
    .setDescription('Open the Discord Components V2 showcase experience')
    .toJSON(),
];

const rest = new REST({ version: '10' }).setToken(config.token);
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const state = {
  track: 'ui',
  personalization: {
    role: 'Product Operator',
    launch_style: 'careful',
    priorities: ['clarity'],
  },
};

async function registerCommands() {
  const clientId = client.application?.id;

  if (!clientId) {
    throw new Error('Unable to resolve application ID from the logged-in bot user.');
  }

  const route = config.guildId
    ? Routes.applicationGuildCommands(clientId, config.guildId)
    : Routes.applicationCommands(clientId);

  await rest.put(route, { body: commands });
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await registerCommands();
    console.log('Slash command registration complete.');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'showcase') {
      await handleShowcaseCommand(interaction);
      return;
    }

    if (interaction.type === InteractionType.MessageComponent) {
      await handleComponentInteraction(interaction, state);
      return;
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      await handleModalSubmit(interaction, state);
    }
  } catch (error) {
    console.error('Interaction handling failed:', error);

    if (!interaction.isRepliable() || interaction.replied || interaction.deferred) {
      return;
    }

    await interaction.reply({
      flags: (1 << 15) | (1 << 6),
      components: [
        {
          type: 10,
          content: 'Something went wrong while running the showcase flow. Check logs and retry.',
        },
      ],
    });
  }
});

client.login(config.token);
