import { MessageFlags } from 'discord.js';

import { validateV2MessagePayload } from './validation.js';
import { text } from './primitives.js';

export function buildV2Message(
  { components, files, ephemeral = false, includeFlags = true, allowedMentions = { parse: [] } },
  label = 'Components V2 message',
) {
  const flags = [];
  if (includeFlags) {
    flags.push(MessageFlags.IsComponentsV2);
  }
  if (ephemeral) {
    flags.push(MessageFlags.Ephemeral);
  }

  const payload = {
    ...(flags.length ? { flags: flags.reduce((sum, value) => sum | value, 0) } : {}),
    allowedMentions,
    components,
    ...(files?.length ? { files } : {}),
  };

  return validateV2MessagePayload(payload, label);
}

export function buildEphemeralNote(markdown) {
  return buildV2Message(
    {
      ephemeral: true,
      components: [text(markdown)],
    },
    'ephemeral note',
  );
}

export function buildOwnerOnlyMessage() {
  return buildEphemeralNote(
    '### This session is locked to the original opener\nRun `/v2-showcase` yourself to start an independent interactive session.',
  );
}

export function buildMissingSessionMessage() {
  return buildEphemeralNote(
    '### This showcase session has expired\nLaunch `/v2-showcase` again to create a fresh interactive session.',
  );
}

export function buildRuntimeErrorMessage() {
  return buildEphemeralNote(
    '### Something went wrong\nThe showcase hit an unexpected error while processing that interaction.',
  );
}
