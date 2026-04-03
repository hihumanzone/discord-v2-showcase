import { SectionBuilder } from 'discord.js';

import { text, thumb } from '../primitives.js';

export function buildSceneIntro({ title, subtitle, thumbnailName, thumbnailDescription }) {
  return new SectionBuilder()
    .addTextDisplayComponents(
      text(title),
      text(subtitle),
    )
    .setThumbnailAccessory(
      thumb(thumbnailName, thumbnailDescription),
    );
}
