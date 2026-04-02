const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ContainerBuilder,
  FileBuilder,
  MediaGalleryBuilder,
  MentionableSelectMenuBuilder,
  MessageFlags,
  RoleSelectMenuBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
} = require('discord.js');
const { makeId } = require('./ids');

const THEME_ACCENTS = {
  indigo: 0x5865f2,
  mint: 0x2dd4bf,
  sunset: 0xfb7185,
};

const TEMPLATE_LABELS = {
  launch: 'Product launch',
  patch: 'Patch notes',
  event: 'Community event',
};

function safeText(value) {
  return String(value || '').replaceAll('@', '@\u200b').trim();
}

function summaryLines(state) {
  const channelLine = state.channels.length ? state.channels.map((id) => `<#${id}>`).join(', ') : 'Not selected';
  const roleLine = state.roles.length ? state.roles.map((id) => `<@&${id}>`).join(', ') : 'Not selected';
  const mentionableLine = state.mentionables.length
    ? state.mentionables.map((id) => (id.length > 18 ? `<@&${id}>` : `<@${id}>`)).join(', ')
    : 'Not selected';

  return [
    `• **Template:** ${TEMPLATE_LABELS[state.template] || TEMPLATE_LABELS.launch}`,
    `• **Theme:** ${state.theme}`,
    `• **Announcement channels:** ${channelLine}`,
    `• **Audience roles:** ${roleLine}`,
    `• **Pilot cohort:** ${mentionableLine}`,
    `• **Brief headline:** ${safeText(state.brief.headline) || 'Not set'}`,
    `• **Success metric:** ${safeText(state.brief.metric) || 'Not set'}`,
    `• **Primary CTA:** ${safeText(state.brief.cta) || 'Not set'}`,
  ];
}

function buildMainMessage(state) {
  const s = state.sessionId;

  const heroSection = new SectionBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent('## ✨ Components V2 Showcase Studio'),
      new TextDisplayBuilder().setContent('Build and preview a polished campaign message with modern Discord-native UI patterns.'),
    )
    .setThumbnailAccessory((thumbnail) =>
      thumbnail
        .setURL('https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=256&q=80')
        .setDescription('Studio dashboard preview thumbnail'),
    );

  const status = state.published
    ? '✅ **Published** — this session is in final state.'
    : '🛠️ **Draft** — configure details, open modal, and publish when ready.';

  const workflowContainer = new ContainerBuilder()
    .setAccentColor(THEME_ACCENTS[state.theme] || THEME_ACCENTS.indigo)
    .addTextDisplayComponents(new TextDisplayBuilder().setContent('### Campaign workflow'))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(status))
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    )
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent('Configure the brief and targeting details.'),
          new TextDisplayBuilder().setContent('Use selectors below and open the modal for rich planning fields.'),
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(makeId(s, 'open_modal'))
            .setStyle(ButtonStyle.Primary)
            .setLabel('Open planning modal')
            .setDisabled(state.published),
        ),
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
    )
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(summaryLines(state).join('\n')));

  const templateRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(makeId(s, 'template_select'))
      .setPlaceholder('Choose a campaign template')
      .setDisabled(state.published)
      .addOptions(
        { label: 'Product launch', description: 'Reveal a new feature release', value: 'launch', default: state.template === 'launch' },
        { label: 'Patch notes', description: 'Deliver update highlights clearly', value: 'patch', default: state.template === 'patch' },
        { label: 'Community event', description: 'Promote event attendance and signups', value: 'event', default: state.template === 'event' },
      ),
  );

  const themeRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(makeId(s, 'theme_select'))
      .setPlaceholder('Pick a visual theme accent')
      .setDisabled(state.published)
      .addOptions(
        { label: 'Indigo', description: 'Discord-inspired deep indigo', value: 'indigo', default: state.theme === 'indigo' },
        { label: 'Mint', description: 'Fresh product update tone', value: 'mint', default: state.theme === 'mint' },
        { label: 'Sunset', description: 'Warm campaign spotlight tone', value: 'sunset', default: state.theme === 'sunset' },
      ),
  );

  const channelRow = new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId(makeId(s, 'channel_select'))
      .setPlaceholder('Target one or more announcement channels')
      .setMinValues(0)
      .setMaxValues(3)
      .setDisabled(state.published),
  );

  const roleRow = new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId(makeId(s, 'role_select'))
      .setPlaceholder('Target relevant audience roles')
      .setMinValues(0)
      .setMaxValues(4)
      .setDisabled(state.published),
  );

  const mentionableRow = new ActionRowBuilder().addComponents(
    new MentionableSelectMenuBuilder()
      .setCustomId(makeId(s, 'mentionable_select'))
      .setPlaceholder('Pick pilot users/roles for early access')
      .setMinValues(0)
      .setMaxValues(4)
      .setDisabled(state.published),
  );

  const actionsRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(makeId(s, 'send_assets'))
      .setStyle(ButtonStyle.Secondary)
      .setLabel('Send asset pack'),
    new ButtonBuilder()
      .setCustomId(makeId(s, 'publish'))
      .setStyle(ButtonStyle.Success)
      .setLabel(state.published ? 'Published' : 'Publish showcase')
      .setDisabled(state.published),
    new ButtonBuilder()
      .setCustomId(makeId(s, 'reset'))
      .setStyle(ButtonStyle.Danger)
      .setLabel('Reset draft')
      .setDisabled(state.published),
  );

  return {
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    components: [
      heroSection,
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(false),
      workflowContainer,
      templateRow,
      themeRow,
      channelRow,
      roleRow,
      mentionableRow,
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
      actionsRow,
      new TextDisplayBuilder().setContent('_Tip: every UI element here is a documented Components V2 primitive._'),
    ],
  };
}

function buildAssetPackMessage(state) {
  const fileName = `campaign-brief-${state.sessionId}.json`;
  const payload = {
    session: state.sessionId,
    published: state.published,
    template: state.template,
    theme: state.theme,
    channels: state.channels,
    roles: state.roles,
    mentionables: state.mentionables,
    brief: state.brief,
    generatedAt: new Date().toISOString(),
  };

  const briefAttachment = new AttachmentBuilder(Buffer.from(JSON.stringify(payload, null, 2), 'utf8'), { name: fileName });

  const components = [
    new TextDisplayBuilder().setContent('## 🗂️ Campaign Asset Pack'),
    new ContainerBuilder()
      .setAccentColor(THEME_ACCENTS[state.theme] || THEME_ACCENTS.indigo)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent('Reference visuals and an exportable JSON brief attached as V2 components.'),
      )
      .addMediaGalleryComponents(
        new MediaGalleryBuilder().addItems(
          { media: { url: 'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1200&q=80' }, description: 'UI planning board' },
          { media: { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80' }, description: 'Engineering implementation snapshot' },
          { media: { url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80' }, description: 'Launch analytics dashboard' },
        ),
      )
      .addFileComponents(new FileBuilder().setURL(`attachment://${fileName}`)),
  ];

  return {
    flags: MessageFlags.IsComponentsV2,
    allowedMentions: { parse: [] },
    files: [briefAttachment],
    components,
  };
}

function defaultState(sessionId, userId) {
  return {
    sessionId,
    ownerUserId: userId,
    messageId: null,
    published: false,
    template: 'launch',
    theme: 'indigo',
    channels: [],
    roles: [],
    mentionables: [],
    brief: {
      headline: '',
      metric: '',
      cta: '',
    },
  };
}

module.exports = {
  buildMainMessage,
  buildAssetPackMessage,
  defaultState,
};
