import {
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  MentionableSelectMenuBuilder,
  MessageFlags,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

import { ASSETS, buildAttachments, buildSharedAttachments } from './assets.js';
import { makeId } from './ids.js';
import { nextScene, previousScene, summarizeRouting, summarizeSelection } from './state.js';
import {
  button,
  fileComponent,
  gallery,
  linkButton,
  row,
  sceneMeta,
  sceneSelect,
  separator,
  text,
  thumbnail,
  topLevelIntro,
} from './utils.js';
import { validateV2MessagePayload } from './validation.js';

export const SCENES = Object.freeze({
  home: 'home',
  layouts: 'layouts',
  interactions: 'interactions',
  modals: 'modals',
  workflow: 'workflow',
});

const DOCS_URL = 'https://docs.discord.com/developers/components/overview';

function buildHomeScene(session) {
  return [
    topLevelIntro({
      title: '# 🏠 Learn Components V2 by reading the code',
      description: '-# This reference keeps the project small enough to read in one sitting while still covering the major Components V2 features.',
      assetName: ASSETS.homeHero,
      assetDescription: 'Hero artwork for the educational Components V2 reference bot.',
    }),
    new ContainerBuilder()
      .setAccentColor(0x5865f2)
      .addTextDisplayComponents(
        text('## Core rules to remember'),
        text(`- Send the \`IS_COMPONENTS_V2\` flag on V2 messages.
- Do **not** use legacy \`content\` or \`embeds\` on those messages.
- Attachments do not display automatically; expose them through \`Thumbnail\`, \`MediaGallery\`, or \`File\` components.`),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addMediaGalleryComponents(
        gallery([
          { name: ASSETS.workflowBoard, description: 'A workflow board used throughout the tutorial.' },
          { name: ASSETS.analyticsPanel, description: 'A dashboard image used to demonstrate media galleries.' },
        ]),
      )
      .addActionRowComponents(
        row(
          button(makeId(session.id, 'button', 'jump:layouts'), 'Open layouts', ButtonStyle.Primary),
          button(makeId(session.id, 'button', 'jump:interactions'), 'Open interactions'),
          button(makeId(session.id, 'button', 'jump:modals'), 'Open modals'),
        ),
      ),
    new ContainerBuilder()
      .setAccentColor(0x2b2d31)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('## What this bot demonstrates'),
            text('Each scene focuses on one concept, but the code is intentionally reusable. Browse the helpers in `src/showcase/utils.js`, then compare them with the scene builders in this file.'),
          )
          .setButtonAccessory(button(makeId(session.id, 'button', 'jump:workflow'), 'Open workflow', ButtonStyle.Success)),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
      .addTextDisplayComponents(text('### Included reference file'))
      .addFileComponents(fileComponent(ASSETS.manifest)),
  ];
}

function buildLayoutsScene(session) {
  return [
    topLevelIntro({
      title: '# 🧱 Layouts and display components',
      description: '-# This scene focuses on how Components V2 replaces embeds with explicit layout and content building blocks.',
      assetName: ASSETS.builderPanel,
      assetDescription: 'A layout-focused thumbnail used for the layouts scene.',
    }),
    new ContainerBuilder()
      .setAccentColor(0x57f287)
      .addTextDisplayComponents(text('## Section + Button accessory'))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('A **Section** can hold one to three `Text Display` components.'),
            text('Its accessory can be either a **Button** or a **Thumbnail**. This makes it a great replacement for “headline + CTA” embed patterns.'),
          )
          .setButtonAccessory(button(makeId(session.id, 'button', 'layout:cta'), 'Mark as understood', ButtonStyle.Primary)),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(text('## Section + Thumbnail accessory'))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('This is the thumbnail version of the same pattern.'),
            text('Use this when the image supports the text instead of being the main content.'),
          )
          .setThumbnailAccessory(thumbnail(ASSETS.qualityPanel, 'Thumbnail accessory example for the layouts scene.')),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addTextDisplayComponents(text('## Media gallery + file'))
      .addMediaGalleryComponents(
        gallery([
          { name: ASSETS.analyticsPanel, description: 'Gallery item: analytics panel.' },
          { name: ASSETS.qualityPanel, description: 'Gallery item: quality panel.' },
        ]),
      )
      .addFileComponents(fileComponent(ASSETS.manifest)),
  ];
}

function buildInteractionSummary(session) {
  return new ContainerBuilder()
    .setAccentColor(0xfee75c)
    .addTextDisplayComponents(
      text('## Live interaction state'),
      text(`Last button: **${session.interactions.lastButton}** · Total button presses: **${session.interactions.buttonPresses}**`),
      text(`String Select: ${session.interactions.stringChoice}`),
      text(`User Select: ${summarizeSelection(session.interactions.userChoices)}`),
      text(`Role Select: ${summarizeSelection(session.interactions.roleChoices)}`),
      text(`Mentionable Select: ${summarizeSelection(session.interactions.mentionableChoices)}`),
      text(`Channel Select: ${summarizeSelection(session.interactions.channelChoices)}`),
    );
}

