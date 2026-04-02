import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  FileBuilder,
  FileUploadBuilder,
  LabelBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MentionableSelectMenuBuilder,
  MessageFlags,
  ModalBuilder,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle,
  ThumbnailBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

import {
  ACCENTS,
  AUDIENCE_OPTIONS,
  DEFAULT_TOUR,
  DOCS,
  FIELD_IDS,
  LAB_PANEL_OPTIONS,
  LAB_RING_OPTIONS,
  PRESET_OPTIONS,
  SCENES,
  SCENE_TITLES,
  SEVERITY_OPTIONS,
} from './constants.js';
import { assetUrl, ASSETS, MAIN_MESSAGE_ASSET_NAMES, subsetFiles } from './assets.js';
import { cid } from './ids.js';

const PREVIEW_COMPONENT = Object.freeze({
  TextDisplay: 10,
  Label: 18,
  RadioGroup: 21,
  CheckboxGroup: 22,
  Checkbox: 23,
});

function text(content) {
  return new TextDisplayBuilder().setContent(content);
}

function separator(spacing = SeparatorSpacingSize.Large, divider = false) {
  return new SeparatorBuilder().setSpacing(spacing).setDivider(divider);
}

function fileComponent(name) {
  return new FileBuilder().setURL(assetUrl(name));
}

function gallery(items) {
  const mediaGallery = new MediaGalleryBuilder();

  for (const item of items) {
    mediaGallery.addItems(
      new MediaGalleryItemBuilder()
        .setURL(assetUrl(item.name))
        .setDescription(item.description),
    );
  }

  return mediaGallery;
}

function thumb(name, description) {
  return new ThumbnailBuilder()
    .setURL(assetUrl(name))
    .setDescription(description);
}

function button(customId, label, style, disabled = false) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);
}

function linkButton(label, url) {
  return new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Link)
    .setURL(url);
}

function row(...components) {
  return new ActionRowBuilder().addComponents(...components);
}

function formatList(items, fallback = 'None yet') {
  if (!items || items.length === 0) {
    return fallback;
  }

  return items.join(', ');
}

function sceneNavigationSelect(session) {
  return new StringSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'scene'))
    .setPlaceholder(`Scene: ${SCENE_TITLES[session.scene]}`)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      Object.entries(SCENE_TITLES).map(([value, label]) => ({
        label,
        value,
        description: `Open the ${label} scene`,
        default: value === session.scene,
      })),
    );
}

function sceneNavRows(session) {
  return [
    row(sceneNavigationSelect(session)),
    row(
      button(cid('act', session.id, 'refresh'), 'Refresh view', ButtonStyle.Secondary),
      button(cid('act', session.id, 'reset'), 'Reset demo', ButtonStyle.Danger),
      linkButton('Official docs', DOCS.reference),
    ),
  ];
}

