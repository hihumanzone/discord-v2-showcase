import 'dotenv/config';

function readRequired(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readBoolean(name, fallback) {
  const value = process.env[name];
  if (value == null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export const config = Object.freeze({
  botToken: readRequired('BOT_TOKEN'),
  guildId: process.env.GUILD_ID?.trim() || null,
  autoDeployCommands: readBoolean('AUTO_DEPLOY_COMMANDS', true),
});
