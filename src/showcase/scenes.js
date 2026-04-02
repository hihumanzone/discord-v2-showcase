import {
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
} from 'discord.js';

import { ASSETS } from './assets.js';
import {
  ACCENTS,
  DOCS,
  PRESET_OPTIONS,
  SCENES,
  SCENE_TITLES,
} from './constants.js';
import { formatList } from './helpers.js';
import { cid } from './ids.js';
import {
  button,
  fileComponent,
  gallery,
  linkButton,
  row,
  separator,
  text,
  thumb,
} from './primitives.js';

function buildNavigationSelect(session) {
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

export function buildNavigationRows(session) {
  return [
    row(buildNavigationSelect(session)),
    row(
      button(cid('act', session.id, 'refresh'), 'Refresh', ButtonStyle.Secondary),
      button(cid('act', session.id, 'reset'), 'Reset', ButtonStyle.Danger),
      linkButton('Docs', DOCS.reference),
    ),
  ];
}

function homeScene(session) {
  const hero = new ContainerBuilder()
    .setAccentColor(ACCENTS.home)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## A polished Components V2 product surface'),
          text('This showcase is intentionally cohesive: every scene is a real interaction pattern, not a pile of disconnected snippets.'),
          text('-# The public message is fully component-driven. No legacy `content`. No embeds. No attachment auto-rendering.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.homeHero,
            'A premium control room style hero for the Components V2 showcase.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Large))
    .addTextDisplayComponents(
      text('### What this demo covers\n- Rich message layouts with containers, sections, separators, media galleries, thumbnails, and file components\n- Stateful buttons and select menus in a shared public message\n- Modal flows that update the original showcase and also produce realistic follow-up outcomes'),
    )
    .addMediaGalleryComponents(
      gallery([
        {
          name: ASSETS.workflow,
          description: 'A rollout board showing clear approvals, handoffs, and launch stages.',
        },
        {
          name: ASSETS.analytics,
          description: 'A glossy analytics panel illustrating adoption and interaction depth.',
        },
        {
          name: ASSETS.quality,
          description: 'A release readiness panel for confidence and QA posture.',
        },
      ]),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addActionRowComponents(
      row(
        button(cid('nav', session.id, `${SCENES.tour}@home`), 'Start tour', ButtonStyle.Primary),
        button(cid('nav', session.id, `${SCENES.builder}@home`), 'Open builder', ButtonStyle.Secondary),
        button(cid('nav', session.id, `${SCENES.release}@home`), 'Release room', ButtonStyle.Secondary),
      ),
    );

  const supporting = new ContainerBuilder()
    .setAccentColor(0x2b2d31)
    .addTextDisplayComponents(
      text('## Explore intentionally named scenes'),
      text('**Product Tour** demonstrates rich storytelling. **Launch Builder** demonstrates message select menus plus modal selects. **Bug Desk** shows structured reporting. **Release Room** handles publish outcomes. **Labs** adds one more polished modal workflow.'),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('### Public-channel safe behavior'),
          text('Only the original opener can mutate the shared state. Other viewers can read the showcase without hijacking the active demo session.'),
        )
        .setButtonAccessory(
          button(cid('nav', session.id, `${SCENES.bug}@home`), 'Open bug desk', ButtonStyle.Secondary),
        ),
    );

  return [
    text('# Discord Components V2 Showcase\n-# A production-ready discord.js demo built around current documented Components V2 behavior.'),
    hero,
    separator(SeparatorSpacingSize.Large, true),
    supporting,
    separator(SeparatorSpacingSize.Small),
    fileComponent(ASSETS.manifest),
  ];
}

function tourScene(session) {
  const hero = new ContainerBuilder()
    .setAccentColor(ACCENTS.tour)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(`## ${session.tour.productName}`),
          text(session.tour.highlight),
          text(`-# Audience: **${session.tour.audienceLabel}** · Published teasers: **${session.tour.publishedCount}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.tourHero,
            'A launch hero panel for a polished product storytelling scene.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Large))
    .addMediaGalleryComponents(
      gallery([
        {
          name: ASSETS.workflow,
          description: 'A visual explanation of how a component-first launch journey is staged.',
        },
        {
          name: ASSETS.analytics,
          description: 'Metrics framing that makes the product story feel operationally grounded.',
        },
        {
          name: ASSETS.quality,
          description: 'A release quality card used as social proof in the story.',
        },
      ]),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(
      text('### This scene demonstrates\n- Hero storytelling with a thumbnail accessory\n- Media gallery presentation inside a cohesive launch narrative\n- Personalization through a modal\n- Public follow-up publishing as a realistic outcome'),
    );

  return [
    text(`# ${SCENE_TITLES.tour}\n-# Presentation-led storytelling with a polished modal handoff.`),
    hero,
    separator(SeparatorSpacingSize.Small),
    row(
      button(cid('act', session.id, 'tour:personalize'), 'Personalize', ButtonStyle.Primary),
      button(cid('act', session.id, 'tour:publish'), 'Publish teaser', ButtonStyle.Success),
      button(cid('nav', session.id, `${SCENES.builder}@tour`), 'Open builder', ButtonStyle.Secondary),
      linkButton('Reference', DOCS.reference),
    ),
  ];
}

function builderSummary(session) {
  const builder = session.builder;
  return [
    `Preset: **${builder.presetLabel}**`,
    `Launch channels: ${formatList(builder.channels)}`,
    `Roles: ${formatList(builder.roles)}`,
    `Reviewers: ${formatList(builder.reviewers)}`,
    `Escalation owners: ${formatList(builder.owners)}`,
    `Modal approvers: ${formatList(builder.modalApprovers)}`,
    `Modal launch roles: ${formatList(builder.modalRoles)}`,
    `Modal channels: ${formatList(builder.modalChannels)}`,
  ].join('\n');
}

function builderPreview(session) {
  if (!session.builder.previewGenerated) {
    return 'Generate a preview to turn the current selections into a staged rollout summary.';
  }

  const builder = session.builder;
  return [
    '### Launch preview',
    `We will ship **${session.tour.productName}** with the **${builder.presetLabel}** preset.`,
    `Primary rooms: ${formatList(builder.modalChannels.length ? builder.modalChannels : builder.channels)}`,
    `Approvals: ${formatList(builder.modalApprovers.length ? builder.modalApprovers : builder.reviewers)}`,
    `Escalation coverage: ${formatList(builder.modalOwners.length ? builder.modalOwners : builder.owners)}`,
  ].join('\n');
}

function builderScene(session) {
  const summary = new ContainerBuilder()
    .setAccentColor(ACCENTS.builder)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Launch Builder'),
          text('Configure a realistic rollout using message select menus, then enrich it with a modal using the newer modal-select patterns.'),
          text(`-# Preview generated: **${session.builder.previewGenerated ? 'yes' : 'not yet'}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.builder,
            'An operational launch builder surface with approvals and routing lanes.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(text(builderSummary(session)), text(builderPreview(session)));

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
    text(`# ${SCENE_TITLES.builder}\n-# Layered message selects in the channel, then deeper curation in a modal.`),
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
      button(cid('act', session.id, 'builder:clear'), 'Clear', ButtonStyle.Danger),
    ),
  ];
}

function bugScene(session) {
  const reportSummary = session.bug.summary
    ? [
        '### Latest report',
        `Severity: **${session.bug.severityLabel ?? 'n/a'}**`,
        `Summary: ${session.bug.summary}`,
        `Reproduction: ${session.bug.reproduction}`,
        `Uploaded files: ${formatList(session.bug.uploadedFileNames)}`,
      ].join('\n')
    : '### Latest report\nNo bug report has been submitted in this session yet.';

  const surface = new ContainerBuilder()
    .setAccentColor(ACCENTS.bug)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Bug Desk'),
          text('A realistic support flow: severity triage, structured written details, optional file uploads, and a stateful summary back in the showcase.'),
          text('-# The receipt and triage artifact are returned as a separate V2 response after the modal is submitted.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.bug,
            'A support operations card with a structured bug intake panel.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(text(reportSummary));

  return [
    text(`# ${SCENE_TITLES.bug}\n-# Structured reporting, practical UX, and a clean modal-to-message handoff.`),
    surface,
    separator(SeparatorSpacingSize.Small),
    row(
      button(cid('act', session.id, 'bug:report'), 'Open bug report', ButtonStyle.Primary),
      button(cid('nav', session.id, `${SCENES.release}@bug`), 'Go to release room', ButtonStyle.Secondary),
      linkButton('Modal guide', DOCS.modalGuide),
    ),
  ];
}

function releaseScene(session) {
  const room = new ContainerBuilder()
    .setAccentColor(ACCENTS.release)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Release Room'),
          text('This scene combines display components, a checklist artifact, and realistic publish outcomes into a compact release command center.'),
          text(`-# Published updates in this session: **${session.release.publishedCount}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.quality,
            'A release command card with confidence metrics and launch posture.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Large))
    .addMediaGalleryComponents(
      gallery([
        {
          name: ASSETS.analytics,
          description: 'Launch analytics context used inside the release room.',
        },
        {
          name: ASSETS.workflow,
          description: 'A rollout workflow board with approvals and dependencies.',
        },
        {
          name: ASSETS.quality,
          description: 'A release confidence panel for final readiness framing.',
        },
      ]),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(
      text('### Included artifact\nThe live scene exposes the launch checklist as an in-message file component, while the publish action posts a separate release update with richer supporting assets.'),
    )
    .addFileComponents(fileComponent(ASSETS.launchChecklist));

  return [
    text(`# ${SCENE_TITLES.release}\n-# Artifact-aware presentation with realistic publish outcomes.`),
    room,
    row(
      button(cid('act', session.id, 'release:publish'), 'Publish update', ButtonStyle.Success),
      button(cid('act', session.id, 'release:reset'), 'Reset count', ButtonStyle.Danger),
      linkButton('Message guide', DOCS.messageGuide),
    ),
  ];
}

function labsScene(session) {
  const currentDraft = session.labs.headline
    ? [
        '### Latest labs brief',
        `Tone: **${session.labs.toneLabel ?? 'n/a'}**`,
        `Headline: ${session.labs.headline}`,
        `Notes: ${session.labs.notes ?? 'n/a'}`,
        `Published briefs: **${session.labs.publishedCount}**`,
      ].join('\n')
    : '### Latest labs brief\nNo labs brief has been composed yet.';

  const card = new ContainerBuilder()
    .setAccentColor(ACCENTS.labs)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## Labs'),
          text('A final polished workflow for drafting a short experiment brief inside a modal and posting it back out as a component-first follow-up.'),
          text('-# This scene stays on documented, stable builders so the full showcase remains production-friendly.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.labs,
            'A labs control panel showing experiment toggles and review notes.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addTextDisplayComponents(text(currentDraft));

  return [
    text(`# ${SCENE_TITLES.labs}\n-# A compact drafting workflow using stable Components V2 patterns.`),
    card,
    row(
      button(cid('act', session.id, 'labs:compose'), 'Compose brief', ButtonStyle.Primary),
      button(cid('act', session.id, 'labs:publish'), 'Publish brief', ButtonStyle.Success, !session.labs.headline),
      linkButton('Overview', DOCS.overview),
    ),
  ];
}

export function buildSceneComponents(session) {
  switch (session.scene) {
    case SCENES.tour:
      return tourScene(session);
    case SCENES.builder:
      return builderScene(session);
    case SCENES.bug:
      return bugScene(session);
    case SCENES.release:
      return releaseScene(session);
    case SCENES.labs:
      return labsScene(session);
    case SCENES.home:
    default:
      return homeScene(session);
  }
}
