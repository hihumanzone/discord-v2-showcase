// All interactive component custom IDs start with the same namespace.
// That makes it easy to ignore unrelated buttons/select menus from other bots.
const PREFIX = 'v2ref';

export function createSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeId(sessionId, kind, action) {
  return `${PREFIX}:${sessionId}:${kind}:${action}`;
}

export function parseId(customId) {
  const [prefix, sessionId, kind, ...rest] = String(customId).split(':');
  if (prefix !== PREFIX || !sessionId || !kind || rest.length === 0) {
    return null;
  }

  return {
    sessionId,
    kind,
    action: rest.join(':'),
  };
}
