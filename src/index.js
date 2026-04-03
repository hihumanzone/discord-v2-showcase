import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';

import { deployCommands, SHOWCASE_COMMAND_NAME } from './commands.js';
import { config } from './config.js';
import { logger } from './logger.js';
import { buildRuntimeErrorMessage } from './showcase/responses.js';
import {
  handleShowcaseCommand,
  handleShowcaseComponent,
  handleShowcaseModal,
} from './showcase/router.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

process.on('unhandledRejection', (error) => {
  logger.error('process', 'Unhandled promise rejection.', error);
});

process.on('uncaughtException', (error) => {
  logger.error('process', 'Uncaught exception.', error);
});

client.once(Events.ClientReady, async (readyClient) => {
  logger.info('startup', `Ready as ${readyClient.user.tag}`);

  if (!config.autoDeployCommands) {
    logger.info('startup', 'Automatic command deployment is disabled.');
    return;
  }

  try {
    const result = await deployCommands({
      guildIds: [...readyClient.guilds.cache.keys()],
    });

    if (result.scope === 'guild') {
      logger.info('deploy', `Deployed ${SHOWCASE_COMMAND_NAME} to guild ${result.target}`);
    } else {
      logger.info('deploy', `Deployed ${SHOWCASE_COMMAND_NAME} globally`);
    }

    if (result.removedGlobalCommands > 0) {
      logger.info('deploy', `Removed ${result.removedGlobalCommands} duplicate global ${SHOWCASE_COMMAND_NAME} registration(s).`);
    }

    if (result.cleanedGuilds.length > 0) {
      logger.info(
        'deploy',
        `Removed duplicate ${SHOWCASE_COMMAND_NAME} registration(s) from ${result.cleanedGuilds.length} guild(s) outside the active scope.`,
      );
    }
  } catch (error) {
    logger.error('deploy', 'Automatic command deployment failed.', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === SHOWCASE_COMMAND_NAME) {
      await handleShowcaseCommand(interaction);
      return;
    }

    if (
      interaction.isButton()
      || interaction.isStringSelectMenu()
      || interaction.isUserSelectMenu()
      || interaction.isRoleSelectMenu()
      || interaction.isMentionableSelectMenu()
      || interaction.isChannelSelectMenu()
    ) {
      await handleShowcaseComponent(interaction);
      return;
    }

    if (interaction.isModalSubmit()) {
      await handleShowcaseModal(interaction);
    }
  } catch (error) {
    logger.error('interaction', 'Interaction handling failed.', error);

    const fallback = buildRuntimeErrorMessage();

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(fallback).catch(() => null);
      return;
    }

    await interaction.reply(fallback).catch(() => null);
  }
});

client.login(config.botToken);
