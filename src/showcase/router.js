import {
  AUDIENCE_OPTIONS,
  BUILDER_PACKAGE_OPTIONS,
  BUILDER_POSTURE_OPTIONS,
  FIELD_IDS,
  LAB_TONE_OPTIONS,
  PRESET_OPTIONS,
  SCENES,
  SEVERITY_OPTIONS,
} from './constants.js';
import {
  collectionValues,
  findModalFieldComponent,
  getModalFieldValue,
  getModalFieldValues,
  labelForOption,
  labelsForValues,
  mentionableNamesFromInteraction,
  userDisplay,
} from './helpers.js';
import { parseCid } from './ids.js';
import {
  buildBugReceiptMessage,
  buildLabsPublishMessage,
  buildMainShowcaseMessage,
  buildReleasePublishMessage,
  buildTourPublishMessage,
} from './messages.js';
import {
  buildBugReportModal,
  buildBuilderAssistantModal,
  buildLabsModal,
  buildTourModal,
} from './modals.js';
import {
  buildEphemeralNote,
  buildMissingSessionMessage,
  buildOwnerOnlyMessage,
} from './responses.js';
import { sessionStore } from './sessions.js';

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

  const channel = await client.channels.fetch(session.channelId).catch(() => null);
  if (!channel?.isTextBased()) {
    return;
  }

  await channel.messages.edit(session.messageId, buildMainShowcaseMessage(session, { includeFlags: false }));
}

async function postShowcaseOutcome(interaction, payload) {
  if (!interaction.channel?.isTextBased()) {
    await interaction.followUp(buildEphemeralNote('### ⚠️ This channel cannot receive the showcase follow-up\nTry running the command in a standard text channel.'));
    return false;
  }

  await interaction.channel.send(payload);
  return true;
}

