const FLAGS = {
  IS_COMPONENTS_V2: 1 << 15,
  EPHEMERAL: 1 << 6,
};

const C = {
  ACTION_ROW: 1,
  BUTTON: 2,
  STRING_SELECT: 3,
  TEXT_INPUT: 4,
  USER_SELECT: 5,
  ROLE_SELECT: 6,
  MENTIONABLE_SELECT: 7,
  CHANNEL_SELECT: 8,
  SECTION: 9,
  TEXT_DISPLAY: 10,
  THUMBNAIL: 11,
  MEDIA_GALLERY: 12,
  FILE: 13,
  SEPARATOR: 14,
  CONTAINER: 17,
  LABEL: 18,
  RADIO_GROUP: 21,
  CHECKBOX_GROUP: 22,
};

const IDS = {
  OPEN_ONBOARDING: 'showcase:open_onboarding',
  OPEN_RELEASE: 'showcase:open_release',
  OPEN_PERSONALIZER: 'showcase:open_personalizer',
  RESET_HOME: 'showcase:reset_home',
  FEATURE_TRACK: 'showcase:feature_track',
  RELEASE_CHANNELS: 'showcase:release_channels',
  MENTION_PICKER: 'showcase:mention_picker',
  ONBOARDING_MODAL: 'showcase:onboarding_modal',
};

module.exports = { FLAGS, C, IDS };