function homeView(session) {
  const main = new ContainerBuilder()
    .setAccentColor(ACCENTS.home)
    .addTextDisplayComponents(
      text('## A cohesive showcase app, not a component dump\nEvery scene here is intentionally product-shaped: polished layout, realistic interactions, session-aware updates, and modal flows that feel natural inside Discord.\n-# The showcase message is fully component-driven. No traditional `content`. No embeds.'),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('### What you can explore'),
          text('- Rich message layouts with sections, containers, separators, media galleries, thumbnails, files, and action rows'),
          text('- Real UI journeys: navigation, stateful updates, modal handoffs, follow-up messages, and publish-style outcomes'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.builder,
            'A premium control surface with layered rollout cards representing the showcase dashboard.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Large))
    .addMediaGalleryComponents(
      gallery([
        {
          name: ASSETS.workflow,
          description: 'A launch workflow board showing polished states, approvals, and handoff lanes.',
        },
        {
          name: ASSETS.analytics,
          description: 'A glossy analytics panel highlighting adoption, interaction depth, and component states.',
        },
        {
          name: ASSETS.quality,
          description: 'A release quality card focused on confidence, QA, and readiness.',
        },
      ]),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(
      text('### Scenes\n**Product Tour** for presentation-led storytelling.\n**Launch Builder** for message and modal select flows.\n**Bug Desk** for practical reporting and triage.\n**Release Room** for announcement and artifact delivery.\n**Labs** for the official preview modal controls.'),
    )
    .addActionRowComponents(
      row(
        button(cid('nav', session.id, `${SCENES.tour}@home-cta`), 'Start the tour', ButtonStyle.Primary),
        button(cid('nav', session.id, `${SCENES.builder}@home-cta`), 'Open builder', ButtonStyle.Secondary),
        button(cid('nav', session.id, `${SCENES.bug}@home-cta`), 'Open bug desk', ButtonStyle.Secondary),
      ),
    );

  const supporting = new ContainerBuilder()
    .setAccentColor(0x2b2d31)
    .addTextDisplayComponents(
      text('## Why this layout matters\nThe goal is to demonstrate how documented Components V2 primitives can be combined into something that feels like a real app surface instead of isolated snippets.'),
      text('Attachments are uploaded once and only revealed when a scene references them through a Thumbnail, Media Gallery, or File component.'),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('### Owner-scoped controls'),
          text('The opener controls the session. Other users can still see the message, but state-changing interactions are intentionally limited to the owner for a realistic public-channel demo pattern.'),
        )
        .setButtonAccessory(
          button(cid('nav', session.id, `${SCENES.release}@home-card`), 'See publish flow', ButtonStyle.Secondary),
        ),
    );

  return [
    text('# Discord Components V2 Showcase\n-# A premium, modular demo built with discord.js and current documented Components V2 behavior.'),
    main,
    separator(SeparatorSpacingSize.Large, true),
    supporting,
    separator(SeparatorSpacingSize.Small),
    fileComponent(ASSETS.manifest),
  ];
}

function tourView(session) {
  const audienceLabel = session.tour.audienceLabel ?? DEFAULT_TOUR.audienceLabel;
  const hero = new ContainerBuilder()
    .setAccentColor(ACCENTS.tour)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(`## ${session.tour.productName}`),
          text(session.tour.highlight),
          text(`-# Audience focus: **${audienceLabel}** · Published teasers: **${session.tour.publishedCount}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.tourHero,
            'A bright product launch card showing glowing feature tiles for a Components V2 product tour.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Large))
    .addMediaGalleryComponents(
      gallery([
        {
          name: ASSETS.workflow,
          description: 'A polished journey board explaining how rich component-driven messages guide a user through a real flow.',
        },
        {
          name: ASSETS.analytics,
          description: 'An analytics surface that feels like a real product dashboard rather than a bare code sample.',
        },
        {
          name: ASSETS.quality,
          description: 'A release readiness snapshot for launch quality and narrative polish.',
        },
      ]),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(
      text('### This scene demonstrates\n- A hero section with contextual thumbnail media\n- A grid-based media gallery for visual storytelling\n- Message updates driven by a personalization modal\n- Public follow-up publishing as a realistic product teaser outcome'),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('### Personalization status'),
          text(`Current product name: **${session.tour.productName}**`),
          text(`Current highlight: ${session.tour.highlight}`),
        )
        .setButtonAccessory(
          button(cid('act', session.id, 'tour:personalize@panel'), 'Personalize', ButtonStyle.Primary),
        ),
    );

  return [
    text(`# ${SCENE_TITLES.tour}\n-# A marketing-grade scene that turns documented components into a polished product story.`),
    hero,
    separator(SeparatorSpacingSize.Large, true),
    fileComponent(ASSETS.launchChecklist),
    row(
      button(cid('act', session.id, 'tour:personalize@row'), 'Personalize', ButtonStyle.Primary),
      button(cid('act', session.id, 'tour:publish'), 'Publish teaser', ButtonStyle.Success),
      button(cid('nav', session.id, `${SCENES.builder}@tour-row`), 'Open builder', ButtonStyle.Secondary),
      linkButton('Reference', DOCS.reference),
    ),
  ];
}

function builderSelectionsSummary(session) {
  const builder = session.builder;
  return [
    `Preset: **${builder.presetLabel}**`,
    `Launch channels: ${formatList(builder.channels)}`,
    `Roles: ${formatList(builder.roles)}`,
    `Reviewers: ${formatList(builder.reviewers)}`,
    `Escalation owners: ${formatList(builder.owners)}`,
    `Modal approvers: ${formatList(builder.modalApprovers)}`,
    `Modal launch roles: ${formatList(builder.modalRoles)}`,
    `Modal owners: ${formatList(builder.modalOwners)}`,
    `Modal channels: ${formatList(builder.modalChannels)}`,
  ].join('\n');
}

function builderPreviewCopy(session) {
  if (!session.builder.previewGenerated) {
    return 'Generate the preview to turn the current selections into a staged rollout summary.';
  }

  return [
    '### Launch preview',
    `We will ship **${session.tour.productName}** using the **${session.builder.presetLabel}** preset.`,
    `Primary rooms: ${formatList(session.builder.channels)}`,
    `Approvals: ${formatList(session.builder.modalApprovers.length ? session.builder.modalApprovers : session.builder.reviewers)}`,
    `Escalation coverage: ${formatList(session.builder.modalOwners.length ? session.builder.modalOwners : session.builder.owners)}`,
    '-# This is the kind of live-updating operational view that works well with Components V2.',
  ].join('\n');
}

function builderView(session) {
  const summary = new ContainerBuilder()
    .setAccentColor(ACCENTS.builder)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Launch Builder'),
          text('Configure a realistic rollout surface using message select menus, then refine it with a modal that uses the newer modal-select patterns.'),
          text(`-# Preview generated: **${session.builder.previewGenerated ? 'yes' : 'not yet'}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.builder,
            'A launch operations panel with layered cards, checklists, and approval lanes.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(
      text(builderSelectionsSummary(session)),
      text(builderPreviewCopy(session)),
    );

  const presetMenu = new StringSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:preset'))
    .setPlaceholder('Choose a rollout preset')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      PRESET_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.builder.preset,
      })),
    );

  const channelsMenu = new ChannelSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:channels'))
    .setPlaceholder('Pick launch channels')
    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setMinValues(0)
    .setMaxValues(3);

  const rolesMenu = new RoleSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:roles'))
    .setPlaceholder('Choose launch roles')
    .setMinValues(0)
    .setMaxValues(3);

  const reviewersMenu = new UserSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:reviewers'))
    .setPlaceholder('Assign reviewers')
    .setMinValues(0)
    .setMaxValues(3);

  const ownersMenu = new MentionableSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:owners'))
    .setPlaceholder('Select escalation owners')
    .setMinValues(0)
    .setMaxValues(4);

  return [
    text(`# ${SCENE_TITLES.builder}\n-# Rich select menus in the message, then deeper curation with modal-based selects.`),
    summary,
    separator(SeparatorSpacingSize.Large, true),
    row(presetMenu),
    row(channelsMenu),
    row(rolesMenu),
    row(reviewersMenu),
    row(ownersMenu),
    row(
      button(cid('act', session.id, 'builder:assistant'), 'Open assistant modal', ButtonStyle.Primary),
      button(cid('act', session.id, 'builder:generate'), 'Generate preview', ButtonStyle.Success),
      button(cid('act', session.id, 'builder:clear'), 'Clear selections', ButtonStyle.Danger),
    ),
  ];
}

function bugView(session) {
  const report = session.bug.summary
    ? [
        '### Latest report',
        `Severity: **${session.bug.severityLabel ?? 'n/a'}**`,
        `Summary: ${session.bug.summary}`,
        `Reproduction: ${session.bug.reproduction}`,
        `Uploaded files: ${formatList(session.bug.uploadedFileNames)}`,
      ].join('\n')
    : '### Latest report\nNo bug report has been submitted in this session yet. Open the modal to walk through a practical report flow.';

  const surface = new ContainerBuilder()
    .setAccentColor(ACCENTS.bug)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Bug Desk'),
          text('A realistic support flow: severity triage, structured written details, optional file uploads, and a stateful summary back in the showcase.'),
          text('-# The modal uses only documented modal patterns and a Discord-safe reporting structure.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.bug,
            'A support operations card showing a bug intake panel and structured triage checklist.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(text(report));

  return [
    text(`# ${SCENE_TITLES.bug}\n-# Structured reporting, realistic UX, and a clean handoff from modal input to message summary.`),
    surface,
    separator(SeparatorSpacingSize.Large, true),
    fileComponent(ASSETS.triageTemplate),
    row(
      button(cid('act', session.id, 'bug:report'), 'Open bug report', ButtonStyle.Primary),
      button(cid('nav', session.id, `${SCENES.release}@bug-row`), 'Go to release room', ButtonStyle.Secondary),
      linkButton('Modal guide', DOCS.modalGuide),
    ),
  ];
}

function releaseView(session) {
  const room = new ContainerBuilder()
    .setAccentColor(ACCENTS.release)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Release Room'),
          text('This scene combines display components, artifacts, and realistic “publish” outcomes into something that feels like a release command center.'),
          text(`-# Published updates in this session: **${session.release.publishedCount}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.quality,
            'A release command panel with confidence metrics and a polished launch card.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Large))
    .addMediaGalleryComponents(
      gallery([
        {
          name: ASSETS.analytics,
          description: 'An analytics snapshot used in a launch readiness room.',
        },
        {
          name: ASSETS.workflow,
          description: 'A rollout workflow board showing dependencies and approvals.',
        },
        {
          name: ASSETS.quality,
          description: 'A quality and release confidence panel.',
        },
      ]),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(
      text('### Included artifacts\n- Release notes displayed as an in-message file component\n- A launch checklist ready to hand off\n- A publish action that posts a polished follow-up message into the channel'),
    )
    .addFileComponents(
      fileComponent(ASSETS.releaseNotes),
      fileComponent(ASSETS.launchChecklist),
    );

  return [
    text(`# ${SCENE_TITLES.release}\n-# Artifact-rich presentation, announcement outcomes, and a clean premium layout.`),
    room,
    row(
      button(cid('act', session.id, 'release:publish'), 'Publish launch update', ButtonStyle.Success),
      button(cid('act', session.id, 'release:reset'), 'Reset publish count', ButtonStyle.Danger),
      linkButton('Message guide', DOCS.messageGuide),
    ),
  ];
}

function labsView(session) {
  const resultCopy = session.labs.lastRunAt
    ? [
        '### Latest Labs result',
        `Release ring: **${session.labs.ring ?? 'n/a'}**`,
        `Included panels: ${formatList(session.labs.panels)}`,
        `Pinned preview: **${session.labs.pinPreview ? 'yes' : 'no'}**`,
      ].join('\n')
    : '### Latest Labs result\nNo labs modal has been submitted yet.';

  const card = new ContainerBuilder()
    .setAccentColor(ACCENTS.labs)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Labs'),
          text('This scene demonstrates the official docs preview modal controls using raw API payloads where discord.js does not yet expose dedicated builders.'),
          text('-# If Discord rejects these preview controls for your app, the rest of the showcase remains fully stable and production-safe.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.analytics,
            'A lab-style control panel with metrics and feature toggles for preview component testing.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(text(resultCopy));

  return [
    text(`# ${SCENE_TITLES.labs}\n-# Officially documented preview modal components, wired in without inventing unsupported builders.`),
    card,
    row(
      button(cid('act', session.id, 'labs:open'), 'Open preview modal', ButtonStyle.Success),
      linkButton('Component reference', DOCS.reference),
    ),
  ];
}

function renderSceneContent(session) {
  switch (session.scene) {
    case SCENES.tour:
      return tourView(session);
    case SCENES.builder:
      return builderView(session);
    case SCENES.bug:
      return bugView(session);
    case SCENES.release:
      return releaseView(session);
    case SCENES.labs:
      return labsView(session);
    case SCENES.home:
    default:
      return homeView(session);
  }
}

export function buildMainShowcaseMessage(session, { includeFiles = false, includeFlags = true } = {}) {
  return {
    ...(includeFlags ? { flags: MessageFlags.IsComponentsV2 } : {}),
    allowedMentions: { parse: [] },
    components: [
      ...renderSceneContent(session),
      separator(SeparatorSpacingSize.Large, true),
      text(`-# Session owner: <@${session.ownerId}> · Current scene: **${SCENE_TITLES[session.scene]}**`),
      ...sceneNavRows(session),
    ],
    ...(includeFiles ? { files: subsetFiles(MAIN_MESSAGE_ASSET_NAMES) } : {}),
  };
}

export function buildOwnerOnlyMessage() {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
    components: [
      text('### This session is locked to the original opener\nOpen your own `/v2-showcase` session to explore the interactions without affecting someone else’s demo state.'),
    ],
  };
}

export function buildMissingSessionMessage() {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
    components: [
      text('### This showcase session has expired\nLaunch `/v2-showcase` again to create a fresh interactive session.'),
    ],
  };
}

export function buildSimpleEphemeralNote(message) {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    allowedMentions: { parse: [] },
    components: [text(message)],
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

  return new ModalBuilder()
    .setCustomId(cid('modal', session.id, 'tour-personalize'))
    .setTitle('Personalize product tour')
    .addTextDisplayComponents(
      text('Adjust the hero copy and audience framing, then the public showcase message updates to reflect the new story.'),
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
    );
}

export function buildBuilderAssistantModal(session) {
  return new ModalBuilder()
    .setCustomId(cid('modal', session.id, 'builder-assistant'))
    .setTitle('Launch assistant')
    .addTextDisplayComponents(
      text('This modal shows the newer documented modal select patterns. Use it to refine the launch plan with richer structured input.'),
    )
    .addLabelComponents(
      new LabelBuilder()
        .setLabel('Approvers')
        .setDescription('Who must sign off on the launch?')
        .setUserSelectMenuComponent(
          new UserSelectMenuBuilder()
            .setCustomId(FIELD_IDS.builderApprovers)
            .setPlaceholder('Select approvers')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3),
        ),
      new LabelBuilder()
        .setLabel('Launch roles')
        .setDescription('Which roles should be highlighted in the rollout copy?')
        .setRoleSelectMenuComponent(
          new RoleSelectMenuBuilder()
            .setCustomId(FIELD_IDS.builderRoles)
            .setPlaceholder('Select roles')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3),
        ),
      new LabelBuilder()
        .setLabel('Escalation owners')
        .setDescription('Select people or roles for the escalation lane.')
        .setMentionableSelectMenuComponent(
          new MentionableSelectMenuBuilder()
            .setCustomId(FIELD_IDS.builderOwners)
            .setPlaceholder('Select mentionables')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(4),
        ),
      new LabelBuilder()
        .setLabel('Announcement channels')
        .setDescription('Pick the rooms that should receive the launch message.')
        .setChannelSelectMenuComponent(
          new ChannelSelectMenuBuilder()
            .setCustomId(FIELD_IDS.builderChannels)
            .setPlaceholder('Select channels')
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3),
        ),
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

  const reproInput = new TextInputBuilder()
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

  return new ModalBuilder()
    .setCustomId(cid('modal', session.id, 'bug-report'))
    .setTitle('Submit bug report')
    .addTextDisplayComponents(
      text('This is intentionally structured like a real support intake flow: severity, concise summary, reproduction detail, and optional supporting uploads.'),
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
        .setTextInputComponent(reproInput),
      new LabelBuilder()
        .setLabel('Supporting files')
        .setDescription('Optional screenshots or logs')
        .setFileUploadComponent(fileUpload),
    );
}

