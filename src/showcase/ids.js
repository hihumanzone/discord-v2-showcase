const { randomUUID } = require('node:crypto');

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
  return randomUUID().replaceAll('-', '').slice(0, 16);
}

module.exports = { makeId, parseId, createSessionId };
