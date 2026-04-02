import {
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ThumbnailBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from 'discord.js';

/**
 * Interactive Flow Showcase - Multi-step interaction demonstrating stateful UI
 */
export async function setupInteractiveFlow(client) {
  const command = {
    name: 'interactive-demo',
    description: 'Start an interactive multi-step demonstration flow'
  };

  // Store for tracking user progress (in production, use a database)
  const userProgress = new Map();

  client.on('interactionCreate', async (interaction) => {
    // Handle the main command
    if (interaction.isChatInputCommand() && interaction.commandName === command.name) {
      await interaction.deferReply();

      const welcomeMessage = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# 🎮 Interactive Demo'),
          new TextDisplayBuilder().setContent(
            'Welcome to the **interactive demonstration**! This showcase demonstrates how to build multi-step flows using Components V2.\n\n' +
            '**What you\'ll experience:**\n' +
            '• Stateful button interactions\n' +
            '• Dynamic content updates\n' +
            '• Progress tracking\n' +
            '• Branching decision paths'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('flow_start')
              .setLabel('Begin Journey')
              .setStyle(ButtonStyle.Success)
              .setEmoji('🚀')
          )
        );

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: [welcomeMessage]
      });
      return;
    }

    // Handle button interactions for the flow
    if (!interaction.isButton()) return;

    const customId = interaction.customId;
    const userId = interaction.user.id;

    // Get or initialize user progress
    if (!userProgress.has(userId)) {
      userProgress.set(userId, { step: 0, choices: [] });
    }
    const progress = userProgress.get(userId);

    // Start the flow
    if (customId === 'flow_start') {
      progress.step = 1;
      
      const step1Message = new ContainerBuilder()
        .setAccentColor(0x57F287)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('## Step 1: Choose Your Path'),
          new TextDisplayBuilder().setContent(
            'Every journey begins with a choice. Select your starting point:\n\n' +
            'Each path leads to different experiences ahead!'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('path_explorer')
              .setLabel('Explorer')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🗺️'),
            new ButtonBuilder()
              .setCustomId('path_scholar')
              .setLabel('Scholar')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('📚'),
            new ButtonBuilder()
              .setCustomId('path_creator')
              .setLabel('Creator')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🎨')
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('flow_back')
              .setLabel('Back')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true),
            new ButtonBuilder()
              .setCustomId('flow_next_locked')
              .setLabel('Next')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          )
        );

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [step1Message]
      });
      return;
    }

    // Handle path selection
    if (['path_explorer', 'path_scholar', 'path_creator'].includes(customId)) {
      const pathNames = {
        path_explorer: 'Explorer',
        path_scholar: 'Scholar', 
        path_creator: 'Creator'
      };
      const pathEmojis = {
        path_explorer: '🗺️',
        path_scholar: '📚',
        path_creator: '🎨'
      };
      
      progress.choices.push(pathNames[customId]);
      progress.step = 2;

      const confirmationMessage = new ContainerBuilder()
        .setAccentColor(0xFEE75C)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## ${pathEmojis[customId]} You chose: ${pathNames[customId]}`),
          new TextDisplayBuilder().setContent(
            `Excellent choice! The **${pathNames[customId]}** path is perfect for those who seek adventure and discovery.\n\n` +
            '**Your Journey So Far:**\n' +
            `• Starting Path: ${pathNames[customId]}\n` +
            `• Steps Completed: 1/3\n` +
            `• Next: Make another choice to continue`
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('continue_step2')
              .setLabel('Continue Journey')
              .setStyle(ButtonStyle.Success)
              .setEmoji('➡️')
          )
        );

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [confirmationMessage]
      });
      return;
    }

    // Continue to step 2
    if (customId === 'continue_step2') {
      const step2Message = new ContainerBuilder()
        .setAccentColor(0xEB459E)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('## Step 2: Gather Resources'),
          new TextDisplayBuilder().setContent(
            'Before continuing, you need to gather some resources. What will you prioritize?\n\n' +
            '*Your choice affects the final outcome!*'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('resource_time')
              .setLabel('Time')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('⏰'),
            new ButtonBuilder()
              .setCustomId('resource_energy')
              .setLabel('Energy')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('⚡'),
            new ButtonBuilder()
              .setCustomId('resource_wisdom')
              .setLabel('Wisdom')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🦉')
          )
        );

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [step2Message]
      });
      return;
    }

    // Handle resource selection
    if (['resource_time', 'resource_energy', 'resource_wisdom'].includes(customId)) {
      const resourceNames = {
        resource_time: 'Time',
        resource_energy: 'Energy',
        resource_wisdom: 'Wisdom'
      };
      const resourceEmojis = {
        resource_time: '⏰',
        resource_energy: '⚡',
        resource_wisdom: '🦉'
      };

      progress.choices.push(resourceNames[customId]);
      progress.step = 3;

      const step3Message = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## Step 3: Final Decision`),
          new TextDisplayBuilder().setContent(
            `You've gathered **${resourceNames[customId]}** on your journey as a **${progress.choices[0]}**.\n\n` +
            'Now comes the ultimate question that will determine your destiny...'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('final_yes')
              .setLabel('Embrace Destiny')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✨'),
            new ButtonBuilder()
              .setCustomId('final_no')
              .setLabel('Forge Your Own Path')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🔥')
          )
        );

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [step3Message]
      });
      return;
    }

    // Handle final decision
    if (customId === 'final_yes' || customId === 'final_no') {
      const outcome = customId === 'final_yes' ? 'Destiny' : 'Independence';
      progress.choices.push(outcome);
      progress.step = 4;

      const summary = progress.choices.map((c, i) => `**${i + 1}.** ${c}`).join('\n');

      const resultContainer = new ContainerBuilder()
        .setAccentColor(customId === 'final_yes' ? 0x57F287 : 0xED4245)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(`## 🎉 Journey Complete!`),
          new TextDisplayBuilder().setContent(
            `You chose the path of **${outcome}**! Here's your complete journey:\n\n` +
            '### Your Choices:\n' +
            `${summary}\n\n` +
            '> Every choice shapes your unique story. Thank you for experiencing this interactive demo!'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('flow_restart')
              .setLabel('Start Over')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('🔄')
          )
        );

      // Clear progress for restart capability
      userProgress.delete(userId);

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [resultContainer]
      });
      return;
    }

    // Handle restart
    if (customId === 'flow_restart') {
      // Reset and show welcome again
      const restartMessage = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# 🎮 Ready for Another Journey?'),
          new TextDisplayBuilder().setContent('Click below to start a fresh adventure with new choices!')
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('flow_start')
              .setLabel('Begin Again')
              .setStyle(ButtonStyle.Success)
              .setEmoji('🚀')
          )
        );

      await interaction.update({
        flags: MessageFlags.IsComponentsV2,
        components: [restartMessage]
      });
      return;
    }

    // Handle back button (placeholder for navigation)
    if (customId === 'flow_back') {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        components: [
          new TextDisplayBuilder().setContent('*Navigation coming soon! Use the main buttons to proceed.*')
        ]
      });
    }
  });

  return command;
}
