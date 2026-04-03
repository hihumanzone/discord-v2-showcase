import {
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
} from 'discord.js';

import { ASSETS } from '../assets.js';
import { ACCENTS, DOCS, LAB_TONE_OPTIONS, SCENE_TITLES } from '../constants.js';
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

function buildLabsToneSelect(session) {
  return new StringSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'labs:tone-quick'))
    .setPlaceholder(`Tone: ${session.labs.toneLabel ?? 'Choose tone'}`)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      LAB_TONE_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.labs.tone,
      })),
    );
}

export function buildLabsScene(session) {
  const currentDraft = session.labs.headline
    ? [
        '### 🧪 Latest labs brief',
        `Tone: **${session.labs.toneLabel ?? 'n/a'}**`,
        `Headline: ${session.labs.headline}`,
        `Notes: ${session.labs.notes ?? 'n/a'}`,
        `Published briefs: **${session.labs.publishedCount}**`,
      ].join('\n')
    : [
        '### 🧪 Latest labs brief',
        'No labs brief has been composed yet.',
        `Tone preset: **${session.labs.toneLabel ?? 'not set'}**`,
      ].join('\n');

  const card = new ContainerBuilder()
    .setAccentColor(ACCENTS.labs)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## 🧪 Labs'),
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
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text(currentDraft),
          text('-# Set the tone from the message, then use the modal for the headline and notes.'),
        )
        .setButtonAccessory(
          button(cid('act', session.id, 'labs:compose'), 'Compose brief', ButtonStyle.Primary),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addActionRowComponents(
      row(buildLabsToneSelect(session)),
      row(
        button(cid('act', session.id, 'labs:publish'), 'Publish brief', ButtonStyle.Success, !session.labs.headline),
        linkButton('Overview', DOCS.overview),
      ),
    );

  const intro = buildSceneIntro({
    title: `# ${SCENE_TITLES.labs}`,
    subtitle: '-# A compact drafting workflow using stable Components V2 patterns.',
    thumbnailName: ASSETS.labs,
    thumbnailDescription: 'A top-level labs thumbnail introducing the experiment brief workflow.',
  });

  return [
    intro,
    card,
  ];
}
