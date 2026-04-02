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
  MentionableSelectMenuBuilder,
  AttachmentBuilder
} from 'discord.js';

/**
 * Comprehensive Component Showcase - Demonstrates all V2 display components
 */
export async function setupComponentShowcase(client) {
  const showcaseCommand = {
    name: 'showcase-components',
    description: 'Display a comprehensive showcase of Discord Components V2 features'
  };

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    
    if (interaction.commandName !== showcaseCommand.name) return;

    await interaction.deferReply();

    const botAvatar = interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 });

    // Header section with title
    const headerSection = new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('# ✨ Discord Components V2 Showcase')
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder({ media: { url: botAvatar } })
          .setDescription('Bot avatar thumbnail')
      );

    // Text Display showcase container
    const textDisplayContainer = new ContainerBuilder()
      .setAccentColor(0x5865F2)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          'Welcome to the **ultimate Components V2 demonstration**. This message uses component-driven layout instead of traditional embeds.'
        ),
        new TextDisplayBuilder().setContent('### 📝 Text Display Component'),
        new TextDisplayBuilder().setContent(
          'Text Display components support **full markdown formatting**:\n' +
          '- **Bold**, *italic*, __underline__\n' +
          '- `inline code` and syntax highlighting\n' +
          '- [Links](https://discord.com/developers)\n' +
          '- Emoji :sparkles: and reactions\n' +
          '- Spoilers: ||hidden text||\n' +
          '- Blockquotes and code blocks'
        )
      );

    // Separator example
    const separatorExample = new SeparatorBuilder()
      .setDivider(true)
      .setSpacing(SeparatorSpacingSize.Large);

    // Section with button accessory
    const sectionWithButton = new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### 🔘 Section with Button'),
        new TextDisplayBuilder().setContent('Sections can have interactive button accessories for quick actions.')
      )
      .setButtonAccessory(
        new ButtonBuilder()
          .setCustomId('showcase_button_demo')
          .setLabel('Click Me!')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('👆')
      );

    // Section with thumbnail
    const sectionWithThumbnail = new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### 🖼️ Section with Thumbnail'),
        new TextDisplayBuilder().setContent('Thumbnails provide visual context alongside your text content.')
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder({ media: { url: 'https://picsum.photos/seed/discord/200/200' } })
          .setDescription('Random placeholder image')
      );

    // Media Gallery showcase
    const mediaGallery = new MediaGalleryBuilder()
      .addItems(
        new MediaGalleryItemBuilder()
          .setURL('https://picsum.photos/seed/gallery1/400/300')
          .setDescription('Gallery item 1 - Scenic view'),
        new MediaGalleryItemBuilder()
          .setURL('https://picsum.photos/seed/gallery2/400/300')
          .setDescription('Gallery item 2 - Nature')
      );

    const galleryContainer = new ContainerBuilder()
      .setAccentColor(0x57F287)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### 🎨 Media Gallery Component'),
        new TextDisplayBuilder().setContent('Display up to 10 images in an organized grid layout. Items can be marked as spoilers!')
      )
      .addMediaGalleryComponents(mediaGallery);

    // Select Menus showcase container
    const selectMenusContainer = new ContainerBuilder()
      .setAccentColor(0xFEE75C)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### 📋 Select Menu Components'),
        new TextDisplayBuilder().setContent('Interactive dropdown menus for user selection. This compact demo includes string and user pickers.')
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('showcase_string_select')
            .setPlaceholder('Choose a programming language...')
            .addOptions(
              { label: 'JavaScript', value: 'javascript', emoji: '🟨', description: 'The language of the web' },
              { label: 'Python', value: 'python', emoji: '🐍', description: 'Great for beginners' },
              { label: 'Rust', value: 'rust', emoji: '🦀', description: 'Systems programming' },
              { label: 'TypeScript', value: 'typescript', emoji: '🔷', description: 'JavaScript with types' }
            )
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new UserSelectMenuBuilder()
            .setCustomId('showcase_user_select')
            .setPlaceholder('Select a team member...')
            .setMaxValues(3)
        )
      );

    // Buttons showcase
    const buttonsContainer = new ContainerBuilder()
      .setAccentColor(0xEB459E)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### 🔵 Button Styles'),
        new TextDisplayBuilder().setContent('Common button styles for different action types:')
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('btn_primary').setLabel('Primary').setStyle(ButtonStyle.Primary).setEmoji('🔵'),
          new ButtonBuilder().setCustomId('btn_secondary').setLabel('Secondary').setStyle(ButtonStyle.Secondary).setEmoji('⚪'),
          new ButtonBuilder().setCustomId('btn_success').setLabel('Success').setStyle(ButtonStyle.Success).setEmoji('✅'),
          new ButtonBuilder()
            .setLabel('Discord Docs')
            .setURL('https://discord.com/developers/docs/components/overview')
            .setStyle(ButtonStyle.Link)
            .setEmoji('🔗')
        )
      );

    // Footer
    const footerText = new TextDisplayBuilder().setContent(
      '---\n*Built with ❤️ using discord.js and Discord Components V2*\n' +
      'Interact with the buttons and menus above to see real-time responses!'
    );

    await interaction.editReply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        headerSection,
        separatorExample,
        textDisplayContainer,
        sectionWithButton,
        sectionWithThumbnail,
        separatorExample,
        galleryContainer,
        separatorExample,
        footerText
      ]
    });

    await interaction.followUp({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent('## 🔁 Follow-up: Interactive Controls\n\nPart 2 contains the interactive select menus and button style demos.'),
        selectMenusContainer,
        buttonsContainer
      ]
    });
  });

  return showcaseCommand;
}

