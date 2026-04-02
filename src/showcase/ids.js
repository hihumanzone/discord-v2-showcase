const PREFIX = 'v2show';

function makeId(sessionId, action) {
  return `${PREFIX}:${sessionId}:${action}`;
}

function parseId(customId) {
  if (!customId?.startsWith(`${PREFIX}:`)) return null;
  const parts = customId.split(':');
  if (parts.length < 3) return null;
  const [, sessionId, action] = parts;
  return { sessionId, action };
}

function createSessionId() {
  return Math.random().toString(36).slice(2, 10);
}

module.exports = { makeId, parseId, createSessionId };
