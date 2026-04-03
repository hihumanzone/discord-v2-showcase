import { MessageFlags } from 'discord.js';

import {
  FIELD_IDS,
  buildFeedbackModal,
  buildGuidedNoteModal,
  buildRoutingModal,
} from './modals.js';
import {
  SCENES,
  buildMainMessage,
  buildPublicWorkflowPost,
  moveToNextScene,
  moveToPreviousScene,
  moveToScene,
} from './scenes.js';
import { parseId } from './ids.js';
import { createSession, sessionStore } from './state.js';
import { text } from './utils.js';
import { validateV2MessagePayload } from './validation.js';
import { COMMAND_NAME } from '../commands.js';

function userName(user) {
  return user?.globalName ?? user?.displayName ?? user?.username ?? 'Unknown user';
}

function collectionNames(collection, formatter) {
  if (!collection) {
    return [];
  }

  return Array.from(collection.values()).map(formatter);
}

function mentionableNames(selection) {
  if (!selection) {
    return [];
  }

  const users = selection.users ? collectionNames(selection.users, userName) : [];
  const roles = selection.roles ? collectionNames(selection.roles, (role) => `@${role.name}`) : [];
  return [...users, ...roles];
}

function candidateFieldEntries(fields) {
  const entries = [];

  if (Array.isArray(fields?.components)) {
    entries.push(...fields.components);
  }

  if (fields?.fields?.size) {
    entries.push(...fields.fields.values());
  }

  return entries;
}

function findModalFieldComponent(fields, customId) {
  for (const entry of candidateFieldEntries(fields)) {
    const component = entry?.component ?? entry;
    const entryCustomId = component?.customId ?? component?.custom_id;

    if (entryCustomId === customId) {
      return component;
    }
  }

  return null;
}

function modalFieldValue(fields, customId) {
  return findModalFieldComponent(fields, customId)?.value ?? null;
}

function modalFieldValues(fields, customId) {
  return findModalFieldComponent(fields, customId)?.values ?? [];
}

function buildEphemeralNote(markdown) {
  return validateV2MessagePayload(
    {
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
      components: [text(markdown)],
    },
    'ephemeral note',
  );
}

async function ensureOwnedSession(interaction, session) {
  if (!session) {
    await interaction.reply(buildEphemeralNote('### ⚠️ Session not found\nThis showcase session no longer exists. Run `/v2-reference` again.'));
    return false;
  }

  if (session.ownerId !== interaction.user.id) {
    await interaction.reply(buildEphemeralNote(`### 🔒 This session belongs to someone else\nOnly <@${session.ownerId}> can mutate this reference message.`));
    return false;
  }

  return true;
}

async function editMainMessage(client, session) {
  if (!session.channelId || !session.messageId) {
    return;
  }

  const channel = await client.channels.fetch(session.channelId);
  if (!channel?.messages?.edit) {
    throw new Error('The session channel does not support message editing.');
  }

  await channel.messages.edit(session.messageId, buildMainMessage(session, { includeFlags: false }));
}

function recordButtonPress(session, label) {
  session.interactions.buttonPresses += 1;
  session.interactions.lastButton = label;
  session.scene = SCENES.interactions;
}

export async function handleCommandInteraction(interaction) {
  if (interaction.commandName !== COMMAND_NAME) {
    return;
  }

  const requestedScene = interaction.options.getString('scene') ?? SCENES.home;
  const session = createSession(interaction.user.id, requestedScene);
  session.channelId = interaction.channelId;
  sessionStore.set(session.id, session);

  await interaction.reply(buildMainMessage(session, { includeFiles: true }));
  const reply = await interaction.fetchReply();
  session.messageId = reply.id;
}