// Handle component interactions from the showcase
export async function handleShowcaseInteraction(interaction) {
  if (!interaction.isButton() && !interaction.isStringSelectMenu() && 
      !interaction.isUserSelectMenu() && !interaction.isRoleSelectMenu() &&
      !interaction.isChannelSelectMenu() && !interaction.isMentionableSelectMenu()) {
    return false;
  }

  const customId = interaction.customId;
  
  if (customId === 'showcase_button_demo') {
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent('## 🎉 Button Clicked!\n\nYou discovered the interactive button demo! Buttons send interactions back to your bot for handling.'),
        new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('**What just happened?**'),
            new TextDisplayBuilder().setContent('Your click triggered an interaction that this bot received and responded to in real-time.')
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setLabel('Try Again')
              .setCustomId('showcase_button_demo')
              .setStyle(ButtonStyle.Secondary)
          )
      ]
    });
    return true;
  }

  // Handle style demo buttons
  if (['btn_primary', 'btn_secondary', 'btn_success', 'btn_danger'].includes(customId)) {
    const styleNames = {
      btn_primary: 'Primary',
      btn_secondary: 'Secondary', 
      btn_success: 'Success',
      btn_danger: 'Danger'
    };
    const styleColors = {
      btn_primary: 0x5865F2,
      btn_secondary: 0x4F545C,
      btn_success: 0x57F287,
      btn_danger: 0xED4245
    };
    
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new ContainerBuilder()
          .setAccentColor(styleColors[customId])
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ${styleNames[customId]} Button Activated!\n\nThis demonstrates the **${styleNames[customId]}** button style. Use different styles to create visual hierarchy in your UI.`),
            new TextDisplayBuilder().setContent(`- **Primary**: Main/recommended actions\n- **Secondary**: Alternative actions\n- **Success**: Positive confirmations\n- **Danger**: Destructive actions`)
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('dismiss_response')
                .setLabel('Dismiss')
                .setStyle(ButtonStyle.Secondary)
            )
          )
      ]
    });
    return true;
  }

  // Handle string select
  if (customId === 'showcase_string_select') {
    const selected = interaction.values.join(', ');
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent(`## 📋 Selection Received!\n\nYou selected: **${selected}**\n\nString Select Menus are perfect for presenting predefined options to users.`)
      ]
    });
    return true;
  }

  // Handle user select
  if (customId === 'showcase_user_select') {
    const count = interaction.values.length;
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent(`## 👥 User Selection\n\nYou selected **${count}** user(s). User Select menus automatically populate with server members!`)
      ]
    });
    return true;
  }

  // Handle role select
  if (customId === 'showcase_role_select') {
    const count = interaction.values.length;
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent(`## 🎭 Role Selection\n\nYou selected **${count}** role(s). Great for role assignment bots!`)
      ]
    });
    return true;
  }

  // Handle channel select
  if (customId === 'showcase_channel_select') {
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent(`## #️⃣ Channel Selected\n\nChannel Select menus let users pick from available channels. You can filter by channel type!`)
      ]
    });
    return true;
  }

  // Handle mentionable select
  if (customId === 'showcase_mentionable_select') {
    const count = interaction.values.length;
    await interaction.reply({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent(`## @️⃣ Mentionable Selection\n\nYou selected **${count}** mentionable(s). This menu combines users AND roles!`)
      ]
    });
    return true;
  }

  // Handle dismiss button
  if (customId === 'dismiss_response') {
    await interaction.update({
      flags: MessageFlags.IsComponentsV2,
      components: [
        new TextDisplayBuilder().setContent('*Response dismissed.*')
      ]
    });
    return true;
  }

  return false;
}
