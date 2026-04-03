import { Client, Events, GatewayIntentBits } from 'discord.js';

import { deployCommands } from './commands.js';
import { config } from './config.js';
import { logger } from './logger.js';
import {
  handleCommandInteraction,
  handleMessageComponentInteraction,
  handleModalSubmitInteraction,
} from './showcase/router.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (readyClient) => {
  logger.info('bot', `Logged in as ${readyClient.user.tag}.`);

  if (!config.autoDeployCommands) {
    return;
  }

  try {
    const result = await deployCommands();
    logger.info('deploy', `Auto-deployed /v2-reference in ${result.scope === 'guild' ? `guild ${result.target}` : 'the global scope'}.`);
  } catch (error) {
    logger.error('deploy', 'Auto-deploy failed.', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      await handleCommandInteraction(interaction);
      return;
    }

    if (interaction.isAnySelectMenu() || interaction.isButton()) {
      await handleMessageComponentInteraction(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      await handleModalSubmitInteraction(interaction);
    }
  } catch (error) {
    logger.error('interactions', 'Interaction handling failed.', error);

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ ephemeral: true, content: 'Something went wrong while handling that interaction.' }).catch(() => null);
      return;
    }

    await interaction.reply({ ephemeral: true, content: 'Something went wrong while handling that interaction.' }).catch(() => null);
  }
});

client.login(config.botToken).catch((error) => {
  logger.error('bot', 'Unable to log in.', error);
  process.exitCode = 1;
});
