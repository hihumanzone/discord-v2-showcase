import {
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

import { config } from './config.js';

export const SHOWCASE_COMMAND_NAME = 'v2-showcase';

function buildShowcaseCommand() {
  const command = new SlashCommandBuilder()
    .setName(SHOWCASE_COMMAND_NAME)
    .setDescription('Launch the production-ready Components V2 showcase')
    .addStringOption((option) =>
      option
        .setName('scene')
        .setDescription('Open a specific showcase scene immediately')
        .addChoices(
          { name: 'Home', value: 'home' },
          { name: 'Product Tour', value: 'tour' },
          { name: 'Launch Builder', value: 'builder' },
          { name: 'Bug Desk', value: 'bug' },
          { name: 'Release Room', value: 'release' },
          { name: 'Labs', value: 'labs' },
        ),
    );

  if (typeof command.setContexts === 'function') {
    command.setContexts(0);
  } else if (typeof command.setDMPermission === 'function') {
    command.setDMPermission(false);
  }

  return command;
}

export const commandBuilders = [buildShowcaseCommand()];
export const commandData = commandBuilders.map((command) => command.toJSON());

let cachedApplicationId = null;

async function resolveApplicationId(rest) {
  if (cachedApplicationId) {
    return cachedApplicationId;
  }

  const application = await rest.get(Routes.currentApplication());
  cachedApplicationId = application.id;
  return cachedApplicationId;
}

export async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(config.botToken);
  const applicationId = await resolveApplicationId(rest);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(applicationId, config.guildId), {
      body: commandData,
    });

    return {
      scope: 'guild',
      target: config.guildId,
      applicationId,
    };
  }

  await rest.put(Routes.applicationCommands(applicationId), {
    body: commandData,
  });

  return {
    scope: 'global',
    target: applicationId,
    applicationId,
  };
}
