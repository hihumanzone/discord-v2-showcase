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
  StringSelectMenuBuilder,
  UserSelectMenuBuilder
} from 'discord.js';

/**
 * Event RSVP System - Complete event management with Components V2
 */
export async function setupEventRSVP(client) {
  const command = {
    name: 'event-demo',
    description: 'Create an interactive event with RSVP functionality'
  };

  // Store events (in production, use a database)
  const events = new Map();

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand() && interaction.commandName === command.name) {
      await interaction.deferReply();

      const eventId = 'demo_event_1';
      const eventData = {
        id: eventId,
        title: 'Community Game Night',
        description: 'Join us for an evening of multiplayer games and fun!',
        date: 'Saturday, 8:00 PM EST',
        attendees: { going: [], maybe: [], notGoing: [] },
        maxAttendees: 50
      };
      events.set(eventId, eventData);

      const eventMessage = buildEventMessage(eventData);

      await interaction.editReply({
        flags: MessageFlags.IsComponentsV2,
        components: eventMessage
      });
      return;
    }

    // Handle RSVP buttons
    if (interaction.isButton()) {
      const customId = interaction.customId;

      if (customId.startsWith('rsvp_')) {
        const [_, eventId, status] = customId.split('_');
        const event = events.get(eventId);
        
        if (!event) {
          await interaction.reply({
            flags: MessageFlags.Ephemeral,
            components: [new TextDisplayBuilder().setContent('❌ Event not found.')]
          });
          return;
        }

        const userId = interaction.user.id;
        
        // Remove user from all lists first
        for (const statusKey of ['going', 'maybe', 'notGoing']) {
          event.attendees[statusKey] = event.attendees[statusKey].filter(id => id !== userId);
        }

        // Add to selected list
        if (status !== 'remove') {
          event.attendees[status].push(userId);
        }

        events.set(eventId, event);

        const statusEmojis = { going: '✅', maybe: '🤔', notGoing: '❌', remove: '➖' };
        const statusLabels = { going: 'Going', maybe: 'Maybe', notGoing: 'Not Going', remove: 'Removed' };

        await interaction.update({
          flags: MessageFlags.IsComponentsV2,
          components: buildEventMessage(event)
        });

        // Send ephemeral confirmation
        await interaction.followUp({
          flags: MessageFlags.Ephemeral,
          components: [
            new TextDisplayBuilder().setContent(
              `## ${statusEmojis[status]} RSVP Updated!\n\n` +
              `Your status: **${statusLabels[status]}**\n` +
              `Current attendance: **${event.attendees.going.length}/${event.maxAttendees}** going`
            )
          ]
        });
        return;
      }

      if (customId.startsWith('view_')) {
        const [_, eventId, listType] = customId.split('_');
        const event = events.get(eventId);

        if (!event) {
          await interaction.reply({
            flags: MessageFlags.Ephemeral,
            components: [new TextDisplayBuilder().setContent('❌ Event not found.')]
          });
          return;
        }

        const listNames = { attendees: 'Going', maybe: 'Maybe', notGoing: 'Not Going' };
        const listColors = { attendees: 0x57F287, maybe: 0xFEE75C, notGoing: 0xED4245 };
        
        const attendeeList = event.attendees[listType] || [];
        const count = attendeeList.length;

        const listContainer = new ContainerBuilder()
          .setAccentColor(listColors[listType])
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## ${listNames[listType]} (${count})`),
            new TextDisplayBuilder().setContent(
              count > 0 
                ? `Currently **${count}** people ${listType === 'notGoing' ? 'can\'t make it' : 'are ' + listType}.\n\n*User list would appear here in a real implementation.*`
                : `No one is ${listType === 'notGoing' ? 'marked as not going' : listType + ' yet'}.\n\nBe the first!`
            )
          );

        await interaction.reply({
          flags: MessageFlags.IsComponentsV2,
          components: [listContainer]
        });
        return;
      }
    }
  });

  return command;
}

function buildEventMessage(event) {
  const goingCount = event.attendees.going.length;
  const maybeCount = event.attendees.maybe.length;
  const notGoingCount = event.attendees.notGoing.length;
  const spotsLeft = event.maxAttendees - goingCount;

  return [
    new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`# 🎮 ${event.title}`)
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder({ media: { url: 'https://picsum.photos/seed/event/200/200' } })
          .setDescription('Event thumbnail')
      ),

    new ContainerBuilder()
      .setAccentColor(0x5865F2)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`### 📅 Event Details`),
        new TextDisplayBuilder().setContent(
          `**Description:**\n${event.description}\n\n` +
          `**When:** ${event.date}\n` +
          `**Capacity:** ${goingCount}/${event.maxAttendees} (${spotsLeft} spots left)`
        )
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`rsvp_${event.id}_going`)
            .setLabel(`Going (${goingCount})`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅'),
          new ButtonBuilder()
            .setCustomId(`rsvp_${event.id}_maybe`)
            .setLabel(`Maybe (${maybeCount})`)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🤔'),
          new ButtonBuilder()
            .setCustomId(`rsvp_${event.id}_notGoing`)
            .setLabel(`Can't Go (${notGoingCount})`)
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
        )
      ),

    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small),

    new ContainerBuilder()
      .setAccentColor(0xEB459E)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('### 👥 Attendance Lists'),
        new TextDisplayBuilder().setContent('Click below to view who is attending:')
      )
      .addActionRowComponents(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`view_${event.id}_attendees`)
            .setLabel(`Going (${goingCount})`)
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`view_${event.id}_maybe`)
            .setLabel(`Maybe (${maybeCount})`)
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId(`view_${event.id}_notGoing`)
            .setLabel(`Can't Go (${notGoingCount})`)
            .setStyle(ButtonStyle.Secondary)
        )
      ),

    new TextDisplayBuilder().setContent(
      '> 💡 **Tip:** Your RSVP status updates in real-time. You can change your response anytime!'
    )
  ];
}
