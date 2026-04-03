import {
  ChannelSelectMenuBuilder,
  ChannelType,
  FileUploadBuilder,
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from 'discord.js';

import {
  AUDIENCE_OPTIONS,
  BUILDER_PACKAGE_OPTIONS,
  BUILDER_POSTURE_OPTIONS,
  FIELD_IDS,
  LAB_TONE_OPTIONS,
  SEVERITY_OPTIONS,
} from './constants.js';
import { cid } from './ids.js';
import { text } from './primitives.js';
import { validateModalPayload } from './validation.js';

function rawLabel(label, description, component) {
  return {
    type: 18,
    label,
    description,
    component,
  };
}

function rawRadioGroup(customId, options, selectedValue, required = true) {
  return {
    type: 21,
    custom_id: customId,
    required,
    options: options.map((option) => ({
      value: option.value,
      label: option.label,
      description: option.description,
      ...(option.value === selectedValue ? { default: true } : {}),
    })),
  };
}

function rawCheckboxGroup(customId, options, selectedValues, required = false) {
  return {
    type: 22,
    custom_id: customId,
    required,
    options: options.map((option) => ({
      value: option.value,
      label: option.label,
      description: option.description,
      ...(selectedValues.includes(option.value) ? { default: true } : {}),
    })),
  };
}

function rawCheckbox(customId, selected) {
  return {
    type: 23,
    custom_id: customId,
    ...(selected ? { default: true } : {}),
  };
}

export function buildTourModal(session) {
  const audienceSelect = new StringSelectMenuBuilder()
    .setCustomId(FIELD_IDS.tourAudience)
    .setPlaceholder('Choose a launch audience')
    .setMinValues(1)
    .setMaxValues(1)
    .setRequired(true)
    .addOptions(
      AUDIENCE_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.tour.audience,
      })),
    );

  const nameInput = new TextInputBuilder()
    .setCustomId(FIELD_IDS.tourName)
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Display Components V2')
    .setRequired(true)
    .setMaxLength(60)
    .setValue(session.tour.productName);

  const highlightInput = new TextInputBuilder()
    .setCustomId(FIELD_IDS.tourHighlight)
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('What should the hero panel emphasize?')
    .setRequired(true)
    .setMaxLength(400)
    .setValue(session.tour.highlight);

  return validateModalPayload(
    new ModalBuilder()
      .setCustomId(cid('modal', session.id, 'tour-personalize'))
      .setTitle('✨ Personalize product tour')
      .addTextDisplayComponents(
        text('Adjust the hero copy and audience framing, then refresh the live public showcase message.'),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Audience')
          .setDescription('Who should this tour feel optimized for?')
          .setStringSelectMenuComponent(audienceSelect),
        new LabelBuilder()
          .setLabel('Product name')
          .setDescription('This becomes the main hero title.')
          .setTextInputComponent(nameInput),
        new LabelBuilder()
          .setLabel('Highlight line')
          .setDescription('A short premium-value statement for the hero card.')
          .setTextInputComponent(highlightInput),
      ),
    'tour modal',
  );
}

export function buildBuilderAssistantModal(session) {
  return validateModalPayload(
    {
      custom_id: cid('modal', session.id, 'builder-assistant'),
      title: '🚀 Launch assistant',
      components: [
        rawLabel(
          'Approvers',
          'Who must explicitly sign off before launch?',
          new UserSelectMenuBuilder()
            .setCustomId(FIELD_IDS.builderApprovers)
            .setPlaceholder('Select approvers')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3)
            .toJSON(),
        ),
        rawLabel(
          'Announcement channels',
          'Pick the launch rooms that should receive the main update.',
          new ChannelSelectMenuBuilder()
            .setCustomId(FIELD_IDS.builderChannels)
            .setPlaceholder('Select channels')
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3)
            .toJSON(),
        ),
        rawLabel(
          'Rollout posture',
          'Choose the overall shipping style for this launch.',
          rawRadioGroup(FIELD_IDS.builderPosture, BUILDER_POSTURE_OPTIONS, session.builder.modalPosture),
        ),
        rawLabel(
          'Publish package',
          'Select the handoff artifacts to include with the release.',
          rawCheckboxGroup(
            FIELD_IDS.builderPackage,
            BUILDER_PACKAGE_OPTIONS,
            session.builder.modalPackageValues,
            false,
          ),
        ),
        rawLabel(
          'Live watch window',
          'Keep a post-launch monitoring thread active after publish.',
          rawCheckbox(FIELD_IDS.builderLiveWatch, session.builder.modalLiveWatch),
        ),
      ],
    },
    'builder assistant modal',
  );
}

