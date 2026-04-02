import { ButtonStyle, SeparatorSpacingSize, ContainerBuilder, SectionBuilder } from 'discord.js';

import { ASSETS, SHARED_MESSAGE_ASSET_NAMES, subsetFiles } from './assets.js';
import { ACCENTS, DOCS, LAB_TONE_OPTIONS, SCENE_TITLES } from './constants.js';
import { formatList, labelForOption } from './helpers.js';
import { cid } from './ids.js';
import { buildV2Message } from './responses.js';
import { buildNavigationRows, buildSceneComponents } from './scenes.js';
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

export function buildMainShowcaseMessage(session, { includeFiles = false, includeFlags = true } = {}) {
  return buildV2Message(
    {
      includeFlags,
      components: [
        ...buildSceneComponents(session),
        separator(SeparatorSpacingSize.Large, true),
        text(`-# Session owner: <@${session.ownerId}> · Current scene: **${SCENE_TITLES[session.scene]}**`),
        ...buildNavigationRows(session),
      ],
      ...(includeFiles ? { files: subsetFiles(SHARED_MESSAGE_ASSET_NAMES) } : {}),
    },
    'main showcase message',
  );
}

export function buildBugReceiptMessage(session) {
  return buildV2Message(
    {
      ephemeral: true,
      files: subsetFiles([ASSETS.triageTemplate]),
      components: [
        text('## 🐞 Bug report submitted\nThe live showcase has been updated with the latest triage summary.'),
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
    },
    'bug receipt message',
  );
}

export function buildTourPublishMessage(session) {
  return buildV2Message(
    {
      files: subsetFiles([ASSETS.tourHero, ASSETS.launchChecklist]),
      components: [
        text(`## ${session.tour.productName}\n${session.tour.highlight}`),
        new SectionBuilder()
          .addTextDisplayComponents(
            text(`Audience: **${session.tour.audienceLabel}**`),
            text('This is a polished teaser post emitted from the showcase to demonstrate a realistic publish outcome.'),
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
    },
    'tour publish message',
  );
}

export function buildReleasePublishMessage(session) {
  return buildV2Message(
    {
      files: subsetFiles([ASSETS.analytics, ASSETS.quality, ASSETS.releaseNotes]),
      components: [
        text('## 📦 Launch update published\n-# A polished public-facing outcome from the Release Room scene.'),
        new ContainerBuilder()
          .setAccentColor(ACCENTS.release)
          .addTextDisplayComponents(
            text('### 📈 Release posture\nConfidence is high, artifacts are attached, and the release room now reflects a completed publish action.'),
          )
          .addMediaGalleryComponents(
            gallery([
              {
                name: ASSETS.analytics,
                description: 'A supporting analytics card for the published release update.',
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
    },
    'release publish message',
  );
}

export function buildLabsPublishMessage(session) {
  const toneLabel = labelForOption(LAB_TONE_OPTIONS, session.labs.tone, session.labs.tone ?? 'n/a');

  return buildV2Message(
    {
      files: subsetFiles([ASSETS.labs, ASSETS.manifest]),
      components: [
        text(`## 🧪 ${session.labs.headline}\n-# Labs brief published from the showcase.`),
        new SectionBuilder()
          .addTextDisplayComponents(
            text(`Tone: **${toneLabel}**`),
            text(session.labs.notes ?? 'No extra notes were attached to this brief.'),
          )
          .setThumbnailAccessory(
            thumb(
              ASSETS.labs,
              'A labs control panel used as supporting media for the brief.',
            ),
          ),
        separator(SeparatorSpacingSize.Small, true),
        fileComponent(ASSETS.manifest),
        row(
          button(cid('noop', session.id, 'docs'), 'Labs workflow', ButtonStyle.Secondary, true),
          linkButton('Display components guide', DOCS.displayGuide),
        ),
      ],
    },
    'labs publish message',
  );
}
