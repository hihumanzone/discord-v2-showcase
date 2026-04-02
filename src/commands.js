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

const managedCommandNames = new Set(commandData.map((command) => command.name));

let cachedApplicationId = null;

async function resolveApplicationId(rest) {
  if (cachedApplicationId) {
    return cachedApplicationId;
  }

  const application = await rest.get(Routes.currentApplication());
  cachedApplicationId = application.id;
  return cachedApplicationId;
}

function listManagedCommands(commands) {
  return commands.filter((command) => managedCommandNames.has(command.name));
}

async function deleteCommands(rest, deleteRoutes) {
  await Promise.all(deleteRoutes.map((route) => rest.delete(route)));
  return deleteRoutes.length;
}

async function removeManagedGlobalCommands(rest, applicationId) {
  const globalCommands = await rest.get(Routes.applicationCommands(applicationId));
  const deleteRoutes = listManagedCommands(globalCommands).map((command) =>
    Routes.applicationCommand(applicationId, command.id),
  );

  return deleteCommands(rest, deleteRoutes);
}

async function removeManagedGuildCommands(rest, applicationId, guildId) {
  const guildCommands = await rest.get(Routes.applicationGuildCommands(applicationId, guildId));
  const deleteRoutes = listManagedCommands(guildCommands).map((command) =>
    Routes.applicationGuildCommand(applicationId, guildId, command.id),
  );

  return deleteCommands(rest, deleteRoutes);
}

export async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(config.botToken);
  const applicationId = await resolveApplicationId(rest);

  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(applicationId, config.guildId), {
      body: commandData,
    });

    const removedGlobalDuplicates = await removeManagedGlobalCommands(rest, applicationId);

    return {
      scope: 'guild',
      target: config.guildId,
      applicationId,
      removedGlobalDuplicates,
      removedGuildDuplicates: 0,
    };
  }

  await rest.put(Routes.applicationCommands(applicationId), {
    body: commandData,
  });

  return {
    scope: 'global',
    target: applicationId,
    applicationId,
    removedGlobalDuplicates: 0,
    removedGuildDuplicates: 0,
  };
}

export async function clearGuildCommandDuplicates(guildId) {
  const rest = new REST({ version: '10' }).setToken(config.botToken);
  const applicationId = await resolveApplicationId(rest);
  const removedGuildDuplicates = await removeManagedGuildCommands(rest, applicationId, guildId);

  return {
    applicationId,
    guildId,
    removedGuildDuplicates,
  };
}
