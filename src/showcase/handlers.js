import {
  FIELD_IDS,
  PRESET_OPTIONS,
  AUDIENCE_OPTIONS,
  SCENES,
  SEVERITY_OPTIONS,
} from './constants.js';
import {
  buildMainShowcaseMessage,
  buildMissingSessionMessage,
  buildOwnerOnlyMessage,
  buildSimpleEphemeralNote,
  buildTourModal,
  buildBuilderAssistantModal,
  buildBugReportModal,
  buildLabsModal,
  buildBugReceiptMessage,
  buildTourPublishMessage,
  buildReleasePublishMessage,
} from './ui.js';
import { parseCid } from './ids.js';
import { sessionStore } from './sessions.js';

function labelForOption(options, value, fallback = value) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

function namesFromCollection(collection, formatter) {
  if (!collection) {
    return [];
  }

  return Array.from(collection.values()).map(formatter);
}

function mentionableNames(interaction) {
  const roleNames = interaction.roles ? namesFromCollection(interaction.roles, (role) => `@${role.name}`) : [];
  const userNames = interaction.users ? namesFromCollection(interaction.users, (user) => user.globalName ?? user.username) : [];
  return [...roleNames, ...userNames];
}

function modalMentionableNames(mentionables) {
  if (!mentionables) {
    return [];
  }

  const roleNames = mentionables.roles ? Array.from(mentionables.roles.values()).map((role) => `@${role.name}`) : [];
  const userNames = mentionables.users ? Array.from(mentionables.users.values()).map((user) => user.globalName ?? user.username) : [];
  return [...roleNames, ...userNames];
}

async function ensureOwnedSession(interaction, session) {
  if (!session) {
    await interaction.reply(buildMissingSessionMessage());
    return false;
  }

  if (interaction.user.id !== session.ownerId) {
    await interaction.reply(buildOwnerOnlyMessage());
    return false;
  }

  return true;
}

async function refreshSessionMessage(interaction, session) {
  await interaction.update(buildMainShowcaseMessage(session, { includeFlags: false }));
}

async function editSessionMessage(client, session) {
  if (!session.channelId || !session.messageId) {
    return;
  }

  const channel = await client.channels.fetch(session.channelId);
  if (!channel?.isTextBased()) {
    return;
  }

  await channel.messages.edit(session.messageId, buildMainShowcaseMessage(session, { includeFlags: false }));
}

export async function handleChatInput(interaction) {
  const scene = interaction.options.getString('scene') ?? SCENES.home;
  const session = sessionStore.create({
    ownerId: interaction.user.id,
    channelId: interaction.channelId,
    guildId: interaction.guildId,
    scene,
  });

  await interaction.reply(buildMainShowcaseMessage(session, { includeFiles: true }));
  const reply = await interaction.fetchReply();
  session.messageId = reply.id;
}

export async function handleComponent(interaction) {
  const parsed = parseCid(interaction.customId);
  if (!parsed) {
    return;
  }

  const session = sessionStore.get(parsed.sessionId);
  if (!(await ensureOwnedSession(interaction, session))) {
    return;
  }

  if (parsed.kind === 'nav') {
    session.scene = parsed.action.split('@')[0];
    await refreshSessionMessage(interaction, session);
    return;
  }

  if (parsed.kind === 'sel') {
    await handleSelect(interaction, session, parsed.action);
    return;
  }

  if (parsed.kind === 'act') {
    await handleAction(interaction, session, parsed.action);
  }
}

async function handleSelect(interaction, session, action) {
  if (action === 'scene') {
    session.scene = interaction.values[0] ?? SCENES.home;
    await refreshSessionMessage(interaction, session);
    return;
  }

  session.scene = SCENES.builder;

  switch (action) {
    case 'builder:preset': {
      const value = interaction.values[0];
      session.builder.preset = value;
      session.builder.presetLabel = labelForOption(PRESET_OPTIONS, value);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:channels': {
      session.builder.channels = namesFromCollection(interaction.channels, (channel) => `#${channel.name}`);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:roles': {
      session.builder.roles = namesFromCollection(interaction.roles, (role) => `@${role.name}`);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:reviewers': {
      session.builder.reviewers = namesFromCollection(interaction.users, (user) => user.globalName ?? user.username);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:owners': {
      session.builder.owners = mentionableNames(interaction);
      session.builder.previewGenerated = false;
      break;
    }
    default: {
      await interaction.reply(buildSimpleEphemeralNote('### Unknown control\nThat select menu is not wired to a showcase action.'));
      return;
    }
  }

  await refreshSessionMessage(interaction, session);
}

