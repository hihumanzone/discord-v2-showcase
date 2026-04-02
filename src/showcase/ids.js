const PREFIX = 'sv2';

export function cid(kind, sessionId, action) {
  return `${PREFIX}:${kind}:${sessionId}:${action}`;
}

export function parseCid(customId) {
  if (typeof customId !== 'string' || !customId.startsWith(`${PREFIX}:`)) {
    return null;
  }

  const [prefix, kind, sessionId, ...actionParts] = customId.split(':');
  if (prefix !== PREFIX || !kind || !sessionId || actionParts.length === 0) {
    return null;
  }

  return {
    kind,
    sessionId,
    action: actionParts.join(':'),
  };
}
