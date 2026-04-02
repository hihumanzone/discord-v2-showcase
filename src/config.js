const required = ['DISCORD_TOKEN'];

function getConfig() {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.DISCORD_GUILD_ID ?? null,
  };
}

module.exports = { getConfig };