export function buildLabsModal(session) {
  return {
    custom_id: cid('modal', session.id, 'labs-preview'),
    title: 'Labs: preview controls',
    components: [
      {
        type: PREVIEW_COMPONENT.TextDisplay,
        content:
          'These controls are documented by Discord, but discord.js does not yet expose first-class builders for all of them. This modal uses raw API payloads without inventing new builder APIs.',
      },
      {
        type: PREVIEW_COMPONENT.Label,
        label: 'Release ring',
        description: 'Choose exactly one preview ring.',
        component: {
          type: PREVIEW_COMPONENT.RadioGroup,
          custom_id: FIELD_IDS.labsRing,
          options: LAB_RING_OPTIONS,
        },
      },
      {
        type: PREVIEW_COMPONENT.Label,
        label: 'Panels to keep',
        description: 'Select the feature panels that should ship in the demo.',
        component: {
          type: PREVIEW_COMPONENT.CheckboxGroup,
          custom_id: FIELD_IDS.labsPanels,
          min_values: 0,
          max_values: LAB_PANEL_OPTIONS.length,
          required: false,
          options: LAB_PANEL_OPTIONS,
        },
      },
      {
        type: PREVIEW_COMPONENT.Label,
        label: 'Pin preview session',
        description: 'A single yes/no style toggle.',
        component: {
          type: PREVIEW_COMPONENT.Checkbox,
          custom_id: FIELD_IDS.labsPin,
          default: session.labs.pinPreview,
        },
      },
    ],
  };
}

