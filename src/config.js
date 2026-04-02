const dotenv = require('dotenv');

dotenv.config();

const config = {
  token: process.env.DISCORD_TOKEN,
  autoRegisterCommands: (process.env.AUTO_REGISTER_COMMANDS || 'true').toLowerCase() === 'true',
};

if (!config.token) {
  throw new Error('Missing DISCORD_TOKEN in environment.');
}

module.exports = config;