function buildInteractionsScene(session) {
  return [
    topLevelIntro({
      title: '# 🎛️ Buttons and message select menus',
      description: '-# Action Rows can hold up to five buttons or one select menu. This scene demonstrates every select type supported in messages.',
      assetName: ASSETS.bugPanel,
      assetDescription: 'Thumbnail for the interactions scene.',
    }),
    buildInteractionSummary(session),
    new ContainerBuilder()
      .setAccentColor(0xeb459e)
      .addTextDisplayComponents(text('## Button row'))
      .addActionRowComponents(
        row(
          button(makeId(session.id, 'button', 'press:primary'), 'Primary', ButtonStyle.Primary),
          button(makeId(session.id, 'button', 'press:secondary'), 'Secondary'),
          button(makeId(session.id, 'button', 'press:success'), 'Success', ButtonStyle.Success),
          button(makeId(session.id, 'button', 'press:danger'), 'Danger', ButtonStyle.Danger),
          linkButton('Docs', DOCS_URL),
        ),
      ),
    new ContainerBuilder()
      .setAccentColor(0x3498db)
      .addTextDisplayComponents(text('## Message select menus'))
      .addActionRowComponents(
        row(
          new StringSelectMenuBuilder()
            .setCustomId(makeId(session.id, 'select', 'string'))
            .setPlaceholder('String Select example')
            .addOptions(
              { label: 'Compact', value: 'compact', default: session.interactions.stringChoice === 'compact' },
              { label: 'Balanced', value: 'balanced', default: session.interactions.stringChoice === 'balanced' },
              { label: 'Detailed', value: 'detailed', default: session.interactions.stringChoice === 'detailed' },
            ),
        ),
        row(
          new UserSelectMenuBuilder()
            .setCustomId(makeId(session.id, 'select', 'user'))
            .setPlaceholder('User Select example')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2),
        ),
        row(
          new RoleSelectMenuBuilder()
            .setCustomId(makeId(session.id, 'select', 'role'))
            .setPlaceholder('Role Select example')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2),
        ),
        row(
          new MentionableSelectMenuBuilder()
            .setCustomId(makeId(session.id, 'select', 'mentionable'))
            .setPlaceholder('Mentionable Select example')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(3),
        ),
        row(
          new ChannelSelectMenuBuilder()
            .setCustomId(makeId(session.id, 'select', 'channel'))
            .setPlaceholder('Channel Select example')
            .setRequired(false)
            .setMinValues(0)
            .setMaxValues(2)
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
      ),
  ];
}

function buildModalSummary(session) {
  const routing = summarizeRouting(session.modals.routing);
  return new ContainerBuilder()
    .setAccentColor(0x9b59b6)
    .addTextDisplayComponents(
      text('## Last modal results'),
      text(`Survey title: **${session.modals.feedback.title}** · Audience: **${session.modals.feedback.audience}** · Teaching mode: **${session.modals.feedback.mode}**`),
      text(`Chosen features: ${summarizeSelection(session.modals.feedback.features)}`),
      text(`Confirmed before publish: **${session.modals.feedback.confirmed ? 'Yes' : 'No'}**`),
      text(`Routing summary: approver **${routing.approver}**, role **${routing.role}**, mentionable **${routing.mention}**, channel **${routing.channel}**, uploaded files **${routing.uploadCount}**`),
      text(`Guided note: ${session.modals.note ?? 'No note submitted yet.'}`),
    );
}

function buildModalsScene(session) {
  return [
    topLevelIntro({
      title: '# 🪟 Modals',
      description: '-# This scene splits the modal surface into three small examples so beginners can understand each part without reading one giant form.',
      assetName: ASSETS.labsPanel,
      assetDescription: 'Thumbnail for the modals scene.',
    }),
    buildModalSummary(session),
    new ContainerBuilder()
      .setAccentColor(0x9b59b6)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('## Modal 1: survey controls'),
            text('Includes `Text Input`, modal `String Select`, `Radio Group`, `Checkbox Group`, and `Checkbox`.'),
          )
          .setButtonAccessory(button(makeId(session.id, 'button', 'modal:feedback'), 'Open survey modal', ButtonStyle.Primary)),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('## Modal 2: routing controls'),
            text('Includes `User`, `Role`, `Mentionable`, `Channel`, and `File Upload` modal components.'),
          )
          .setButtonAccessory(button(makeId(session.id, 'button', 'modal:routing'), 'Open routing modal', ButtonStyle.Secondary)),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('## Modal 3: Text Display inside a modal'),
            text('A tiny example that shows modal `Text Display` working alongside a regular `Text Input`.'),
          )
          .setButtonAccessory(button(makeId(session.id, 'button', 'modal:note'), 'Open note modal', ButtonStyle.Success)),
      ),
  ];
}

