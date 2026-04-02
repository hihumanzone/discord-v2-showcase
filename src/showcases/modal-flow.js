import {
  MessageFlags,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SectionBuilder,
  ContainerBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} from 'discord.js';

/**
 * Modal Flow Showcase - Demonstrates modal components and form handling
 */
export async function setupModalFlow(client) {
  const command = {
    name: 'modal-demo',
    description: 'Open an interactive modal form demonstration'
  };

  client.on('interactionCreate', async (interaction) => {
    // Handle the main command
    if (interaction.isChatInputCommand() && interaction.commandName === command.name) {
      const introMessage = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('# 📝 Modal Forms Demo'),
          new TextDisplayBuilder().setContent(
            'This demonstration shows how to create and handle **modal dialogs** using Components V2.\n\n' +
            '**Modal Features:**\n' +
            '• Text inputs (short & long)\n' +
            '• Select menus inside modals\n' +
            '• Required/optional fields\n' +
            '• Validation and error handling'
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('open_feedback_modal')
              .setLabel('Feedback Form')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('💬'),
            new ButtonBuilder()
              .setCustomId('open_profile_modal')
              .setLabel('Profile Setup')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('👤'),
            new ButtonBuilder()
              .setCustomId('open_bug_modal')
              .setLabel('Bug Report')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('🐛')
          )
        );

      await interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [introMessage]
      });
      return;
    }

    // Handle button clicks to open modals
    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId === 'open_feedback_modal') {
        const modal = new ModalBuilder()
          .setCustomId('feedback_modal')
          .setTitle('Share Your Feedback');

        const ratingSelect = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('feedback_rating')
            .setPlaceholder('How was your experience?')
            .addOptions(
              { label: '⭐⭐⭐⭐⭐ Excellent', value: '5', emoji: '😍', description: 'Absolutely fantastic!' },
              { label: '⭐⭐⭐⭐ Great', value: '4', emoji: '😊', description: 'Very good experience' },
              { label: '⭐⭐⭐ Good', value: '3', emoji: '🙂', description: 'Decent overall' },
              { label: '⭐⭐ Fair', value: '2', emoji: '😐', description: 'Could be better' },
              { label: '⭐ Poor', value: '1', emoji: '😞', description: 'Needs improvement' }
            )
        );

        const feedbackInput = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('feedback_details')
            .setLabel('Your Feedback')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Tell us what you liked or what could be improved...')
            .setMinLength(20)
            .setMaxLength(1000)
            .setRequired(true)
        );

        modal.addComponents(ratingSelect, feedbackInput);
        await interaction.showModal(modal);
        return;
      }

      if (customId === 'open_profile_modal') {
        const modal = new ModalBuilder()
          .setCustomId('profile_modal')
          .setTitle('Setup Your Profile');

        const displayNameInput = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('profile_display_name')
            .setLabel('Display Name')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('How should we call you?')
            .setMinLength(2)
            .setMaxLength(50)
            .setRequired(true)
        );

        const bioInput = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('profile_bio')
            .setLabel('Bio')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Tell others about yourself...')
            .setMinLength(10)
            .setMaxLength(500)
            .setRequired(false)
        );

        const pronounsInput = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('profile_pronouns')
            .setLabel('Pronouns (Optional)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('e.g., they/them, she/her, he/him')
            .setMaxLength(50)
            .setRequired(false)
        );

        modal.addComponents(displayNameInput, bioInput, pronounsInput);
        await interaction.showModal(modal);
        return;
      }

      if (customId === 'open_bug_modal') {
        const modal = new ModalBuilder()
          .setCustomId('bug_report_modal')
          .setTitle('Report a Bug');

        const titleInput = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('bug_title')
            .setLabel('Bug Title')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Brief description of the issue')
            .setMinLength(5)
            .setMaxLength(100)
            .setRequired(true)
        );

        const stepsInput = new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('bug_steps')
            .setLabel('Steps to Reproduce')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('1. Go to...\n2. Click on...\n3. See error...')
            .setMinLength(20)
            .setMaxLength(1000)
            .setRequired(true)
        );

        const severitySelect = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('bug_severity')
            .setPlaceholder('Select severity level')
            .addOptions(
              { label: 'Critical', value: 'critical', emoji: '🔴', description: 'System broken, no workaround' },
              { label: 'High', value: 'high', emoji: '🟠', description: 'Major feature broken' },
              { label: 'Medium', value: 'medium', emoji: '🟡', description: 'Feature impaired' },
              { label: 'Low', value: 'low', emoji: '🟢', description: 'Minor issue, cosmetic' }
            )
        );

        modal.addComponents(titleInput, stepsInput, severitySelect);
        await interaction.showModal(modal);
        return;
      }
    }

    // Handle modal submissions
    if (interaction.isModalSubmit()) {
      const modalCustomId = interaction.customId;

      if (modalCustomId === 'feedback_modal') {
        const rating = interaction.fields.getTextInputValue('feedback_rating') || 
                       interaction.fields.components.find(c => c.components[0].custom_id === 'feedback_rating')?.components[0]?.values?.[0] || 'N/A';
        const details = interaction.fields.getTextInputValue('feedback_details');

        // Get rating from select menu in modal
        let ratingValue = 'Not specified';
        for (const row of interaction.fields.components) {
          for (const component of row.components) {
            if (component.type === 3 && component.values) {
              ratingValue = `${component.values[0]} stars`;
            }
          }
        }

        const responseContainer = new ContainerBuilder()
          .setAccentColor(0x57F287)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## ✅ Thank You for Your Feedback!'),
            new TextDisplayBuilder().setContent(
              `**Rating:** ${ratingValue}\n\n` +
              `**Your Feedback:**\n> ${details.substring(0, 500)}${details.length > 500 ? '...' : ''}\n\n` +
              'We appreciate you taking the time to share your thoughts!'
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('submit_more_feedback')
                .setLabel('Submit Another')
                .setStyle(ButtonStyle.Secondary)
            )
          );

        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [responseContainer]
        });
        return;
      }

      if (modalCustomId === 'profile_modal') {
        const displayName = interaction.fields.getTextInputValue('profile_display_name');
        const bio = interaction.fields.getTextInputValue('profile_bio') || '*No bio provided*';
        const pronouns = interaction.fields.getTextInputValue('profile_pronouns') || '*Not specified*';

        const profileContainer = new ContainerBuilder()
          .setAccentColor(0xEB459E)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 👤 Profile Created: ${displayName}`),
            new TextDisplayBuilder().setContent(
              `### About Me\n${bio}\n\n` +
              `### Pronouns\n${pronouns}\n\n` +
              '> Your profile has been saved successfully!'
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('edit_profile')
                .setLabel('Edit Profile')
                .setStyle(ButtonStyle.Primary)
            )
          );

        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [profileContainer]
        });
        return;
      }

      if (modalCustomId === 'bug_report_modal') {
        const title = interaction.fields.getTextInputValue('bug_title');
        const steps = interaction.fields.getTextInputValue('bug_steps');
        
        let severity = 'Not specified';
        for (const row of interaction.fields.components) {
          for (const component of row.components) {
            if (component.type === 3 && component.values) {
              severity = component.values[0].toUpperCase();
            }
          }
        }

        const bugContainer = new ContainerBuilder()
          .setAccentColor(0xED4245)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent('## 🐛 Bug Report Submitted'),
            new TextDisplayBuilder().setContent(
              `**Title:** ${title}\n` +
              `**Severity:** ${severity}\n\n` +
              `**Steps to Reproduce:**\n\`\`\`\n${steps.substring(0, 500)}${steps.length > 500 ? '...' : ''}\n\`\`\`\n\n` +
              'Our team will investigate this issue. Thank you for helping improve the service!'
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('report_another_bug')
                .setLabel('Report Another')
                .setStyle(ButtonStyle.Secondary)
            )
          );

        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [bugContainer]
        });
        return;
      }
    }
  });

  return command;
}