export async function handleShowcaseCommand(interaction) {
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

export async function handleShowcaseComponent(interaction) {
  const parsed = parseCid(interaction.customId);
  if (!parsed || parsed.kind === 'noop') {
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
  switch (action) {
    case 'scene': {
      session.scene = interaction.values[0] ?? SCENES.home;
      break;
    }
    case 'home:featured': {
      session.scene = interaction.values[0] ?? SCENES.tour;
      break;
    }
    case 'tour:audience-quick': {
      const value = interaction.values[0];
      session.scene = SCENES.tour;
      session.tour.audience = value;
      session.tour.audienceLabel = labelForOption(AUDIENCE_OPTIONS, value, value);
      break;
    }
    case 'builder:preset': {
      const value = interaction.values[0];
      session.scene = SCENES.builder;
      session.builder.preset = value;
      session.builder.presetLabel = labelForOption(PRESET_OPTIONS, value, value);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:channels': {
      session.scene = SCENES.builder;
      session.builder.channels = collectionValues(interaction.channels, (channel) => `#${channel.name}`);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:roles': {
      session.scene = SCENES.builder;
      session.builder.roles = collectionValues(interaction.roles, (role) => `@${role.name}`);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:reviewers': {
      session.scene = SCENES.builder;
      session.builder.reviewers = collectionValues(interaction.users, userDisplay);
      session.builder.previewGenerated = false;
      break;
    }
    case 'builder:owners': {
      session.scene = SCENES.builder;
      session.builder.owners = mentionableNamesFromInteraction(interaction);
      session.builder.previewGenerated = false;
      break;
    }
    case 'bug:severity-quick': {
      const value = interaction.values[0];
      session.scene = SCENES.bug;
      session.bug.severityValue = value;
      session.bug.severityLabel = labelForOption(SEVERITY_OPTIONS, value, value);
      break;
    }
    case 'labs:tone-quick': {
      const value = interaction.values[0];
      session.scene = SCENES.labs;
      session.labs.tone = value;
      session.labs.toneLabel = labelForOption(LAB_TONE_OPTIONS, value, value);
      break;
    }
    default: {
      await interaction.reply(buildEphemeralNote('### ⚠️ Unknown control\nThat select menu is not wired to a showcase action.'));
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
      if (await postShowcaseOutcome(interaction, buildTourPublishMessage(session))) {
        await interaction.followUp(buildEphemeralNote('### ✨ Teaser published\nA mock product teaser was posted to the channel and the showcase recorded the updated state.'));
      }
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
      session.builder.modalChannels = [];
      session.builder.modalPosture = 'gated';
      session.builder.modalPostureLabel = 'Gated ship room';
      session.builder.modalPackageValues = ['release-notes', 'qa-checklist'];
      session.builder.modalPackageLabels = ['Release notes', 'QA checklist'];
      session.builder.modalLiveWatch = false;
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
      if (await postShowcaseOutcome(interaction, buildReleasePublishMessage(session))) {
        await interaction.followUp(buildEphemeralNote('### 📦 Launch update published\nThe channel just received a polished Components V2 release update.'));
      }
      return;
    }
    case 'release:reset': {
      session.release.publishedCount = 0;
      await refreshSessionMessage(interaction, session);
      return;
    }
    case 'labs:compose': {
      await interaction.showModal(buildLabsModal(session));
      return;
    }
    case 'labs:publish': {
      if (!session.labs.headline) {
        await interaction.reply(buildEphemeralNote('### 🧪 Compose a labs brief first\nOpen the modal, draft a short brief, and then publish it.'));
        return;
      }

      session.labs.publishedCount += 1;
      await interaction.update(buildMainShowcaseMessage(session, { includeFlags: false }));
      if (await postShowcaseOutcome(interaction, buildLabsPublishMessage(session))) {
        await interaction.followUp(buildEphemeralNote('### 🧪 Labs brief published\nA component-first brief has been posted to the channel.'));
      }
      return;
    }
    default: {
      await interaction.reply(buildEphemeralNote('### ⚠️ Unknown action\nThat control is not wired to a showcase action.'));
    }
  }
}

export async function handleShowcaseModal(interaction) {
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
      session.tour.audienceLabel = labelForOption(AUDIENCE_OPTIONS, audienceValue, audienceValue);
      session.tour.productName = interaction.fields.getTextInputValue(FIELD_IDS.tourName);
      session.tour.highlight = interaction.fields.getTextInputValue(FIELD_IDS.tourHighlight);
      session.scene = SCENES.tour;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(buildEphemeralNote('### ✨ Product tour updated\nThe live showcase message now reflects your revised hero copy and audience framing.'));
      return;
    }
    case 'builder-assistant': {
      session.builder.modalApprovers = collectionValues(
        interaction.fields.getSelectedUsers(FIELD_IDS.builderApprovers, false),
        userDisplay,
      );
      session.builder.modalChannels = collectionValues(
        interaction.fields.getSelectedChannels(FIELD_IDS.builderChannels, false),
        (channel) => `#${channel.name}`,
      );
      const postureValue = getModalFieldValue(interaction.fields, FIELD_IDS.builderPosture) ?? session.builder.modalPosture;
      session.builder.modalPosture = postureValue;
      session.builder.modalPostureLabel = labelForOption(BUILDER_POSTURE_OPTIONS, postureValue, postureValue);
      const packageValues = getModalFieldValues(interaction.fields, FIELD_IDS.builderPackage);
      session.builder.modalPackageValues = packageValues;
      session.builder.modalPackageLabels = labelsForValues(BUILDER_PACKAGE_OPTIONS, packageValues);
      const liveWatchComponent = findModalFieldComponent(interaction.fields, FIELD_IDS.builderLiveWatch);
      session.builder.modalLiveWatch = Boolean(liveWatchComponent?.value);
      session.builder.previewGenerated = true;
      session.scene = SCENES.builder;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(buildEphemeralNote('### 🚀 Launch assistant applied\nThe builder scene now includes radio-group, checkbox-group, and checkbox choices in the live preview.'));
      return;
    }
    case 'bug-report': {
      const severityValue = interaction.fields.getStringSelectValues(FIELD_IDS.bugSeverity)[0];
      session.bug.severityValue = severityValue;
      session.bug.severityLabel = labelForOption(SEVERITY_OPTIONS, severityValue, severityValue);
      session.bug.summary = interaction.fields.getTextInputValue(FIELD_IDS.bugSummary);
      session.bug.reproduction = interaction.fields.getTextInputValue(FIELD_IDS.bugReproduction);
      session.bug.uploadedFileNames = collectionValues(
        interaction.fields.getUploadedFiles(FIELD_IDS.bugFiles, false),
        (file) => file.name,
      );
      session.scene = SCENES.bug;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(buildBugReceiptMessage(session));
      return;
    }
    case 'labs-compose': {
      const toneValue = interaction.fields.getStringSelectValues(FIELD_IDS.labsTone)[0];
      session.labs.tone = toneValue;
      session.labs.toneLabel = labelForOption(LAB_TONE_OPTIONS, toneValue, toneValue);
      session.labs.headline = interaction.fields.getTextInputValue(FIELD_IDS.labsHeadline);
      session.labs.notes = interaction.fields.getTextInputValue(FIELD_IDS.labsNotes) || null;
      session.scene = SCENES.labs;
      await editSessionMessage(interaction.client, session);
      await interaction.reply(buildEphemeralNote('### 🧪 Labs brief updated\nThe labs scene now reflects your new experiment brief draft.'));
      return;
    }
    default: {
      await interaction.reply(buildEphemeralNote('### ⚠️ Unknown modal\nThat modal submission is not wired to a showcase outcome.'));
    }
  }
}
