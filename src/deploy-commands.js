import { deployCommands } from './commands.js';
import { logger } from './logger.js';

try {
  const result = await deployCommands();
  logger.info('deploy', `Registered /v2-reference in ${result.scope === 'guild' ? `guild ${result.target}` : 'the global scope'}.`);
} catch (error) {
  logger.error('deploy', 'Command deployment failed.', error);
  process.exitCode = 1;
}
