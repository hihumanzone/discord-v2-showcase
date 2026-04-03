import { createSessionId } from './ids.js';

export const SCENE_ORDER = Object.freeze(['home', 'layouts', 'interactions', 'modals', 'workflow']);

function first(items) {
  return items[0] ?? null;
}

export function createSession(ownerId, scene = 'home') {
  return {
    id: createSessionId(),
    ownerId,
    scene,
    channelId: null,
    messageId: null,
    interactions: {
      buttonPresses: 0,
      lastButton: 'None yet',
      stringChoice: 'compact',
      userChoices: [],
      roleChoices: [],
      mentionableChoices: [],
      channelChoices: [],
    },
    modals: {
      feedback: {
        title: 'My first Components V2 app',
        audience: 'developers',
        mode: 'guided',
        features: ['media'],
        confirmed: true,
      },
      routing: {
        approvers: [],
        roles: [],
        mentions: [],
        channels: [],
        uploadedFiles: [],
      },
      note: null,
    },
    workflow: {
      stage: 'draft',
      publishCount: 0,
      lastPublishedScene: null,
    },
  };
}

export function nextScene(currentScene) {
  const index = SCENE_ORDER.indexOf(currentScene);
  return SCENE_ORDER[(index + 1) % SCENE_ORDER.length];
}

export function previousScene(currentScene) {
  const index = SCENE_ORDER.indexOf(currentScene);
  return SCENE_ORDER[(index - 1 + SCENE_ORDER.length) % SCENE_ORDER.length];
}

export function summarizeSelection(values, formatter = (value) => value) {
  if (!values?.length) {
    return 'None selected';
  }

  return values.map(formatter).join(', ');
}

export function summarizeRouting(state) {
  return {
    approver: first(state.approvers) ?? 'No approver chosen',
    role: first(state.roles) ?? 'No role chosen',
    mention: first(state.mentions) ?? 'No mentionable chosen',
    channel: first(state.channels) ?? 'No channel chosen',
    uploadCount: state.uploadedFiles.length,
  };
}

export const sessionStore = new Map();