export function buildBugReportModal(session) {
  const severityMenu = new StringSelectMenuBuilder()
    .setCustomId(FIELD_IDS.bugSeverity)
    .setPlaceholder('Choose severity')
    .setRequired(true)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      SEVERITY_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.bug.severityValue,
      })),
    );

  const summaryInput = new TextInputBuilder()
    .setCustomId(FIELD_IDS.bugSummary)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder('A concise one-line bug summary');

  const reproductionInput = new TextInputBuilder()
    .setCustomId(FIELD_IDS.bugReproduction)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1200)
    .setPlaceholder('What happened? What should have happened? How can it be reproduced?');

  const fileUpload = new FileUploadBuilder()
    .setCustomId(FIELD_IDS.bugFiles)
    .setRequired(false)
    .setMinValues(0)
    .setMaxValues(3);

  return validateModalPayload(
    new ModalBuilder()
      .setCustomId(cid('modal', session.id, 'bug-report'))
      .setTitle('🐞 Submit bug report')
      .addTextDisplayComponents(
        text('This intake is structured like a practical support workflow: severity, summary, reproduction, and optional files.'),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Severity')
          .setDescription('How risky is this issue for the launch?')
          .setStringSelectMenuComponent(severityMenu),
        new LabelBuilder()
          .setLabel('Summary')
          .setDescription('One line that triage can scan quickly.')
          .setTextInputComponent(summaryInput),
        new LabelBuilder()
          .setLabel('Reproduction')
          .setDescription('Provide enough detail for a teammate to replay the issue.')
          .setTextInputComponent(reproductionInput),
        new LabelBuilder()
          .setLabel('Supporting files')
          .setDescription('Optional screenshots or logs.')
          .setFileUploadComponent(fileUpload),
      ),
    'bug report modal',
  );
}

export function buildLabsModal(session) {
  const toneMenu = new StringSelectMenuBuilder()
    .setCustomId(FIELD_IDS.labsTone)
    .setPlaceholder('Choose an experiment tone')
    .setRequired(true)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      LAB_TONE_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.labs.tone,
      })),
    );

  const headlineInput = new TextInputBuilder()
    .setCustomId(FIELD_IDS.labsHeadline)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100)
    .setPlaceholder('Headline for the short experiment brief')
    .setValue(session.labs.headline ?? '');

  const notesInput = new TextInputBuilder()
    .setCustomId(FIELD_IDS.labsNotes)
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(500)
    .setPlaceholder('Optional notes, risks, or next actions')
    .setValue(session.labs.notes ?? '');

  return validateModalPayload(
    new ModalBuilder()
      .setCustomId(cid('modal', session.id, 'labs-compose'))
      .setTitle('🧪 Compose labs brief')
      .addTextDisplayComponents(
        text('Draft a short internal experiment brief and push it back into the live showcase.'),
      )
      .addLabelComponents(
        new LabelBuilder()
          .setLabel('Tone')
          .setDescription('How should the brief read?')
          .setStringSelectMenuComponent(toneMenu),
        new LabelBuilder()
          .setLabel('Headline')
          .setDescription('The first line of the brief.')
          .setTextInputComponent(headlineInput),
        new LabelBuilder()
          .setLabel('Notes')
          .setDescription('Optional context for reviewers.')
          .setTextInputComponent(notesInput),
      ),
    'labs modal',
  );
}
