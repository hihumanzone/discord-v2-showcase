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

function seedBuilderState(session) {
  session.builder.channels = ['#announcements', '#beta-ship', '#ops'];
  session.builder.roles = ['@Launch Lead', '@QA', '@Support'];
  session.builder.reviewers = ['Avery', 'Mina', 'Sol'];
  session.builder.owners = ['@Ops', 'Iris'];
  session.builder.modalApprovers = ['Avery', 'Mina'];
  session.builder.modalChannels = ['#announcements', '#beta-ship'];
  session.builder.modalPosture = 'staged';
  session.builder.modalPostureLabel = 'Staged ramp';
  session.builder.modalPackageValues = ['release-notes', 'qa-checklist', 'analytics-snapshot'];
  session.builder.modalPackageLabels = ['Release notes', 'QA checklist', 'Analytics snapshot'];
  session.builder.modalLiveWatch = true;
  session.builder.previewGenerated = true;
}

function seedBugState(session) {
  session.bug.severityValue = 'high';
  session.bug.severityLabel = 'High';
  session.bug.summary = 'Severity picker does not persist after a modal submit.';
  session.bug.reproduction = 'Open the bug report modal, submit a report, then return to the main message.';
  session.bug.uploadedFileNames = ['bug.png', 'logs.txt'];
}

function seedLabsState(session) {
  session.labs.tone = 'balanced';
  session.labs.toneLabel = 'Balanced';
  session.labs.headline = 'Experiment brief';
  session.labs.notes = 'Smoke test complete.';
  session.labs.publishedCount = 1;
}

function verifyMainMessages() {
  console.log(`Commands: ${commandData.length}`);

  for (const scene of Object.values(SCENES)) {
    const session = createSession(scene);

    if (scene === SCENES.builder) {
      seedBuilderState(session);
    }

    if (scene === SCENES.bug) {
      seedBugState(session);
    }

    if (scene === SCENES.labs) {
      seedLabsState(session);
    }

    const payload = buildMainShowcaseMessage(session, { includeFiles: true });
    console.log(`Scene ${scene}:`, summarizeMessagePayload(payload));
  }
}

function verifyModals() {
  const session = createSession(SCENES.builder);
  seedBuilderState(session);
  seedLabsState(session);
  seedBugState(session);

  console.log('Tour modal:', summarizeModalPayload(buildTourModal(session)));
  console.log('Builder modal:', summarizeModalPayload(buildBuilderAssistantModal(session)));
  console.log('Bug modal:', summarizeModalPayload(buildBugReportModal(session)));
  console.log('Labs modal:', summarizeModalPayload(buildLabsModal(session)));
}

function verifyFollowUps() {
  const session = createSession(SCENES.release);
  session.tour.publishedCount = 1;
  session.release.publishedCount = 1;
  seedLabsState(session);
  seedBugState(session);

  console.log('Bug receipt:', summarizeMessagePayload(buildBugReceiptMessage(session)));
  console.log('Tour publish:', summarizeMessagePayload(buildTourPublishMessage(session)));
  console.log('Release publish:', summarizeMessagePayload(buildReleasePublishMessage(session)));
  console.log('Labs publish:', summarizeMessagePayload(buildLabsPublishMessage(session)));
}

verifyMainMessages();
verifyModals();
verifyFollowUps();
console.log('Verification completed.');
