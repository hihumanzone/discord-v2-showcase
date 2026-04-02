const {
  LabelBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const { makeId } = require('./ids');

function buildPlanningModal(state) {
  return new ModalBuilder()
    .setCustomId(makeId(state.sessionId, 'planning_modal'))
    .setTitle('Campaign planning modal')
    .addLabelComponents(
      new LabelBuilder()
        .setLabel('Headline')
        .setDescription('The hero line users should remember')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId('headline')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setRequired(true)
            .setValue(state.brief.headline || '')
            .setPlaceholder('Introducing Showcase Studio v2'),
        ),
      new LabelBuilder()
        .setLabel('Success metric')
        .setDescription('How you define launch success')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId('metric')
            .setStyle(TextInputStyle.Short)
            .setMaxLength(120)
            .setRequired(true)
            .setValue(state.brief.metric || '')
            .setPlaceholder('2,000 clicks in first 24 hours'),
        ),
      new LabelBuilder()
        .setLabel('Primary CTA')
        .setDescription('What users should do next')
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId('cta')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(300)
            .setRequired(true)
            .setValue(state.brief.cta || '')
            .setPlaceholder('Open #announcements, review notes, and react ✅ to confirm'),
        ),
      new LabelBuilder()
        .setLabel('Delivery style')
        .setDescription('Small modal select example')
        .setStringSelectMenuComponent(
          new StringSelectMenuBuilder()
            .setCustomId('delivery')
            .setPlaceholder('Select tone')
            .addOptions(
              { label: 'Direct', value: 'direct', default: true },
              { label: 'Warm', value: 'warm' },
              { label: 'Playful', value: 'playful' },
            ),
        ),
    );
}

module.exports = { buildPlanningModal };
