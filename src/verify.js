import {
  buildMainMessage,
  buildPublicWorkflowPost,
  SCENES,
} from './showcase/scenes.js';
import {
  buildFeedbackModal,
  buildRoutingModal,
  buildGuidedNoteModal,
} from './showcase/modals.js';
import { createSession } from './showcase/state.js';
import {
  summarizeMessagePayload,
  summarizeModalPayload,
  validateModalPayload,
  validateV2MessagePayload,
} from './showcase/validation.js';

function logSummary(label, summary) {
  console.log(`${label}:`, JSON.stringify(summary));
}

const session = createSession('verify-user', SCENES.home);
session.interactions.stringChoice = 'compact';
session.interactions.userChoices = ['123'];
session.interactions.roleChoices = ['456'];
session.interactions.mentionableChoices = ['123', '456'];
session.interactions.channelChoices = ['789'];
session.modals.feedback.title = 'Educational reference';
session.modals.feedback.audience = 'developers';
session.modals.feedback.mode = 'guided';
session.modals.feedback.features = ['media', 'files'];
session.modals.feedback.confirmed = true;
session.modals.routing.approvers = ['Alice'];
session.modals.routing.roles = ['QA'];
session.modals.routing.mentions = ['Alice', '@QA'];
session.modals.routing.channels = ['#ship-room'];
session.modals.routing.uploadedFiles = ['bug.png'];
session.modals.note = 'Text Display works inside modals too.';
session.workflow.stage = 'published';
session.workflow.publishCount = 1;

for (const scene of Object.values(SCENES)) {
  session.scene = scene;
  const message = buildMainMessage(session);
  validateV2MessagePayload(message, `${scene} scene`);
  logSummary(`${scene} scene`, summarizeMessagePayload(message));
}

for (const [label, modal] of [
  ['feedback modal', buildFeedbackModal(session)],
  ['routing modal', buildRoutingModal(session)],
  ['guided note modal', buildGuidedNoteModal(session)],
]) {
  validateModalPayload(modal, label);
  logSummary(label, summarizeModalPayload(modal));
}

const workflowPost = buildPublicWorkflowPost(session);
validateV2MessagePayload(workflowPost, 'workflow post');
logSummary('workflow post', summarizeMessagePayload(workflowPost));
