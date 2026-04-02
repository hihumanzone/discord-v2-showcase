import { commandData } from './commands.js';
import { SCENES } from './showcase/constants.js';
import {
  buildBugReceiptMessage,
  buildLabsPublishMessage,
  buildMainShowcaseMessage,
  buildReleasePublishMessage,
  buildTourPublishMessage,
} from './showcase/messages.js';
import {
  buildBugReportModal,
  buildBuilderAssistantModal,
  buildLabsModal,
  buildTourModal,
} from './showcase/modals.js';
import { sessionStore } from './showcase/sessions.js';
import {
  summarizeMessagePayload,
  summarizeModalPayload,
} from './showcase/validation.js';

function createSession(scene) {
  return sessionStore.create({
    ownerId: '123456789012345678',
    channelId: '223456789012345678',
    guildId: '323456789012345678',
    scene,
  });
}

console.log(`Commands: ${commandData.length}`);

for (const scene of Object.values(SCENES)) {
  const session = createSession(scene);
  const payload = buildMainShowcaseMessage(session, { includeFiles: true });
  console.log(`Scene ${scene}:`, summarizeMessagePayload(payload));
}

const modalSession = createSession(SCENES.home);
console.log('Tour modal:', summarizeModalPayload(buildTourModal(modalSession)));
console.log('Builder modal:', summarizeModalPayload(buildBuilderAssistantModal(modalSession)));
console.log('Bug modal:', summarizeModalPayload(buildBugReportModal(modalSession)));
console.log('Labs modal:', summarizeModalPayload(buildLabsModal(modalSession)));

const publishSession = createSession(SCENES.tour);
publishSession.tour.publishedCount = 1;
publishSession.release.publishedCount = 1;
publishSession.labs.headline = 'Experiment brief';
publishSession.labs.tone = 'balanced';
publishSession.labs.notes = 'Smoke test complete.';

console.log('Bug receipt:', summarizeMessagePayload(buildBugReceiptMessage(publishSession)));
console.log('Tour publish:', summarizeMessagePayload(buildTourPublishMessage(publishSession)));
console.log('Release publish:', summarizeMessagePayload(buildReleasePublishMessage(publishSession)));
console.log('Labs publish:', summarizeMessagePayload(buildLabsPublishMessage(publishSession)));

console.log('Verification completed.');
