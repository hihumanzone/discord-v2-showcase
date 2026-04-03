import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AttachmentBuilder } from 'discord.js';

// Components V2 messages do not auto-render attachments.
// Every file we upload must be referenced by a File, Thumbnail, or Media Gallery
// component. We keep that logic centralized here so the scene code stays clean.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetDirectory = path.resolve(__dirname, '../../assets');

export const ASSETS = Object.freeze({
  homeHero: 'home-hero.png',
  workflowBoard: 'workflow-board.png',
  analyticsPanel: 'analytics-panel.png',
  qualityPanel: 'quality-panel.png',
  builderPanel: 'builder-panel.png',
  bugPanel: 'bug-panel.png',
  labsPanel: 'labs-panel.png',
  manifest: 'showcase-manifest.md',
  releaseNotes: 'release-notes.md',
  triageTemplate: 'triage-template.md',
});

export const SHARED_MESSAGE_ASSETS = Object.freeze([
  ASSETS.homeHero,
  ASSETS.workflowBoard,
  ASSETS.analyticsPanel,
  ASSETS.qualityPanel,
  ASSETS.builderPanel,
  ASSETS.bugPanel,
  ASSETS.labsPanel,
  ASSETS.manifest,
  ASSETS.releaseNotes,
  ASSETS.triageTemplate,
]);

function assetPath(name) {
  return path.join(assetDirectory, name);
}

export function attachmentUrl(name) {
  return `attachment://${name}`;
}

export function buildAttachments(names) {
  return names.map((name) => new AttachmentBuilder(assetPath(name), { name }));
}

export function buildSharedAttachments() {
  return buildAttachments(SHARED_MESSAGE_ASSETS);
}
