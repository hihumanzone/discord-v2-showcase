class SessionStore {
  constructor() {
    this.bySession = new Map();
    this.byMessage = new Map();
  }

  create(session) {
    this.bySession.set(session.sessionId, session);
    if (session.messageId) this.byMessage.set(session.messageId, session.sessionId);
    return session;
  }

  getBySessionId(sessionId) {
    return this.bySession.get(sessionId) ?? null;
  }

  getByMessageId(messageId) {
    const sessionId = this.byMessage.get(messageId);
    return sessionId ? this.getBySessionId(sessionId) : null;
  }

  setMessageId(sessionId, messageId) {
    const session = this.getBySessionId(sessionId);
    if (!session) return null;
    if (session.messageId) this.byMessage.delete(session.messageId);
    session.messageId = messageId;
    this.byMessage.set(messageId, sessionId);
    return session;
  }
}

module.exports = new SessionStore();
