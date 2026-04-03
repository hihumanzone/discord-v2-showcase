import {
  ChannelSelectMenuBuilder,
  ChannelType,
  FileUploadBuilder,
  LabelBuilder,
  MentionableSelectMenuBuilder,
  ModalBuilder,
  RoleSelectMenuBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from 'discord.js';

import { makeId } from './ids.js';
import { validateModalPayload } from './validation.js';

export const FIELD_IDS = Object.freeze({
  feedbackTitle: 'feedback_title',
  feedbackAudience: 'feedback_audience',
  feedbackMode: 'feedback_mode',
  feedbackFeatures: 'feedback_features',
  feedbackConfirmed: 'feedback_confirmed',
  routingUsers: 'routing_users',
  routingRoles: 'routing_roles',
  routingMentions: 'routing_mentions',
  routingChannels: 'routing_channels',
  routingFiles: 'routing_files',
  guidedNote: 'guided_note',
});

export const FEEDBACK_AUDIENCE_OPTIONS = Object.freeze([
  { label: 'Developers', value: 'developers', description: 'People learning the API directly' },
  { label: 'Designers', value: 'designers', description: 'People reviewing layout patterns' },
  { label: 'Moderators', value: 'moderators', description: 'People focused on operational workflows' },
]);

export const FEEDBACK_MODE_OPTIONS = Object.freeze([
  { label: 'Guided', value: 'guided', description: 'Teach with extra explanation' },
  { label: 'Balanced', value: 'balanced', description: 'Explain only the important parts' },
  { label: 'Minimal', value: 'minimal', description: 'Show the smallest valid pattern' },
]);

export const FEATURE_OPTIONS = Object.freeze([
  { label: 'Media galleries', value: 'media', description: 'Show image-rich layouts' },
  { label: 'File components', value: 'files', description: 'Expose attached markdown and assets' },
  { label: 'Select menus', value: 'selects', description: 'Show interactive filtering choices' },
]);

function rawLabel(label, description, component) {
  return {
    type: 18,
    label,
    description,
    component,
  };
}

// discord.js may not yet expose first-class builders for every new modal control.
// These helpers stay close to the documented Discord API payload shape.
function rawRadioGroup(customId, options, selectedValue) {
  return {
    type: 21,
    custom_id: customId,
    required: true,
    options: options.map((option) => ({
      value: option.value,
      label: option.label,
      description: option.description,
      ...(option.value === selectedValue ? { default: true } : {}),
    })),
  };
}

function rawCheckboxGroup(customId, options, selectedValues) {
  return {
    type: 22,
    custom_id: customId,
    required: false,
    min_values: 0,
    max_values: options.length,
    options: options.map((option) => ({
      value: option.value,
      label: option.label,
      description: option.description,
      ...(selectedValues.includes(option.value) ? { default: true } : {}),
    })),
  };
}

function rawCheckbox(customId, checked) {
  return {
    type: 23,
    custom_id: customId,
    ...(checked ? { default: true } : {}),
  };
}

export function buildFeedbackModal(session) {
  const modal = {
    custom_id: makeId(session.id, 'modal', 'feedback'),
    title: '🪟 Modal survey',
    components: [
      rawLabel(
        'Project title',
        'A short headline for the teaching example.',
        new TextInputBuilder()
          .setCustomId(FIELD_IDS.feedbackTitle)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(80)
          .setValue(session.modals.feedback.title)
          .toJSON(),
      ),
      rawLabel(
        'Audience',
        'A String Select can also live inside a modal when wrapped by a Label.',
        new StringSelectMenuBuilder()
          .setCustomId(FIELD_IDS.feedbackAudience)
          .setPlaceholder('Choose an audience')
          .setRequired(true)
          .setMinValues(1)
          .setMaxValues(1)
          .addOptions(
            FEEDBACK_AUDIENCE_OPTIONS.map((option) => ({
              ...option,
              default: option.value === session.modals.feedback.audience,
            })),
          )
          .toJSON(),
      ),
      rawLabel(
        'Teaching mode',
        'Radio Group is a single-choice control that is available only in modals.',
        rawRadioGroup(FIELD_IDS.feedbackMode, FEEDBACK_MODE_OPTIONS, session.modals.feedback.mode),
      ),
      rawLabel(
        'Feature checklist',
        'Checkbox Group is the multi-select modal companion to Radio Group.',
        rawCheckboxGroup(FIELD_IDS.feedbackFeatures, FEATURE_OPTIONS, session.modals.feedback.features),
      ),
      rawLabel(
        'Ready to publish?',
        'Checkbox is the simplest yes/no modal control.',
        rawCheckbox(FIELD_IDS.feedbackConfirmed, session.modals.feedback.confirmed),
      ),
    ],
  };

  return validateModalPayload(modal, 'feedback modal');
}

export function buildRoutingModal(session) {
  const modal = new ModalBuilder()
    .setCustomId(makeId(session.id, 'modal', 'routing'))
    .setTitle('📬 Routing modal')
    .addLabelComponents(
      new LabelBuilder()
        .setLabel('Approvers')
        .setDescription('User Select inside a modal.')
        .setUserSelectMenuComponent(
          new UserSelectMenuBuilder()
            .setCustomId(FIELD_IDS.routingUsers)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2),
        ),
      new LabelBuilder()
        .setLabel('Roles')
        .setDescription('Role Select inside a modal.')
        .setRoleSelectMenuComponent(
          new RoleSelectMenuBuilder()
            .setCustomId(FIELD_IDS.routingRoles)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2),
        ),
      new LabelBuilder()
        .setLabel('Mentionables')
        .setDescription('Mentionable Select inside a modal.')
        .setMentionableSelectMenuComponent(
          new MentionableSelectMenuBuilder()
            .setCustomId(FIELD_IDS.routingMentions)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3),
        ),
      new LabelBuilder()
        .setLabel('Channels')
        .setDescription('Channel Select inside a modal.')
        .setChannelSelectMenuComponent(
          new ChannelSelectMenuBuilder()
            .setCustomId(FIELD_IDS.routingChannels)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2)
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
      new LabelBuilder()
        .setLabel('Supporting files')
        .setDescription('File Upload inside a modal.')
        .setFileUploadComponent(
          new FileUploadBuilder()
            .setCustomId(FIELD_IDS.routingFiles)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2),
        ),
    );

  return validateModalPayload(modal, 'routing modal');
}

export function buildGuidedNoteModal(session) {
  const modal = new ModalBuilder()
    .setCustomId(makeId(session.id, 'modal', 'note'))
    .setTitle('📝 Guided note modal')
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('This line is a **Text Display** inside a modal. Use it for instructions, context, or a small teaching note.'),
    )
    .addLabelComponents(
      new LabelBuilder()
        .setLabel('Quick note')
        .setDescription('A single Text Input paired with the modal Text Display above.')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId(FIELD_IDS.guidedNote)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
            .setMaxLength(300)
            .setValue(session.modals.note ?? 'Text Display makes modal instructions easier to read.'),
        ),
    );

  return validateModalPayload(modal, 'guided note modal');
}
