import {
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
} from 'discord.js';

import { ASSETS } from '../assets.js';
import { ACCENTS, DOCS, SCENES, SCENE_TITLES, SEVERITY_OPTIONS } from '../constants.js';
import { formatList } from '../helpers.js';
import { cid } from '../ids.js';
import {
  button,
  linkButton,
  row,
  separator,
  text,
  thumb,
} from '../primitives.js';
import { buildSceneIntro } from './shared.js';

function buildSeveritySelect(session) {
  return new StringSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'bug:severity-quick'))
    .setPlaceholder(`Severity draft: ${session.bug.severityLabel ?? 'Choose severity'}`)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      SEVERITY_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.bug.severityValue,
      })),
    );
}

export function buildBugScene(session) {
  const reportSummary = session.bug.summary
    ? [
        '### 🐞 Latest report',
        `Severity: **${session.bug.severityLabel ?? 'n/a'}**`,
        `Summary: ${session.bug.summary}`,
        `Reproduction: ${session.bug.reproduction}`,
        `Uploaded files: ${formatList(session.bug.uploadedFileNames)}`,
      ].join('\n')
    : [
        '### 🐞 Latest report',
        'No bug report has been submitted in this session yet.',
        `Draft severity: **${session.bug.severityLabel ?? 'not set'}**`,
      ].join('\n');

  const surface = new ContainerBuilder()
    .setAccentColor(ACCENTS.bug)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## 🐞 Bug Desk'),
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
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(reportSummary),
          text('-# You can pre-select a likely severity below to make the modal feel faster and more contextual.'),
        )
        .setButtonAccessory(
          button(cid('act', session.id, 'bug:report'), 'Report bug', ButtonStyle.Primary),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addActionRowComponents(
      row(buildSeveritySelect(session)),
      row(
        button(cid('nav', session.id, `${SCENES.release}@bug`), 'Go to release room', ButtonStyle.Secondary),
        linkButton('Modal guide', DOCS.modalGuide),
      ),
    );

  const intro = buildSceneIntro({
    title: `# ${SCENE_TITLES.bug}`,
    subtitle: '-# Structured reporting, practical UX, and a clean modal-to-message handoff.',
    thumbnailName: ASSETS.bug,
    thumbnailDescription: 'A top-level bug desk thumbnail introducing the support workflow scene.',
  });

  return [
    intro,
    surface,
  ];
}
