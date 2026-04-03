import {
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorSpacingSize,
} from 'discord.js';

import { ASSETS } from '../assets.js';
import { ACCENTS, SCENES } from '../constants.js';
import { cid } from '../ids.js';
import {
  button,
  fileComponent,
  gallery,
  row,
  separator,
  text,
  thumb,
} from '../primitives.js';
import { buildSceneJumpSelect } from './navigation.js';
import { buildSceneIntro } from './shared.js';

export function buildHomeScene(session) {
  const hero = new ContainerBuilder()
    .setAccentColor(ACCENTS.home)
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('## 🏠 A polished Components V2 product surface\nThis showcase is intentionally cohesive: every scene is a real interaction pattern, not a pile of disconnected snippets.\n-# The public message is fully component-driven. No legacy `content`. No embeds. No attachment auto-rendering.'),
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
      text('### 📋 What this demo covers\n- Rich message layouts with containers, sections, separators, media galleries, thumbnails, and file components\n- Stateful buttons and select menus in a shared public message\n- Modal flows that update the original showcase and also produce realistic follow-up outcomes'),
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
      text('## 🧭 Explore intentionally named scenes\n**Product Tour** demonstrates rich storytelling. **Launch Builder** demonstrates message select menus plus modal-native choice controls. **Bug Desk** shows structured reporting. **Release Room** handles publish outcomes. **Labs** adds one more polished modal workflow.'),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          text('### 🔒 Public-channel safe behavior'),
          text('Only the original opener can mutate the shared state. Other viewers can read the showcase without hijacking the active demo session.\n-# Use the featured-flow select below to jump directly into one of the deeper scenes.'),
        )
        .setThumbnailAccessory(
          thumb(
            ASSETS.workflow,
            'A workflow board used to reinforce guided navigation between scenes.',
          ),
        ),
    )
    .addSeparatorComponents(separator(SeparatorSpacingSize.Small, true))
    .addActionRowComponents(
      row(
        buildSceneJumpSelect(
          session,
          'home:featured',
          'Jump to a featured workflow',
          [SCENES.tour, SCENES.builder, SCENES.bug, SCENES.release, SCENES.labs],
        ),
      ),
      row(
        button(cid('nav', session.id, `${SCENES.bug}@home`), 'Open bug desk', ButtonStyle.Secondary),
        button(cid('nav', session.id, `${SCENES.labs}@home`), 'Open labs', ButtonStyle.Secondary),
      ),
    );

  const intro = buildSceneIntro({
    title: '# ✨ Discord Components V2 Showcase',
    subtitle: '-# A production-ready discord.js demo built around current documented Components V2 behavior.',
    thumbnailName: ASSETS.homeHero,
    thumbnailDescription: 'A compact hero thumbnail paired with the top-level showcase introduction.',
  });

  return [
    intro,
    hero,
    supporting,
    fileComponent(ASSETS.manifest),
  ];
}