function buildWorkflowScene(session) {
  return [
    topLevelIntro({
      title: '# 🚀 Workflow and follow-ups',
      description: '-# This scene shows a realistic flow: update the main message, publish a separate V2 follow-up, and expose files through components.',
      assetName: ASSETS.workflowBoard,
      assetDescription: 'Workflow thumbnail for the publishing scene.',
    }),
    new ContainerBuilder()
      .setAccentColor(0xed4245)
      .addTextDisplayComponents(
        text('## Publish state'),
        text(`Current stage: **${session.workflow.stage}** · Public posts sent: **${session.workflow.publishCount}**`),
        text('The publish button sends a **second** Components V2 message to the channel. That follow-up uses a thumbnail, text, and a file component.'),
      )
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            text('### Files in a normal message'),
            text('This scene keeps two file components with explanatory text between them so you can see that attachments are just another building block in the layout.'),
          )
          .setButtonAccessory(button(makeId(session.id, 'button', 'workflow:stage:review'), 'Set review stage', ButtonStyle.Secondary)),
      )
      .addFileComponents(fileComponent(ASSETS.releaseNotes))
      .addTextDisplayComponents(text('These markdown files are attached to the main message once and then exposed with `File` components.'))
      .addFileComponents(fileComponent(ASSETS.triageTemplate))
      .addSeparatorComponents(separator(SeparatorSpacingSize.Small))
      .addActionRowComponents(
        row(
          new StringSelectMenuBuilder()
            .setCustomId(makeId(session.id, 'select', 'workflow-stage'))
            .setPlaceholder('Choose a workflow stage')
            .addOptions(
              { label: 'Draft', value: 'draft', default: session.workflow.stage === 'draft' },
              { label: 'Review', value: 'review', default: session.workflow.stage === 'review' },
              { label: 'Published', value: 'published', default: session.workflow.stage === 'published' },
            ),
        ),
      )
      .addActionRowComponents(
        row(
          button(makeId(session.id, 'button', 'workflow:publish'), 'Publish demo post', ButtonStyle.Success),
          button(makeId(session.id, 'button', 'workflow:reset'), 'Reset workflow', ButtonStyle.Danger),
        ),
      ),
  ];
}

function buildScene(session) {
  switch (session.scene) {
    case SCENES.layouts:
      return buildLayoutsScene(session);
    case SCENES.interactions:
      return buildInteractionsScene(session);
    case SCENES.modals:
      return buildModalsScene(session);
    case SCENES.workflow:
      return buildWorkflowScene(session);
    case SCENES.home:
    default:
      return buildHomeScene(session);
  }
}

function buildNavigation(session) {
  return [
    separator(SeparatorSpacingSize.Large, true),
    text(`-# Session owner: <@${session.ownerId}> · Current scene: **${sceneMeta[session.scene].label}**`),
    row(sceneSelect(makeId(session.id, 'select', 'scene'), session.scene)),
    row(
      button(makeId(session.id, 'button', 'nav:previous'), 'Previous'),
      button(makeId(session.id, 'button', 'nav:home'), 'Home', ButtonStyle.Primary),
      button(makeId(session.id, 'button', 'nav:next'), 'Next'),
    ),
  ];
}

export function buildMainMessage(session, { includeFiles = false, includeFlags = true } = {}) {
  const payload = {
    ...(includeFlags ? { flags: MessageFlags.IsComponentsV2 } : {}),
    components: [...buildScene(session), ...buildNavigation(session)],
    ...(includeFiles ? { files: buildSharedAttachments() } : {}),
  };

  return validateV2MessagePayload(payload, 'main reference message');
}

export function buildPublicWorkflowPost(session) {
  const payload = {
    flags: MessageFlags.IsComponentsV2,
    files: buildAttachments([ASSETS.workflowBoard, ASSETS.releaseNotes]),
    components: [
      topLevelIntro({
        title: '# 🚀 Public workflow post',
        description: `-# Published from the reference bot. This is post number **${session.workflow.publishCount}**.`,
        assetName: ASSETS.workflowBoard,
        assetDescription: 'Thumbnail used in the public workflow post.',
      }),
      text('This second message exists to show that interactions can update the original message **and** create follow-up V2 messages.'),
      separator(SeparatorSpacingSize.Small),
      fileComponent(ASSETS.releaseNotes),
    ],
  };

  return validateV2MessagePayload(payload, 'workflow follow-up');
}

export function moveToScene(session, scene) {
  session.scene = scene;
}

export function moveToNextScene(session) {
  session.scene = nextScene(session.scene);
}

export function moveToPreviousScene(session) {
  session.scene = previousScene(session.scene);
}