async function handleAction(interaction, session, action) {
  const normalizedAction = action.split('@')[0];

  switch (normalizedAction) {
    case 'refresh': {
      await refreshSessionMessage(interaction, session);
      return;
    }
    case 'reset': {
      sessionStore.reset(session);
      await refreshSessionMessage(interaction, session);
      return;
    }
    case 'tour:personalize': {
      await interaction.showModal(buildTourModal(session));
      return;
    }
    case 'tour:publish': {
      session.tour.publishedCount += 1;
      await interaction.update(buildMainShowcaseMessage(session, { includeFlags: false }));
      await interaction.channel.send(buildTourPublishMessage(session));
      await interaction.followUp(
        buildSimpleEphemeralNote('### Teaser published\nA mock tour teaser has been posted to this channel and the showcase has recorded the new published state.'),
      );
      return;
    }
    case 'builder:assistant': {
      await interaction.showModal(buildBuilderAssistantModal(session));
      return;
    }
    case 'builder:generate': {
      session.builder.previewGenerated = true;
      await refreshSessionMessage(interaction, session);
      return;
    }
    case 'builder:clear': {
      session.builder.channels = [];
      session.builder.roles = [];
      session.builder.reviewers = [];
      session.builder.owners = [];
      session.builder.modalApprovers = [];
      session.builder.modalRoles = [];
      session.builder.modalOwners = [];
      session.builder.modalChannels = [];
      session.builder.previewGenerated = false;
      await refreshSessionMessage(interaction, session);
      return;
    }
    case 'bug:report': {
      await interaction.showModal(buildBugReportModal(session));
      return;
    }
    case 'release:publish': {
      session.release.publishedCount += 1;
      await interaction.update(buildMainShowcaseMessage(session, { includeFlags: false }));
      await interaction.channel.send(buildReleasePublishMessage(session));
      await interaction.followUp(
        buildSimpleEphemeralNote('### Launch update published\nThe channel just received a polished Components V2 launch update from the Release Room.'),
      );
      return;
    }
    case 'release:reset': {
      session.release.publishedCount = 0;
      await refreshSessionMessage(interaction, session);
      return;
    }
    case 'labs:open': {
      try {
        await interaction.showModal(buildLabsModal(session));
      } catch (error) {
        console.error('Failed to open Labs preview modal', error);
        await interaction.reply(
          buildSimpleEphemeralNote('### Labs modal could not be opened\nYour app may not yet be enabled for those preview controls. The stable showcase scenes remain fully usable.'),
        );
      }
      return;
    }
    default: {
      await interaction.reply(buildSimpleEphemeralNote('### Unknown action\nThat control is not wired to a showcase action.'));
    }
  }
}

export async function handleModal(interaction) {
  const parsed = parseCid(interaction.customId);
  if (!parsed || parsed.kind !== 'modal') {
    return;
  }

  const session = sessionStore.get(parsed.sessionId);
  if (!(await ensureOwnedSession(interaction, session))) {
    return;
  }

  switch (parsed.action) {
    case 'tour-personalize': {
      const audienceValue = interaction.fields.getStringSelectValues(FIELD_IDS.tourAudience)[0];
      session.tour.audience = audienceValue;
      session.tour.audienceLabel = labelForOption(AUDIENCE_OPTIONS, audienceValue);
      session.tour.productName = interaction.fields.getTextInputValue(FIELD_IDS.tourName);
      session.tour.highlight = interaction.fields.getTextInputValue(FIELD_IDS.tourHighlight);
      session.scene = SCENES.tour;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(
        buildSimpleEphemeralNote('### Product tour updated\nThe public showcase message has been refreshed with your new hero copy and audience framing.'),
      );
      return;
    }

    case 'builder-assistant': {
      session.builder.modalApprovers = namesFromCollection(
        interaction.fields.getSelectedUsers(FIELD_IDS.builderApprovers, false),
        (user) => user.globalName ?? user.username,
      );
      session.builder.modalRoles = namesFromCollection(
        interaction.fields.getSelectedRoles(FIELD_IDS.builderRoles, false),
        (role) => `@${role.name}`,
      );
      session.builder.modalOwners = modalMentionableNames(
        interaction.fields.getSelectedMentionables(FIELD_IDS.builderOwners, false),
      );
      session.builder.modalChannels = namesFromCollection(
        interaction.fields.getSelectedChannels(FIELD_IDS.builderChannels, false),
        (channel) => `#${channel.name}`,
      );
      session.builder.previewGenerated = true;
      session.scene = SCENES.builder;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(
        buildSimpleEphemeralNote('### Launch assistant applied\nThe builder scene now includes the richer modal-based selections in the live preview.'),
      );
      return;
    }

    case 'bug-report': {
      const severityValue = interaction.fields.getStringSelectValues(FIELD_IDS.bugSeverity)[0];
      session.bug.severityValue = severityValue;
      session.bug.severityLabel = labelForOption(SEVERITY_OPTIONS, severityValue, severityValue);
      session.bug.summary = interaction.fields.getTextInputValue(FIELD_IDS.bugSummary);
      session.bug.reproduction = interaction.fields.getTextInputValue(FIELD_IDS.bugReproduction);
      session.bug.uploadedFileNames = namesFromCollection(
        interaction.fields.getUploadedFiles(FIELD_IDS.bugFiles, false),
        (file) => file.name,
      );
      session.scene = SCENES.bug;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(buildBugReceiptMessage(session));
      return;
    }

    case 'labs-preview': {
      session.labs.ring = interaction.fields.getRadioGroup(FIELD_IDS.labsRing, false) ?? null;
      session.labs.panels = [...interaction.fields.getCheckboxGroup(FIELD_IDS.labsPanels)];
      session.labs.pinPreview = interaction.fields.getCheckbox(FIELD_IDS.labsPin);
      session.labs.lastRunAt = Date.now();
      session.scene = SCENES.labs;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(
        buildSimpleEphemeralNote('### Labs result captured\nThe labs scene has been refreshed with the preview control outputs.'),
      );
      return;
    }

    default: {
      await interaction.reply(
        buildSimpleEphemeralNote('### Unknown modal\nThat modal submission is not wired to a showcase outcome.'),
      );
    }
  }
}
