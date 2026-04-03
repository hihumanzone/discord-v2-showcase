import {
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
} from 'discord.js';

import { ASSETS } from '../assets.js';
import { ACCENTS, AUDIENCE_OPTIONS, DOCS, SCENES, SCENE_TITLES } from '../constants.js';
import { cid } from '../ids.js';
import {
  button,
  gallery,
  linkButton,
  row,
  separator,
  text,
  thumb,
} from '../primitives.js';
import { buildSceneIntro } from './shared.js';

function buildAudienceSelect(session) {
  return new StringSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, 'tour:audience-quick'))
    .setPlaceholder(`Audience: ${session.tour.audienceLabel}`)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      AUDIENCE_OPTIONS.map((option) => ({
        ...option,
        default: option.value === session.tour.audience,
      })),
    );
}

export function buildTourScene(session) {
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
      text('### ✨ This scene demonstrates\n- Hero storytelling with a thumbnail accessory\n- Media gallery presentation inside a cohesive launch narrative\n- Personalization through a modal\n- Public follow-up publishing as a realistic outcome'),
    );

  const controls = new ContainerBuilder()
    .setAccentColor(0x1f2a44)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## 🎛️ Story controls'),
          text('Switch the hero audience directly from the message, then publish or personalize the full story with the modal.\n-# These controls stay within the scene card so the primary showcase navigation remains unchanged.'),
        )
        .setButtonAccessory(
          button(cid('act', session.id, 'tour:personalize'), 'Personalize', ButtonStyle.Primary),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addActionRowComponents(
      row(buildAudienceSelect(session)),
      row(
        button(cid('act', session.id, 'tour:publish'), 'Publish teaser', ButtonStyle.Success),
        button(cid('nav', session.id, `${SCENES.builder}@tour`), 'Open builder', ButtonStyle.Secondary),
        linkButton('Reference', DOCS.reference),
      ),
    );

  const intro = buildSceneIntro({
    title: `# ${SCENE_TITLES.tour}`,
    subtitle: '-# Presentation-led storytelling with a polished modal handoff.',
    thumbnailName: ASSETS.tourHero,
    thumbnailDescription: 'A top-level hero thumbnail introducing the Product Tour scene.',
  });

  return [
    intro,
    hero,
    separator(SeparatorSpacingSize.Small),
    controls,
  ];
}
