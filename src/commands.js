import { REST, Routes, SlashCommandBuilder } from 'discord.js';

import { config } from './config.js';

export const COMMAND_NAME = 'v2-reference';
const GUILD_INTERACTION_CONTEXT = 0;

function buildReferenceCommand() {
  const command = new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription('Open the beginner-friendly Components V2 reference bot')
    .addStringOption((option) =>
      option
        .setName('scene')
        .setDescription('Open a specific learning scene')
        .addChoices(
          { name: '🏠 Home', value: 'home' },
          { name: '🧱 Layouts', value: 'layouts' },
          { name: '🎛️ Interactions', value: 'interactions' },
          { name: '🪟 Modals', value: 'modals' },
          { name: '🚀 Workflow', value: 'workflow' },
        ),
    );

  // In newer discord.js builds, setContexts is the preferred way to make a
  // command guild-only. Older builds may still expose setDMPermission.
  if (typeof command.setContexts === 'function') {
    command.setContexts(GUILD_INTERACTION_CONTEXT);
  } else if (typeof command.setDMPermission === 'function') {
    command.setDMPermission(false);
  }

  return command;
}

export const commandData = [buildReferenceCommand().toJSON()];

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

    return { scope: 'guild', target: config.guildId };
  }

  await rest.put(Routes.applicationCommands(applicationId), {
    body: commandData,
  });

  return { scope: 'global', target: applicationId };
}
