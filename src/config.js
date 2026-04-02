const dotenv = require('dotenv');

dotenv.config();

const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.DISCORD_GUILD_ID || null,
  autoRegisterCommands: (process.env.AUTO_REGISTER_COMMANDS || 'true').toLowerCase() === 'true',
};

if (!config.token || !config.clientId) {
  throw new Error('Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment.');
}

module.exports = config;
