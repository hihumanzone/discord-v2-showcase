import { ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

import { DOCS, SCENE_TITLES } from '../constants.js';
import { cid } from '../ids.js';
import { button, linkButton, row } from '../primitives.js';

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

export function buildSceneJumpSelect(session, action, placeholder, scenes) {
  return new StringSelectMenuBuilder()
    .setCustomId(cid('sel', session.id, action))
    .setPlaceholder(placeholder)
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      scenes.map((scene) => ({
        label: SCENE_TITLES[scene],
        value: scene,
        description: `Open the ${SCENE_TITLES[scene]} scene`,
        default: scene === session.scene,
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
