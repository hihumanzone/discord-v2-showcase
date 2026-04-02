const { SlashCommandBuilder } = require('discord.js');
const sessionStore = require('../showcase/sessionStore');
const { createSessionId } = require('../showcase/ids');
const { buildMainMessage, defaultState } = require('../showcase/builders');

const data = new SlashCommandBuilder()
  .setName('showcase')
  .setDescription('Launch the premium Components V2 showcase')
  .setDMPermission(false);

async function execute(interaction) {
  const session = defaultState(createSessionId(), interaction.user.id);
  sessionStore.create(session);

  await interaction.reply(buildMainMessage(session));

  const reply = await interaction.fetchReply();
  sessionStore.setMessageId(session.sessionId, reply.id);
}

module.exports = { data, execute };
