import { deployCommands } from './commands.js';
import { logger } from './logger.js';

try {
  const result = await deployCommands();
  if (result.scope === 'guild') {
    logger.info('deploy', `Deployed commands to guild ${result.target}`);
  } else {
    logger.info('deploy', 'Deployed commands globally');
  }
} catch (error) {
  logger.error('deploy', 'Command deployment failed.', error);
  process.exitCode = 1;
}
