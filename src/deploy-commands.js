import {
  Client,
  Events,
  GatewayIntentBits,
} from 'discord.js';

import { deployCommands } from './commands.js';
import { config } from './config.js';
import { logger } from './logger.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function run() {
  const guildIds = [...client.guilds.cache.keys()];
  const result = await deployCommands({ guildIds });

  if (result.scope === 'guild') {
    logger.info('deploy', `Deployed commands to guild ${result.target}`);
  } else {
    logger.info('deploy', 'Deployed commands globally');
  }

  if (result.removedGlobalCommands > 0) {
    logger.info('deploy', `Removed ${result.removedGlobalCommands} duplicate global /v2-showcase registration(s).`);
  }

  if (result.cleanedGuilds.length > 0) {
    logger.info('deploy', `Removed duplicate /v2-showcase registration(s) from ${result.cleanedGuilds.length} guild(s) outside the active scope.`);
  }
}

client.once(Events.ClientReady, async () => {
  try {
    await run();
  } catch (error) {
    logger.error('deploy', 'Command deployment failed.', error);
    process.exitCode = 1;
  } finally {
    client.destroy();
  }
});

client.login(config.botToken).catch((error) => {
  logger.error('deploy', 'Unable to log in for command deployment.', error);
  process.exitCode = 1;
});
