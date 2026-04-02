import {
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ContainerBuilder,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  FileBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  RoleSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder
} from 'discord.js';

/**
 * Creates a V2 message payload with the required IS_COMPONENTS_V2 flag
 * @param {Array} components - Array of component builders
 * @returns {Object} Message payload with flags and components
 */
export function createV2Message(components) {
  return {
    flags: MessageFlags.IsComponentsV2,
    components
  };
}

/**
 * Creates a text display component with markdown content
 * @param {string} content - Markdown-formatted text content
 * @returns {TextDisplayBuilder}
 */
export function textDisplay(content) {
  return new TextDisplayBuilder().setContent(content);
}

/**
 * Creates a separator component
 * @param {boolean} divider - Whether to show a visual divider line
 * @param {SeparatorSpacingSize} spacing - Small or Large spacing
 * @returns {SeparatorBuilder}
 */
export function separator(divider = true, spacing = SeparatorSpacingSize.Small) {
  return new SeparatorBuilder().setDivider(divider).setSpacing(spacing);
}

/**
 * Creates a section with text displays and an accessory
 * @param {string[]} texts - Array of text content for the section
 * @param {Object} accessory - Button or thumbnail accessory builder
 * @returns {SectionBuilder}
 */
export function section(texts, accessory) {
  const sectionBuilder = new SectionBuilder();
  for (const text of texts) {
    sectionBuilder.addTextDisplayComponents(textDisplay(text));
  }
  if (accessory) {
    if (accessory.type === 2) {
      sectionBuilder.setButtonAccessory(accessory);
    } else if (accessory.type === 11) {
      sectionBuilder.setThumbnailAccessory(accessory);
    }
  }
  return sectionBuilder;
}

/**
 * Creates a thumbnail accessory
 * @param {string} url - Image URL or attachment:// reference
 * @param {string} description - Alt text for accessibility
 * @returns {ThumbnailBuilder}
 */
export function thumbnail(url, description = '') {
  return new ThumbnailBuilder({ media: { url } }).setDescription(description);
}

/**
 * Creates a container with child components
 * @param {number} accentColor - RGB accent color (optional)
 * @param {Array} children - Array of component builders
 * @returns {ContainerBuilder}
 */
export function container(accentColor, children = []) {
  const containerBuilder = new ContainerBuilder();
  if (accentColor !== undefined) {
    containerBuilder.setAccentColor(accentColor);
  }
  for (const child of children) {
    if (child.type === 10) {
      containerBuilder.addTextDisplayComponents(child);
    } else if (child.type === 1) {
      containerBuilder.addActionRowComponents(child);
    } else if (child.type === 9) {
      containerBuilder.addSectionComponents(child);
    } else if (child.type === 14) {
      containerBuilder.addSeparatorComponents(child);
    } else if (child.type === 12) {
      containerBuilder.addMediaGalleryComponents(child);
    } else if (child.type === 13) {
      containerBuilder.addFileComponents(child);
    }
  }
  return containerBuilder;
}

/**
 * Creates a media gallery with items
 * @param {Array} items - Array of {url, description, spoiler} objects
 * @returns {MediaGalleryBuilder}
 */
export function mediaGallery(items) {
  const gallery = new MediaGalleryBuilder();
  for (const item of items) {
    const itemBuilder = new MediaGalleryItemBuilder().setURL(item.url);
    if (item.description) itemBuilder.setDescription(item.description);
    if (item.spoiler) itemBuilder.setSpoiler(true);
    gallery.addItems(itemBuilder);
  }
  return gallery;
}

/**
 * Creates a file component referencing an attachment
 * @param {string} filename - The attachment filename
 * @returns {FileBuilder}
 */
export function fileComponent(filename) {
  return new FileBuilder().setURL(`attachment://${filename}`);
}

/**
 * Creates a primary button
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} label - Button label
 * @param {Object} emoji - Optional emoji object
 * @returns {ButtonBuilder}
 */
export function primaryButton(customId, label, emoji = null) {
  const button = new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Primary);
  if (emoji) button.setEmoji(emoji);
  return button;
}

/**
 * Creates a secondary button
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} label - Button label
 * @returns {ButtonBuilder}
 */
export function secondaryButton(customId, label) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Secondary);
}

/**
 * Creates a success button
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} label - Button label
 * @returns {ButtonBuilder}
 */
export function successButton(customId, label) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Success);
}

/**
 * Creates a danger button
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} label - Button label
 * @returns {ButtonBuilder}
 */
export function dangerButton(customId, label) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(label)
    .setStyle(ButtonStyle.Danger);
}

/**
 * Creates a link button
 * @param {string} url - URL to navigate to
 * @param {string} label - Button label
 * @returns {ButtonBuilder}
 */
export function linkButton(url, label) {
  return new ButtonBuilder()
    .setLabel(label)
    .setURL(url)
    .setStyle(ButtonStyle.Link);
}

/**
 * Creates an action row with components
 * @param {Array} components - Array of button or select menu builders
 * @returns {ActionRowBuilder}
 */
export function actionRow(...components) {
  return new ActionRowBuilder().addComponents(...components);
}

/**
 * Creates a string select menu
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} placeholder - Placeholder text
 * @param {Array} options - Array of option objects
 * @param {number} minValues - Minimum selections
 * @param {number} maxValues - Maximum selections
 * @returns {StringSelectMenuBuilder}
 */
export function stringSelectMenu(customId, placeholder, options, minValues = 1, maxValues = 1) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues);
  
  for (const opt of options) {
    menu.addOptions({
      label: opt.label,
      value: opt.value,
      description: opt.description,
      emoji: opt.emoji,
      default: opt.default || false
    });
  }
  
  return menu;
}

/**
 * Creates a user select menu
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} placeholder - Placeholder text
 * @param {number} minValues - Minimum selections
 * @param {number} maxValues - Maximum selections
 * @returns {UserSelectMenuBuilder}
 */
export function userSelectMenu(customId, placeholder = 'Select a user...', minValues = 1, maxValues = 1) {
  return new UserSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues);
}

/**
 * Creates a role select menu
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} placeholder - Placeholder text
 * @param {number} minValues - Minimum selections
 * @param {number} maxValues - Maximum selections
 * @returns {RoleSelectMenuBuilder}
 */
export function roleSelectMenu(customId, placeholder = 'Select a role...', minValues = 1, maxValues = 1) {
  return new RoleSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues);
}

/**
 * Creates a channel select menu
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} placeholder - Placeholder text
 * @param {Array} channelTypes - Array of channel type integers to filter
 * @param {number} minValues - Minimum selections
 * @param {number} maxValues - Maximum selections
 * @returns {ChannelSelectMenuBuilder}
 */
export function channelSelectMenu(customId, placeholder = 'Select a channel...', channelTypes = [], minValues = 1, maxValues = 1) {
  const menu = new ChannelSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues);
  
  if (channelTypes.length > 0) {
    menu.addChannelTypes(...channelTypes);
  }
  
  return menu;
}

/**
 * Creates a mentionable select menu
 * @param {string} customId - Custom ID for interaction handling
 * @param {string} placeholder - Placeholder text
 * @param {number} minValues - Minimum selections
 * @param {number} maxValues - Maximum selections
 * @returns {MentionableSelectMenuBuilder}
 */
export function mentionableSelectMenu(customId, placeholder = 'Select a member...', minValues = 1, maxValues = 1) {
  return new MentionableSelectMenuBuilder()
    .setCustomId(customId)
    .setPlaceholder(placeholder)
    .setMinValues(minValues)
    .setMaxValues(maxValues);
}
