import {
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

import { config } from './config.js';

export const SHOWCASE_COMMAND_NAME = 'v2-showcase';
const GUILD_INTERACTION_CONTEXT = 0;

function buildShowcaseCommand() {
  const command = new SlashCommandBuilder()
    .setName(SHOWCASE_COMMAND_NAME)
    .setDescription('Launch the production-ready Components V2 showcase')
    .addStringOption((option) =>
      option
        .setName('scene')
        .setDescription('Open a specific showcase scene immediately')
        .addChoices(
          { name: '🏠 Home', value: 'home' },
          { name: '✨ Product Tour', value: 'tour' },
          { name: '🚀 Launch Builder', value: 'builder' },
          { name: '🐞 Bug Desk', value: 'bug' },
          { name: '📦 Release Room', value: 'release' },
          { name: '🧪 Labs', value: 'labs' },
        ),
    );

  if (typeof command.setContexts === 'function') {
    command.setContexts(GUILD_INTERACTION_CONTEXT);
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

async function replaceCommands(rest, route, body) {
  await rest.put(route, { body });
}

async function listCommands(rest, route) {
  const commands = await rest.get(route);
  return Array.isArray(commands) ? commands : [];
}

async function deleteCommand(rest, route) {
  await rest.delete(route);
}

async function deleteCommandsByName(rest, applicationId, scope, name) {
  const listRoute = scope === 'global'
    ? Routes.applicationCommands(applicationId)
    : Routes.applicationGuildCommands(applicationId, scope.guildId);

  const commands = await listCommands(rest, listRoute);
  const matchingCommands = commands.filter((command) => command.name === name);

  await Promise.all(
    matchingCommands.map((command) => {
      const deleteRoute = scope === 'global'
        ? Routes.applicationCommand(applicationId, command.id)
        : Routes.applicationGuildCommand(applicationId, scope.guildId, command.id);

      return deleteCommand(rest, deleteRoute);
    }),
  );

  return matchingCommands.length;
}

export function getCommandScope() {
  if (config.guildId) {
    return {
      scope: 'guild',
      target: config.guildId,
    };
  }

  return {
    scope: 'global',
    target: 'global',
  };
}

export async function deployCommands(options = {}) {
  const { guildIds = [] } = options;
  const rest = new REST({ version: '10' }).setToken(config.botToken);
  const applicationId = await resolveApplicationId(rest);
  const cleanedGuilds = [];
  let removedGlobalCommands = 0;

  if (config.guildId) {
    const targetGuildId = config.guildId;
    const guildRoute = Routes.applicationGuildCommands(applicationId, targetGuildId);

    await replaceCommands(rest, guildRoute, commandData);
    removedGlobalCommands = await deleteCommandsByName(rest, applicationId, 'global', SHOWCASE_COMMAND_NAME);

    for (const guildId of guildIds) {
      if (guildId === targetGuildId) {
        continue;
      }

      const removedCount = await deleteCommandsByName(rest, applicationId, { guildId }, SHOWCASE_COMMAND_NAME);
      if (removedCount > 0) {
        cleanedGuilds.push({ guildId, removedCount });
      }
    }

    return {
      scope: 'guild',
      target: targetGuildId,
      applicationId,
      removedGlobalCommands,
      cleanedGuilds,
    };
  }

  const globalRoute = Routes.applicationCommands(applicationId);
  await replaceCommands(rest, globalRoute, commandData);

  for (const guildId of guildIds) {
    const removedCount = await deleteCommandsByName(rest, applicationId, { guildId }, SHOWCASE_COMMAND_NAME);
    if (removedCount > 0) {
      cleanedGuilds.push({ guildId, removedCount });
    }
  }

  return {
    scope: 'global',
    target: applicationId,
    applicationId,
    removedGlobalCommands,
    cleanedGuilds,
  };
}
