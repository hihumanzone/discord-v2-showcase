const { MessageFlags } = require('discord.js');
const sessionStore = require('../showcase/sessionStore');
const { parseId } = require('../showcase/ids');
const { buildAssetPackMessage, buildMainMessage } = require('../showcase/builders');
const { buildPlanningModal } = require('../showcase/modal');

function trimSafe(value) {
  return String(value || '').replaceAll('@', '@\u200b').trim();
}

async function respondNoSession(interaction) {
  return interaction.reply({
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    components: [],
  }).catch(() => undefined);
}

function getSessionFromInteraction(interaction) {
  const parsed = parseId(interaction.customId);
  if (!parsed) return null;
  const session = sessionStore.getBySessionId(parsed.sessionId);
  if (!session) return null;
  return { parsed, session };
}

async function handleComponent(interaction) {
  const resolved = getSessionFromInteraction(interaction);
  if (!resolved) return respondNoSession(interaction);

  const { parsed, session } = resolved;

  switch (parsed.action) {
    case 'open_modal': {
      if (session.published) return interaction.deferUpdate();
      return interaction.showModal(buildPlanningModal(session));
    }

    case 'template_select': {
      session.template = interaction.values[0] || session.template;
      return interaction.update(buildMainMessage(session));
    }

    case 'theme_select': {
      session.theme = interaction.values[0] || session.theme;
      return interaction.update(buildMainMessage(session));
    }

    case 'channel_select': {
      session.channels = [...interaction.values];
      return interaction.update(buildMainMessage(session));
    }

    case 'role_select': {
      session.roles = [...interaction.values];
      return interaction.update(buildMainMessage(session));
    }

    case 'mentionable_select': {
      session.mentionables = [...interaction.values];
      return interaction.update(buildMainMessage(session));
    }

    case 'send_assets': {
      await interaction.reply(buildAssetPackMessage(session));
      return;
    }

    case 'publish': {
      if (session.published) return interaction.deferUpdate();
      session.published = true;
      await interaction.update(buildMainMessage(session));
      return interaction.followUp({
        flags: MessageFlags.IsComponentsV2,
        allowedMentions: { parse: [] },
        components: [
          {
            type: 10,
            content: `## 🚀 Showcase published\nThe draft is now locked and presented as a final state.`,
          },
        ],
      });
    }

    case 'reset': {
      session.published = false;
      session.template = 'launch';
      session.theme = 'indigo';
      session.channels = [];
      session.roles = [];
      session.mentionables = [];
      session.brief = { headline: '', metric: '', cta: '' };
      return interaction.update(buildMainMessage(session));
    }

    default:
      return interaction.deferUpdate();
  }
}

async function handleModal(interaction) {
  const parsed = parseId(interaction.customId);
  if (!parsed || parsed.action !== 'planning_modal') return;

  const session = sessionStore.getBySessionId(parsed.sessionId);
  if (!session) return respondNoSession(interaction);

  session.brief = {
    headline: trimSafe(interaction.fields.getTextInputValue('headline')),
    metric: trimSafe(interaction.fields.getTextInputValue('metric')),
    cta: trimSafe(interaction.fields.getTextInputValue('cta')),
  };

  await interaction.deferReply({ flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 });

  if (interaction.channel?.isTextBased() && session.messageId) {
    const targetMessage = await interaction.channel.messages.fetch(session.messageId).catch(() => null);
    if (targetMessage) {
      await targetMessage.edit(buildMainMessage(session));
    }
  }

  return interaction.editReply({
    flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    components: [
      {
        type: 10,
        content: `✅ **Planning brief saved**\nYour showcase message has been updated with the latest modal input.`,
      },
    ],
  });
}

module.exports = { handleComponent, handleModal };
