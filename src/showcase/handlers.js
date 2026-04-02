const { IDS, FLAGS } = require('./constants');
const {
  homeMessage,
  onboardingMessage,
  releaseConsoleMessage,
  showPersonalizationModal,
  extractModalValues,
  trackSelectedMessage,
  mentionSelectionMessage,
  channelSelectionMessage,
} = require('./views');

async function handleShowcaseCommand(interaction) {
  await interaction.reply(homeMessage());
}

async function handleComponentInteraction(interaction, state) {
  const { customId } = interaction;

  if (customId === IDS.OPEN_ONBOARDING) {
    await interaction.update(onboardingMessage(state.personalization));
    return;
  }

  if (customId === IDS.OPEN_RELEASE) {
    await interaction.update(releaseConsoleMessage(state.track));
    return;
  }

  if (customId === IDS.RESET_HOME) {
    await interaction.update(homeMessage());
    return;
  }

  if (customId === IDS.OPEN_PERSONALIZER) {
    await showPersonalizationModal(interaction);
    return;
  }

  if (customId === IDS.FEATURE_TRACK && interaction.isStringSelectMenu()) {
    state.track = interaction.values[0];
    await interaction.reply(trackSelectedMessage(state.track));
    return;
  }

  if (customId === IDS.MENTION_PICKER && interaction.isAnySelectMenu()) {
    const count = interaction.values?.length ?? 0;
    await interaction.reply(mentionSelectionMessage(count));
    return;
  }

  if (customId === IDS.RELEASE_CHANNELS && interaction.isChannelSelectMenu()) {
    const count = interaction.values?.length ?? 0;
    await interaction.reply(channelSelectionMessage(count));
    return;
  }

  await interaction.reply({
    flags: FLAGS.IS_COMPONENTS_V2 | FLAGS.EPHEMERAL,
    components: [{ type: 10, content: 'This interaction is not wired in the showcase yet.' }],
  });
}

async function handleModalSubmit(interaction, state) {
  if (interaction.customId !== IDS.ONBOARDING_MODAL) {
    return;
  }

  state.personalization = extractModalValues(interaction);

  await interaction.reply({
    ...onboardingMessage(state.personalization),
    flags: FLAGS.IS_COMPONENTS_V2 | FLAGS.EPHEMERAL,
  });

  if (interaction.message) {
    await interaction.message.edit(onboardingMessage(state.personalization));
  }
}

module.exports = {
  handleShowcaseCommand,
  handleComponentInteraction,
  handleModalSubmit,
};
