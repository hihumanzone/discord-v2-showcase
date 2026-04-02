export const SCENES = Object.freeze({
  home: 'home',
  tour: 'tour',
  builder: 'builder',
  bug: 'bug',
  release: 'release',
  labs: 'labs',
});

export const SCENE_TITLES = Object.freeze({
  home: 'Home',
  tour: 'Product Tour',
  builder: 'Launch Builder',
  bug: 'Bug Desk',
  release: 'Release Room',
  labs: 'Labs',
});

export const DOCS = Object.freeze({
  overview: 'https://docs.discord.com/developers/components/overview',
  reference: 'https://docs.discord.com/developers/components/reference',
  messageGuide: 'https://docs.discord.com/developers/components/using-message-components',
  modalGuide: 'https://docs.discord.com/developers/components/using-modal-components',
  displayGuide: 'https://discordjs.guide/legacy/popular-topics/display-components',
});

export const ACCENTS = Object.freeze({
  home: 0x5865f2,
  tour: 0x00b0f4,
  builder: 0x57f287,
  bug: 0xed4245,
  release: 0x9b59b6,
  labs: 0x11806a,
});

export const AUDIENCE_OPTIONS = Object.freeze([
  {
    label: 'Community launch',
    value: 'community',
    description: 'Broad, highly visual story for the full server',
  },
  {
    label: 'Staff preview',
    value: 'staff',
    description: 'Focused on internal review and rollout readiness',
  },
  {
    label: 'Support enablement',
    value: 'support',
    description: 'Optimized for handoff and incident preparedness',
  },
]);

export const PRESET_OPTIONS = Object.freeze([
  {
    label: 'Balanced rollout',
    value: 'balanced',
    description: 'A premium all-round launch profile',
  },
  {
    label: 'White-glove launch',
    value: 'white-glove',
    description: 'Extra approvals, tighter controls, more visibility',
  },
  {
    label: 'Fast test flight',
    value: 'fast-test',
    description: 'Quick internal proving ground with fewer gates',
  },
]);

export const SEVERITY_OPTIONS = Object.freeze([
  {
    label: 'Low',
    value: 'low',
    description: 'Minor polish issue or small mismatch',
  },
  {
    label: 'Medium',
    value: 'medium',
    description: 'Important, but the flow still recovers cleanly',
  },
  {
    label: 'High',
    value: 'high',
    description: 'A core user path is significantly degraded',
  },
  {
    label: 'Critical',
    value: 'critical',
    description: 'Unsafe to ship without immediate attention',
  },
]);

export const LAB_TONE_OPTIONS = Object.freeze([
  {
    label: 'Guarded',
    value: 'guarded',
    description: 'Conservative and risk-aware update framing',
  },
  {
    label: 'Balanced',
    value: 'balanced',
    description: 'Calm, credible, product-facing communication',
  },
  {
    label: 'Bold',
    value: 'bold',
    description: 'Confident language for a high-visibility share-out',
  },
]);

export const FIELD_IDS = Object.freeze({
  tourAudience: 'tour_audience',
  tourName: 'tour_name',
  tourHighlight: 'tour_highlight',
  builderApprovers: 'builder_approvers',
  builderRoles: 'builder_roles',
  builderOwners: 'builder_owners',
  builderChannels: 'builder_channels',
  bugSeverity: 'bug_severity',
  bugSummary: 'bug_summary',
  bugReproduction: 'bug_reproduction',
  bugFiles: 'bug_files',
  labsTone: 'labs_tone',
  labsHeadline: 'labs_headline',
  labsNotes: 'labs_notes',
});

export const DEFAULT_TOUR = Object.freeze({
  audience: 'community',
  audienceLabel: 'Community launch',
  productName: 'Display Components V2',
  highlight: 'A complete component-first showcase with realistic product flows and polished interaction design.',
  publishedCount: 0,
});

export const DEFAULT_BUILDER = Object.freeze({
  preset: 'balanced',
  presetLabel: 'Balanced rollout',
  channels: [],
  roles: [],
  reviewers: [],
  owners: [],
  modalApprovers: [],
  modalRoles: [],
  modalOwners: [],
  modalChannels: [],
  previewGenerated: false,
});

export const DEFAULT_BUG = Object.freeze({
  severityValue: null,
  severityLabel: null,
  summary: null,
  reproduction: null,
  uploadedFileNames: [],
});

export const DEFAULT_RELEASE = Object.freeze({
  publishedCount: 0,
});

export const DEFAULT_LABS = Object.freeze({
  tone: null,
  toneLabel: null,
  headline: null,
  notes: null,
  publishedCount: 0,
});
