const { IDS, C, FLAGS } = require('./constants');

const BRAND = 0x5865f2;

function td(content) {
  return { type: C.TEXT_DISPLAY, content };
}

function separator(spacing = 2, divider = true) {
  return { type: C.SEPARATOR, spacing, divider };
}

function primaryButton(custom_id, label, disabled = false) {
  return { type: C.BUTTON, style: 1, custom_id, label, disabled };
}

function secondaryButton(custom_id, label, disabled = false) {
  return { type: C.BUTTON, style: 2, custom_id, label, disabled };
}

function successButton(custom_id, label, disabled = false) {
  return { type: C.BUTTON, style: 3, custom_id, label, disabled };
}

function linkButton(label, url) {
  return { type: C.BUTTON, style: 5, label, url };
}

function homeMessage() {
  const attachmentName = 'release-plan.txt';
  const components = [
    {
      type: C.CONTAINER,
      accent_color: BRAND,
      components: [
        td('## Discord Components V2 — Product Showcase'),
        td('A polished, realistic demo that explores advanced layout, interaction, and modal flows entirely with **Components V2**.'),
        separator(1, true),
        {
          type: C.SECTION,
          components: [
            td('### Launch Readiness Dashboard\nChoose a flow below to inspect onboarding UX, release coordination UI, and personalized setup journeys.'),
          ],
          accessory: {
            type: C.THUMBNAIL,
            media: { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=60' },
            description: 'Dashboard thumbnail',
          },
        },
        separator(1, false),
        {
          type: C.MEDIA_GALLERY,
          items: [
            { media: { url: 'https://images.unsplash.com/photo-1558655146-364adaf1fcc9?auto=format&fit=crop&w=1280&q=60' }, description: 'Workflow overview' },
            { media: { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1280&q=60' }, description: 'Engineering handoff' },
          ],
        },
        separator(1, true),
        td('Use the actions underneath to move through a full showcase journey.'),
      ],
    },
    {
      type: C.FILE,
      file: { url: `attachment://${attachmentName}` },
    },
    {
      type: C.ACTION_ROW,
      components: [
        primaryButton(IDS.OPEN_ONBOARDING, 'Onboarding Journey'),
        secondaryButton(IDS.OPEN_RELEASE, 'Release Console'),
        successButton(IDS.OPEN_PERSONALIZER, 'Personalize Demo'),
      ],
    },
    {
      type: C.ACTION_ROW,
      components: [
        {
          type: C.STRING_SELECT,
          custom_id: IDS.FEATURE_TRACK,
          placeholder: 'Pick a focus track',
          min_values: 1,
          max_values: 1,
          options: [
            { label: 'UI Composition', value: 'ui', description: 'Layout + content component patterns', default: true },
            { label: 'Interactions', value: 'interaction', description: 'Buttons/select menus in real flows' },
            { label: 'Modal UX', value: 'modal', description: 'Modern form design and submissions' },
          ],
        },
      ],
    },
    {
      type: C.ACTION_ROW,
      components: [linkButton('Official Components Docs', 'https://docs.discord.com/developers/components/overview')],
    },
  ];

  return {
    flags: FLAGS.IS_COMPONENTS_V2,
    components,
    files: [{ attachment: Buffer.from(buildReleasePlan(), 'utf8'), name: attachmentName }],
  };
}

function onboardingMessage(values = {}) {
  const role = values.role ?? 'Product Operator';
  const launchStyle = values.launch_style ?? 'careful';
  const priorities = values.priorities?.join(', ') ?? 'clarity';

  return {
    flags: FLAGS.IS_COMPONENTS_V2,
    components: [
      {
        type: C.CONTAINER,
        accent_color: 0x57f287,
        components: [
          td('## Onboarding Journey'),
          td(`Configured for **${role}** with a **${launchStyle}** release style. Priorities: **${priorities}**.`),
          separator(1, true),
          {
            type: C.SECTION,
            components: [
              td('### Step 1: Workspace Scan\nUse the mention picker to simulate selecting mentors/reviewers for launch support.'),
            ],
            accessory: primaryButton(IDS.MENTION_PICKER, 'Select Teammates'),
          },
          {
            type: C.SECTION,
            components: [
              td('### Step 2: Finalize Path\nJump back to home or open release controls to continue this demo statefully.'),
            ],
            accessory: secondaryButton(IDS.OPEN_RELEASE, 'Open Release Console'),
          },
        ],
      },
      {
        type: C.ACTION_ROW,
        components: [
          {
            type: C.MENTIONABLE_SELECT,
            custom_id: IDS.MENTION_PICKER,
            placeholder: 'Select collaborators for this onboarding run',
            min_values: 1,
            max_values: 3,
          },
        ],
      },
      {
        type: C.ACTION_ROW,
        components: [secondaryButton(IDS.RESET_HOME, 'Back to Showcase Home')],
      },
    ],
  };
}

function releaseConsoleMessage(selectedTrack) {
  const copy = {
    ui: 'UI Composition track emphasizes containers, sections, galleries, and spacing rhythm.',
    interaction: 'Interactions track focuses on safe custom IDs, stateful updates, and actionable controls.',
    modal: 'Modal UX track demonstrates labels, text input, radio groups, and checkbox groups.',
  };

  return {
    flags: FLAGS.IS_COMPONENTS_V2,
    components: [
      {
        type: C.CONTAINER,
        accent_color: 0xfee75c,
        components: [
          td('## Release Console'),
          td(copy[selectedTrack] ?? copy.ui),
          separator(2, true),
          {
            type: C.SECTION,
            components: [
              td('### Channel Routing\nChoose target channels to simulate where this polished V2 announcement should land.'),
            ],
            accessory: linkButton('Publishing Guide', 'https://docs.discord.com/developers/components/using-message-components'),
          },
          separator(1, false),
          td('After selecting channels, move back to home or open personalization modal for iterative message design.'),
        ],
      },
      {
        type: C.ACTION_ROW,
        components: [
          {
            type: C.CHANNEL_SELECT,
            custom_id: IDS.RELEASE_CHANNELS,
            placeholder: 'Select channels for rollout preview',
            min_values: 1,
            max_values: 2,
          },
        ],
      },
      {
        type: C.ACTION_ROW,
        components: [
          secondaryButton(IDS.RESET_HOME, 'Back to Showcase Home'),
          successButton(IDS.OPEN_PERSONALIZER, 'Refine with Modal'),
        ],
      },
    ],
  };
}

function showPersonalizationModal(interaction) {
  return interaction.showModal({
    custom_id: IDS.ONBOARDING_MODAL,
    title: 'Personalize Showcase Journey',
    components: [
      {
        type: C.LABEL,
        label: 'Role or team name',
        description: 'Appears in personalized message copy',
        component: {
          type: C.TEXT_INPUT,
          custom_id: 'role_name',
          style: 1,
          min_length: 2,
          max_length: 60,
          placeholder: 'e.g., Community Launch Team',
          required: true,
        },
      },
      {
        type: C.LABEL,
        label: 'Launch style',
        description: 'Choose one style for this scenario',
        component: {
          type: C.RADIO_GROUP,
          custom_id: 'launch_style',
          options: [
            { label: 'Careful', value: 'careful', description: 'Phased launch with gradual rollout', default: true },
            { label: 'Fast', value: 'fast', description: 'Ship rapidly and iterate' },
            { label: 'Bold', value: 'bold', description: 'High-visibility announcement' },
          ],
          required: true,
        },
      },
      {
        type: C.LABEL,
        label: 'Top priorities',
        description: 'Select one or more qualities you care about',
        component: {
          type: C.CHECKBOX_GROUP,
          custom_id: 'priorities',
          min_values: 1,
          max_values: 3,
          options: [
            { label: 'Clarity', value: 'clarity', description: 'Easy to understand' },
            { label: 'Visual polish', value: 'polish', description: 'Premium message composition', default: true },
            { label: 'Iteration speed', value: 'speed', description: 'Fast update loops' },
          ],
        },
      },
    ],
  });
}

function extractModalValues(interaction) {
  const components = interaction.components ?? interaction.toJSON().data?.components ?? [];
  const output = {};

  for (const label of components) {
    const child = label.component;
    if (!child?.custom_id) continue;

    if (typeof child.value === 'string') {
      output[child.custom_id] = child.value;
      continue;
    }

    if (Array.isArray(child.values)) {
      output[child.custom_id] = child.values;
      continue;
    }

    if (typeof child.value !== 'undefined') {
      output[child.custom_id] = child.value;
    }
  }

  return {
    role: output.role_name,
    launch_style: output.launch_style,
    priorities: output.priorities,
  };
}

function trackSelectedMessage(track) {
  return {
    flags: FLAGS.IS_COMPONENTS_V2 | FLAGS.EPHEMERAL,
    components: [
      td(`Track switched to **${track}**. Open **Release Console** to see this reflected in the next state.`),
    ],
  };
}

function mentionSelectionMessage(count) {
  return {
    flags: FLAGS.IS_COMPONENTS_V2 | FLAGS.EPHEMERAL,
    components: [td(`Saved **${count}** collaborator selection(s) for this onboarding run.`)],
  };
}

function channelSelectionMessage(count) {
  return {
    flags: FLAGS.IS_COMPONENTS_V2 | FLAGS.EPHEMERAL,
    components: [td(`Release routing preview updated with **${count}** selected channel(s).`)],
  };
}

function buildReleasePlan() {
  return [
    'Discord Components V2 Showcase Release Plan',
    '',
    '- Home Dashboard: rich layout + media + file exposure',
    '- Onboarding Journey: section accessory actions + mentionable select',
    '- Release Console: channel select + linked docs',
    '- Personalization Modal: label + text input + radio + checkbox',
  ].join('\n');
}

module.exports = {
  homeMessage,
  onboardingMessage,
  releaseConsoleMessage,
  showPersonalizationModal,
  extractModalValues,
  trackSelectedMessage,
  mentionSelectionMessage,
  channelSelectionMessage,
};
