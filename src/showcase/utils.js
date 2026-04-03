import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
  ThumbnailBuilder,
} from 'discord.js';

import { attachmentUrl } from './assets.js';
import { SCENE_ORDER } from './state.js';

export const sceneMeta = Object.freeze({
  home: { label: '🏠 Home', emoji: '🏠', description: 'Core rules and the mental model for Components V2.' },
  layouts: { label: '🧱 Layouts', emoji: '🧱', description: 'Text, sections, containers, galleries, files, and spacing.' },
  interactions: { label: '🎛️ Interactions', emoji: '🎛️', description: 'Buttons plus every supported message select menu.' },
  modals: { label: '🪟 Modals', emoji: '🪟', description: 'Three teaching modals that cover the modal surface.' },
  workflow: { label: '🚀 Workflow', emoji: '🚀', description: 'Updates, follow-ups, and realistic publishing outcomes.' },
});

// Small helper builders keep the scene files readable. They are intentionally
// tiny so learners can either keep using them or inline the components later.

export function text(content) {
  return new TextDisplayBuilder().setContent(content);
}

export function separator(spacing = SeparatorSpacingSize.Small, divider = true) {
  return new SeparatorBuilder().setSpacing(spacing).setDivider(divider);
}

export function button(customId, label, style = ButtonStyle.Secondary, options = {}) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(style)
    .setDisabled(options.disabled ?? false);
}

export function linkButton(label, url) {
  return new ButtonBuilder().setLabel(label).setStyle(ButtonStyle.Link).setURL(url);
}

export function row(...components) {
  return new ActionRowBuilder().addComponents(...components);
}

export function fileComponent(name) {
  return new FileBuilder().setURL(attachmentUrl(name));
}

export function gallery(items) {
  return new MediaGalleryBuilder().addItems(
    items.map((item) =>
      new MediaGalleryItemBuilder()
        .setURL(attachmentUrl(item.name))
        .setDescription(item.description)
        .setSpoiler(item.spoiler ?? false),
    ),
  );
}

export function thumbnail(name, description) {
  return new ThumbnailBuilder().setURL(attachmentUrl(name)).setDescription(description);
}

export function topLevelIntro({ title, description, assetName, assetDescription }) {
  return new SectionBuilder()
    .addTextDisplayComponents(text(title), text(description))
    .setThumbnailAccessory(thumbnail(assetName, assetDescription));
}

export function simpleContainer(accentColor, ...components) {
  return new ContainerBuilder().setAccentColor(accentColor).addComponents(...components);
}

export function sceneSelect(customId, currentScene) {
  return new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder('Jump to a learning scene')
    .addOptions(
      SCENE_ORDER.map((scene) => ({
        label: sceneMeta[scene].label,
        value: scene,
        description: sceneMeta[scene].description,
        default: scene === currentScene,
      })),
    );
}
