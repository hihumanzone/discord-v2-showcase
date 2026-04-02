import { randomUUID } from 'node:crypto';

import {
  DEFAULT_BUG,
  DEFAULT_BUILDER,
  DEFAULT_LABS,
  DEFAULT_RELEASE,
  DEFAULT_TOUR,
  SCENES,
} from './constants.js';
import { cloneDefault } from './helpers.js';

const SESSION_TTL_MS = 1000 * 60 * 60 * 3;
const PRUNE_INTERVAL_MS = 1000 * 60 * 10;

export class ShowcaseSessionStore {
  constructor() {
    this.sessions = new Map();
    setInterval(() => this.prune(), PRUNE_INTERVAL_MS).unref();
  }

  create({ ownerId, channelId, guildId, scene }) {
    const id = randomUUID().replace(/-/g, '').slice(0, 12);
    const session = {
      id,
      ownerId,
      channelId,
      guildId,
      scene,
      createdAt: Date.now(),
      lastTouchedAt: Date.now(),
      messageId: null,
      tour: cloneDefault(DEFAULT_TOUR),
      builder: cloneDefault(DEFAULT_BUILDER),
      bug: cloneDefault(DEFAULT_BUG),
      release: cloneDefault(DEFAULT_RELEASE),
      labs: cloneDefault(DEFAULT_LABS),
    };

    this.sessions.set(id, session);
    return session;
  }

  get(id) {
    const session = this.sessions.get(id);
    if (!session) {
      return null;
    }

    if (this.isExpired(session)) {
      this.sessions.delete(id);
      return null;
    }

    session.lastTouchedAt = Date.now();
    return session;
  }

  delete(id) {
    this.sessions.delete(id);
  }

  reset(session) {
    session.scene = SCENES.home;
    session.tour = cloneDefault(DEFAULT_TOUR);
    session.builder = cloneDefault(DEFAULT_BUILDER);
    session.bug = cloneDefault(DEFAULT_BUG);
    session.release = cloneDefault(DEFAULT_RELEASE);
    session.labs = cloneDefault(DEFAULT_LABS);
    session.lastTouchedAt = Date.now();
    return session;
  }

  isExpired(session) {
    return Date.now() - session.lastTouchedAt > SESSION_TTL_MS;
  }

  prune() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastTouchedAt > SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionStore = new ShowcaseSessionStore();
