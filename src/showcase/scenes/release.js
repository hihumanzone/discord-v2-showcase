import {
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
} from 'discord.js';

import { ASSETS } from '../assets.js';
import { ACCENTS, DOCS, SCENE_TITLES } from '../constants.js';
import { cid } from '../ids.js';
import {
  button,
  fileComponent,
  gallery,
  linkButton,
  row,
  separator,
  text,
  thumb,
} from '../primitives.js';
import { buildSceneIntro } from './shared.js';

export function buildReleaseScene(session) {
  const room = new ContainerBuilder()
    .setAccentColor(ACCENTS.release)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## 📦 Release Room'),
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
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('### 📎 Included artifacts'),
          text('The release room now displays two files directly in the live scene with contextual text between them, mirroring how a real ship room mixes artifacts and narrative guidance.'),
          text('-# Use the checklist for sign-off, then reference the manifest for the broader component inventory.'),
        )
        .setButtonAccessory(
          button(cid('act', session.id, 'release:publish'), 'Publish update', ButtonStyle.Success),
        ),
    )
    .addFileComponents(fileComponent(ASSETS.launchChecklist))
    .addTextDisplayComponents(
      text('### 📝 Between the files\nThe checklist is the operator-facing ship gate, while the manifest is the durable reference for everything attached to the premium showcase surface.'),
    )
    .addFileComponents(fileComponent(ASSETS.manifest))
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addActionRowComponents(
      row(
        button(cid('act', session.id, 'release:reset'), 'Reset count', ButtonStyle.Danger),
        linkButton('Message guide', DOCS.messageGuide),
      ),
    );

  const intro = buildSceneIntro({
    title: `# ${SCENE_TITLES.release}`,
    subtitle: '-# Artifact-aware presentation with realistic publish outcomes.',
    thumbnailName: ASSETS.quality,
    thumbnailDescription: 'A top-level release room thumbnail introducing the artifact-aware publish scene.',
  });

  return [
    intro,
    room,
  ];
}
