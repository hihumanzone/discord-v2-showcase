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

import { ASSETS } from '../assets.js';
import { ACCENTS, PRESET_OPTIONS, SCENE_TITLES } from '../constants.js';
import { formatList } from '../helpers.js';
import { cid } from '../ids.js';
import {
  button,
  row,
  separator,
  text,
  thumb,
} from '../primitives.js';
import { buildSceneIntro } from './shared.js';

function buildPresetMenu(session) {
  return new StringSelectMenuBuilder()
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
}

function buildChannelsMenu(session) {
  return new ChannelSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:channels'))
    .setPlaceholder('Pick launch channels')
    .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    .setMinValues(0)
    .setMaxValues(3);
}

function buildRolesMenu(session) {
  return new RoleSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:roles'))
    .setPlaceholder('Choose launch roles')
    .setMinValues(0)
    .setMaxValues(3);
}

function buildReviewersMenu(session) {
  return new UserSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:reviewers'))
    .setPlaceholder('Assign reviewers')
    .setMinValues(0)
    .setMaxValues(3);
}

function buildOwnersMenu(session) {
  return new MentionableSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'builder:owners'))
    .setPlaceholder('Select escalation owners')
    .setMinValues(0)
    .setMaxValues(4);
}

function buildBuilderSummary(session) {
  const builder = session.builder;

  return [
    `Preset: **${builder.presetLabel}**`,
    `Launch channels: ${formatList(builder.channels)}`,
    `Roles: ${formatList(builder.roles)}`,
    `Reviewers: ${formatList(builder.reviewers)}`,
    `Escalation owners: ${formatList(builder.owners)}`,
    `Modal approvers: ${formatList(builder.modalApprovers)}`,
    `Modal channels: ${formatList(builder.modalChannels)}`,
    `Rollout posture: **${builder.modalPostureLabel}**`,
    `Publish package: ${formatList(builder.modalPackageLabels)}`,
    `Live watch window: **${builder.modalLiveWatch ? 'enabled' : 'disabled'}**`,
  ].join('\n');
}

function buildBuilderPreview(session) {
  if (!session.builder.previewGenerated) {
    return 'Generate a preview to turn the current selections into a staged rollout summary.';
  }

  const builder = session.builder;
  return [
    '### 🚀 Launch preview',
    `We will ship **${session.tour.productName}** with the **${builder.presetLabel}** preset.`,
    `Primary rooms: ${formatList(builder.modalChannels.length ? builder.modalChannels : builder.channels)}`,
    `Approvals: ${formatList(builder.modalApprovers.length ? builder.modalApprovers : builder.reviewers)}`,
    `Escalation coverage: ${formatList(builder.owners)}`,
    `Rollout posture: **${builder.modalPostureLabel}**`,
    `Publish package: ${formatList(builder.modalPackageLabels)}`,
    `Live watch window: **${builder.modalLiveWatch ? 'enabled' : 'disabled'}**`,
  ].join('\n');
}

export function buildBuilderScene(session) {
  const summary = new ContainerBuilder()
    .setAccentColor(ACCENTS.builder)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## 🚀 Launch Builder'),
          text(`Configure a realistic rollout using message select menus, then enrich it with a modal using the newer modal choice patterns.\n-# Preview generated: **${session.builder.previewGenerated ? 'yes' : 'not yet'}**`),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.builder,
            'An operational launch builder surface with approvals and routing lanes.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(`### 🗂️ Active rollout summary\n${buildBuilderSummary(session)}`),
          text(buildBuilderPreview(session)),
        )
        .setButtonAccessory(
          button(cid('act', session.id, 'builder:generate'), 'Preview', ButtonStyle.Success),
        ),
    );

  const controls = new ContainerBuilder()
    .setAccentColor(0x203d2f)
    .addTextDisplayComponents(
      text('## 🧩 Configure rollout controls\nEvery select menu stays visually grouped inside the builder card so the setup feels like a single surface instead of a stack of loose rows.'),
    )
    .addActionRowComponents(
      row(buildPresetMenu(session)),
      row(buildChannelsMenu(session)),
      row(buildRolesMenu(session)),
      row(buildReviewersMenu(session)),
      row(buildOwnersMenu(session)),
    )
    .addActionRowComponents(
      row(
        button(cid('act', session.id, 'builder:assistant'), 'Open assistant modal', ButtonStyle.Primary),
        button(cid('act', session.id, 'builder:clear'), 'Clear', ButtonStyle.Danger),
      ),
    );

  const intro = buildSceneIntro({
    title: `# ${SCENE_TITLES.builder}`,
    subtitle: '-# Layered message selects in the channel, then deeper curation in a modal.',
    thumbnailName: ASSETS.builder,
    thumbnailDescription: 'A top-level builder thumbnail introducing the rollout configuration scene.',
  });

  return [
    intro,
    summary,
    controls,
  ];
}