export async function handleMessageComponentInteraction(interaction) {
  const parsed = parseId(interaction.customId);
  if (!parsed) {
    return;
  }

  const session = sessionStore.get(parsed.sessionId);
  if (!(await ensureOwnedSession(interaction, session))) {
    return;
  }

  if (parsed.kind === 'select') {
    switch (parsed.action) {
      case 'scene':
        moveToScene(session, interaction.values[0]);
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      case 'string':
        session.interactions.stringChoice = interaction.values[0];
        session.scene = SCENES.interactions;
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      case 'user':
        session.interactions.userChoices = collectionNames(interaction.users, userName);
        session.scene = SCENES.interactions;
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      case 'role':
        session.interactions.roleChoices = collectionNames(interaction.roles, (role) => `@${role.name}`);
        session.scene = SCENES.interactions;
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      case 'mentionable':
        session.interactions.mentionableChoices = mentionableNames(interaction);
        session.scene = SCENES.interactions;
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      case 'channel':
        session.interactions.channelChoices = collectionNames(interaction.channels, (channel) => `#${channel.name}`);
        session.scene = SCENES.interactions;
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      case 'workflow-stage':
        session.workflow.stage = interaction.values[0];
        session.scene = SCENES.workflow;
        await interaction.update(buildMainMessage(session, { includeFlags: false }));
        return;
      default:
        await interaction.reply(buildEphemeralNote('### ⚠️ Unknown select menu\nThat select menu is not wired to a reference action.'));
        return;
    }
  }

  if (parsed.kind !== 'button') {
    return;
  }

  switch (parsed.action) {
    case 'nav:previous':
      moveToPreviousScene(session);
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'nav:home':
      moveToScene(session, SCENES.home);
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'nav:next':
      moveToNextScene(session);
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'jump:layouts':
    case 'jump:interactions':
    case 'jump:modals':
    case 'jump:workflow':
      moveToScene(session, parsed.action.split(':')[1]);
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'layout:cta':
      recordButtonPress(session, 'Layout CTA');
      moveToScene(session, SCENES.layouts);
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'press:primary':
      recordButtonPress(session, 'Primary button');
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'press:secondary':
      recordButtonPress(session, 'Secondary button');
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'press:success':
      recordButtonPress(session, 'Success button');
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'press:danger':
      recordButtonPress(session, 'Danger button');
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'modal:feedback':
      await interaction.showModal(buildFeedbackModal(session));
      return;
    case 'modal:routing':
      await interaction.showModal(buildRoutingModal(session));
      return;
    case 'modal:note':
      await interaction.showModal(buildGuidedNoteModal(session));
      return;
    case 'workflow:stage:review':
      session.workflow.stage = 'review';
      session.scene = SCENES.workflow;
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    case 'workflow:publish':
      session.workflow.stage = 'published';
      session.workflow.publishCount += 1;
      session.workflow.lastPublishedScene = session.scene;
      session.scene = SCENES.workflow;
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      await interaction.followUp(buildPublicWorkflowPost(session));
      return;
    case 'workflow:reset':
      session.workflow.stage = 'draft';
      session.workflow.publishCount = 0;
      session.workflow.lastPublishedScene = null;
      session.scene = SCENES.workflow;
      await interaction.update(buildMainMessage(session, { includeFlags: false }));
      return;
    default:
      await interaction.reply(buildEphemeralNote('### ⚠️ Unknown button\nThat button is not wired to a reference action.'));
  }
}

export async function handleModalSubmitInteraction(interaction) {
  const parsed = parseId(interaction.customId);
  if (!parsed || parsed.kind !== 'modal') {
    return;
  }

  const session = sessionStore.get(parsed.sessionId);
  if (!(await ensureOwnedSession(interaction, session))) {
    return;
  }

  switch (parsed.action) {
    case 'feedback':
      session.modals.feedback.title = interaction.fields.getTextInputValue(FIELD_IDS.feedbackTitle);
      session.modals.feedback.audience = interaction.fields.getStringSelectValues(FIELD_IDS.feedbackAudience)[0];
      session.modals.feedback.mode = modalFieldValue(interaction.fields, FIELD_IDS.feedbackMode) ?? session.modals.feedback.mode;
      session.modals.feedback.features = modalFieldValues(interaction.fields, FIELD_IDS.feedbackFeatures);
      session.modals.feedback.confirmed = Boolean(modalFieldValue(interaction.fields, FIELD_IDS.feedbackConfirmed));
      session.scene = SCENES.modals;
      await editMainMessage(interaction.client, session);
      await interaction.reply(buildEphemeralNote('### ✅ Survey modal submitted\nThe modals scene now reflects your Text Input, String Select, Radio Group, Checkbox Group, and Checkbox values.'));
      return;
    case 'routing':
      session.modals.routing.approvers = collectionNames(interaction.fields.getSelectedUsers(FIELD_IDS.routingUsers, false), userName);
      session.modals.routing.roles = collectionNames(interaction.fields.getSelectedRoles(FIELD_IDS.routingRoles, false), (role) => `@${role.name}`);
      session.modals.routing.mentions = mentionableNames(interaction.fields.getSelectedMentionables(FIELD_IDS.routingMentions, false));
      session.modals.routing.channels = collectionNames(interaction.fields.getSelectedChannels(FIELD_IDS.routingChannels, false), (channel) => `#${channel.name}`);
      session.modals.routing.uploadedFiles = collectionNames(interaction.fields.getUploadedFiles(FIELD_IDS.routingFiles, false), (file) => file.name);
      session.scene = SCENES.modals;
      await editMainMessage(interaction.client, session);
      await interaction.reply(buildEphemeralNote('### ✅ Routing modal submitted\nThe modals scene now reflects the modal select menus and file upload results.'));
      return;
    case 'note':
      session.modals.note = interaction.fields.getTextInputValue(FIELD_IDS.guidedNote);
      session.scene = SCENES.modals;
      await editMainMessage(interaction.client, session);
      await interaction.reply(buildEphemeralNote('### ✅ Guided note submitted\nThe modals scene now shows the result of the modal Text Display + Text Input example.'));
      return;
    default:
      await interaction.reply(buildEphemeralNote('### ⚠️ Unknown modal\nThat modal submission is not wired to a reference action.'));
  }
}
