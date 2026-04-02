import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  FileBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';

import { assetUrl } from './assets.js';

export function text(content) {
  return new TextDisplayBuilder().setContent(content);
}

export function separator(spacing = SeparatorSpacingSize.Large, divider = false) {
  return new SeparatorBuilder().setSpacing(spacing).setDivider(divider);
}

export function fileComponent(name) {
  return new FileBuilder().setURL(assetUrl(name));
}

export function gallery(items) {
  return new MediaGalleryBuilder().addItems(
    items.map((item) =>
      new MediaGalleryItemBuilder()
        .setURL(assetUrl(item.name))
        .setDescription(item.description),
    ),
  );
}

export function thumb(name, description) {
  return new ThumbnailBuilder().setURL(assetUrl(name)).setDescription(description);
}

export function button(customId, label, style, disabled = false) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style)
    .setDisabled(disabled);
}

export function linkButton(label, url) {
  return new ButtonBuilder()
    .setLabel(label)
    .setStyle(ButtonStyle.Link)
    .setURL(url);
}

export function row(...components) {
  return new ActionRowBuilder().addComponents(...components);
}

export function sectionWithThumbnail({ lines, thumbnail }) {
  return new SectionBuilder()
    .addTextDisplayComponents(lines.map((line) => text(line)))
    .setThumbnailAccessory(thumb(thumbnail.name, thumbnail.description));
}
