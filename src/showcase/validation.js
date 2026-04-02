const MESSAGE_ATTACHMENT_LIMIT = 10;
const MESSAGE_COMPONENT_LIMIT = 40;
const MODAL_TOP_LEVEL_LIMIT = 5;

function serialize(value) {
  if (value && typeof value.toJSON === 'function') {
    return value.toJSON();
  }

  return value;
}

function countComponents(components) {
  let total = 0;

  function visit(component) {
    const json = serialize(component);
    if (!json) {
      return;
    }

    total += 1;

    if (Array.isArray(json.components)) {
      json.components.forEach(visit);
    }

    if (json.accessory) {
      visit(json.accessory);
    }

    if (Array.isArray(json.items)) {
      json.items.forEach(visit);
    }
  }

  components.forEach(visit);
  return total;
}

export function validateV2MessagePayload(payload, label = 'message payload') {
  if (payload.content != null) {
    throw new Error(`${label} must not use content when sending Components V2.`);
  }

  if (payload.embeds?.length) {
    throw new Error(`${label} must not use embeds when sending Components V2.`);
  }

  if ((payload.files?.length ?? 0) > MESSAGE_ATTACHMENT_LIMIT) {
    throw new Error(`${label} uses ${payload.files.length} attachments, but Discord only allows up to ${MESSAGE_ATTACHMENT_LIMIT}.`);
  }

  const totalComponents = countComponents(payload.components ?? []);
  if (totalComponents > MESSAGE_COMPONENT_LIMIT) {
    throw new Error(`${label} uses ${totalComponents} total components, but Discord only allows up to ${MESSAGE_COMPONENT_LIMIT}.`);
  }

  return payload;
}

export function validateModalPayload(modal, label = 'modal payload') {
  const json = serialize(modal);
  const topLevel = json.components?.length ?? 0;

  if (topLevel === 0) {
    throw new Error(`${label} must include at least one top-level component.`);
  }

  if (topLevel > MODAL_TOP_LEVEL_LIMIT) {
    throw new Error(`${label} uses ${topLevel} top-level components, but modals should stay within ${MODAL_TOP_LEVEL_LIMIT}.`);
  }

  return modal;
}

export function summarizeMessagePayload(payload) {
  return {
    attachments: payload.files?.length ?? 0,
    topLevelComponents: payload.components?.length ?? 0,
    totalComponents: countComponents(payload.components ?? []),
  };
}

export function summarizeModalPayload(modal) {
  const json = serialize(modal);
  return {
    topLevelComponents: json.components?.length ?? 0,
  };
}
