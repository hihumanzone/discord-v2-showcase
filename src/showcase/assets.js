import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AttachmentBuilder } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetRoot = path.resolve(__dirname, '../../assets');

export const ASSETS = Object.freeze({
  homeHero: 'home-hero.png',
  tourHero: 'tour-hero.png',
  workflow: 'workflow-board.png',
  analytics: 'analytics-panel.png',
  quality: 'quality-panel.png',
  builder: 'builder-panel.png',
  bug: 'bug-panel.png',
  labs: 'labs-panel.png',
  manifest: 'showcase-manifest.md',
  launchChecklist: 'launch-checklist.md',
  releaseNotes: 'release-notes.md',
  triageTemplate: 'triage-template.md',
});

export const SHARED_MESSAGE_ASSET_NAMES = Object.freeze([
  ASSETS.homeHero,
  ASSETS.tourHero,
  ASSETS.workflow,
  ASSETS.analytics,
  ASSETS.quality,
  ASSETS.builder,
  ASSETS.bug,
  ASSETS.labs,
  ASSETS.manifest,
  ASSETS.launchChecklist,
]);

export function assetPath(name) {
  return path.join(assetRoot, name);
}

export function assetUrl(name) {
  return `attachment://${name}`;
}

export function attachment(name) {
  return new AttachmentBuilder(assetPath(name), { name });
}

export function subsetFiles(names) {
  return names.map((name) => attachment(name));
}