export function buildBugReceiptMessage(session) {
  return {
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
    files: subsetFiles([ASSETS.triageTemplate]),
    allowedMentions: { parse: [] },
    components: [
      text('## Bug report submitted\nThe public showcase message has been updated with the latest triage summary.'),
      new ContainerBuilder()
        .setAccentColor(ACCENTS.bug)
        .addTextDisplayComponents(
          text(`Severity: **${session.bug.severityLabel ?? 'n/a'}**`),
          text(`Summary: ${session.bug.summary ?? 'n/a'}`),
          text(`Uploaded files: ${formatList(session.bug.uploadedFileNames)}`),
        ),
      separator(SeparatorSpacingSize.Small),
      fileComponent(ASSETS.triageTemplate),
    ],
  };
}

export function buildTourPublishMessage(session) {
  return {
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    files: subsetFiles([ASSETS.tourHero, ASSETS.launchChecklist]),
    components: [
      text(`## ${session.tour.productName}\n${session.tour.highlight}`),
      new SectionBuilder()
        .addTextDisplayComponents(
          text(`Audience: **${session.tour.audienceLabel}**`),
          text('This is a mock teaser announcement posted from the showcase flow to demonstrate a realistic publish outcome.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.tourHero,
            'A teaser hero image for the product tour publish flow.',
          ),
        ),
      separator(SeparatorSpacingSize.Small, true),
      fileComponent(ASSETS.launchChecklist),
      row(linkButton('Component reference', DOCS.reference)),
    ],
  };
}

export function buildReleasePublishMessage(session) {
  return {
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    files: subsetFiles([ASSETS.analytics, ASSETS.quality, ASSETS.releaseNotes]),
    components: [
      text('## Launch update published\n-# A polished public-facing outcome from the Release Room scene.'),
      new ContainerBuilder()
        .setAccentColor(ACCENTS.release)
        .addTextDisplayComponents(
          text('### Release posture\nConfidence is high, artifacts are attached, and the release room now shows that a launch update has been published.'),
        )
        .addMediaGalleryComponents(
          gallery([
            {
              name: ASSETS.analytics,
              description: 'A supporting analytics card for the published launch update.',
            },
            {
              name: ASSETS.quality,
              description: 'A quality snapshot for the launch update.',
            },
          ]),
        )
        .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
        .addFileComponents(fileComponent(ASSETS.releaseNotes)),
    ],
  };
}
