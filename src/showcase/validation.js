const MESSAGE_ATTACHMENT_LIMIT = 10;
const MESSAGE_COMPONENT_LIMIT = 40;
const MODAL_TOP_LEVEL_LIMIT = 5;

const ComponentType = Object.freeze({
  ActionRow: 1,
  Button: 2,
  StringSelect: 3,
  TextInput: 4,
  UserSelect: 5,
  RoleSelect: 6,
  MentionableSelect: 7,
  ChannelSelect: 8,
  Section: 9,
  TextDisplay: 10,
  Thumbnail: 11,
  MediaGallery: 12,
  File: 13,
  Separator: 14,
  Container: 17,
  Label: 18,
  FileUpload: 19,
  RadioGroup: 21,
  CheckboxGroup: 22,
  Checkbox: 23,
});

const MESSAGE_SELECT_TYPES = new Set([
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect,
]);

const CONTAINER_CHILD_TYPES = new Set([
  ComponentType.ActionRow,
  ComponentType.TextDisplay,
  ComponentType.Section,
  ComponentType.MediaGallery,
  ComponentType.Separator,
  ComponentType.File,
]);

const LABEL_CHILD_TYPES = new Set([
  ComponentType.TextInput,
  ComponentType.StringSelect,
  ComponentType.UserSelect,
  ComponentType.RoleSelect,
  ComponentType.MentionableSelect,
  ComponentType.ChannelSelect,
  ComponentType.FileUpload,
  ComponentType.RadioGroup,
  ComponentType.CheckboxGroup,
  ComponentType.Checkbox,
]);

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

    if (json.component) {
      visit(json.component);
    }
  }

  components.forEach(visit);
  return total;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateCustomId(component, seenCustomIds, label) {
  if (typeof component.custom_id !== 'string') {
    return;
  }

  assert(component.custom_id.length >= 1 && component.custom_id.length <= 100, `${label} uses an invalid custom_id length.`);
  assert(!seenCustomIds.has(component.custom_id), `${label} reuses the custom_id ${component.custom_id}.`);
  seenCustomIds.add(component.custom_id);
}

function validateActionRow(component, label) {
  const children = component.components ?? [];
  assert(children.length >= 1 && children.length <= 5, `${label} has an action row with an invalid number of child components.`);

  const childTypes = new Set(children.map((child) => child.type));
  const hasButtons = childTypes.has(ComponentType.Button);
  const hasSelects = [...childTypes].some((type) => MESSAGE_SELECT_TYPES.has(type));

  assert(!(hasButtons && hasSelects), `${label} mixes buttons and select menus in the same action row.`);

  if (hasButtons) {
    assert([...childTypes].every((type) => type === ComponentType.Button), `${label} has a non-button component in a button action row.`);
  }

  if (hasSelects) {
    assert(children.length === 1, `${label} has more than one select menu in a single action row.`);
    assert(MESSAGE_SELECT_TYPES.has(children[0].type), `${label} uses an unsupported select in an action row.`);
  }
}

function validateSection(component, label) {
  const children = component.components ?? [];
  assert(children.length >= 1 && children.length <= 3, `${label} has a section with an invalid number of text display children.`);
  assert(children.every((child) => child.type === ComponentType.TextDisplay), `${label} has a section with a non-Text Display child.`);
  assert(component.accessory, `${label} has a section without an accessory.`);
  assert(
    component.accessory.type === ComponentType.Button || component.accessory.type === ComponentType.Thumbnail,
    `${label} has a section with an unsupported accessory type.`,
  );
}

function validateContainer(component, label) {
  const children = component.components ?? [];
  assert(children.length >= 1, `${label} has an empty container.`);
  assert(children.every((child) => CONTAINER_CHILD_TYPES.has(child.type)), `${label} has a container with an unsupported child component.`);
}

function validateLabel(component, label) {
  assert(component.component, `${label} has a label without a child component.`);
  assert(LABEL_CHILD_TYPES.has(component.component.type), `${label} has a label with an unsupported child component.`);
}

function validateComponentTree(component, seenCustomIds, label) {
  const json = serialize(component);
  if (!json) {
    return;
  }

  validateCustomId(json, seenCustomIds, label);

  switch (json.type) {
    case ComponentType.ActionRow:
      validateActionRow(json, label);
      break;
    case ComponentType.Section:
      validateSection(json, label);
      break;
    case ComponentType.Container:
      validateContainer(json, label);
      break;
    case ComponentType.Label:
      validateLabel(json, label);
      break;
    default:
      break;
  }

  if (Array.isArray(json.components)) {
    json.components.forEach((child) => validateComponentTree(child, seenCustomIds, label));
  }

  if (json.accessory) {
    validateComponentTree(json.accessory, seenCustomIds, label);
  }

  if (Array.isArray(json.items)) {
    json.items.forEach((item) => validateComponentTree(item, seenCustomIds, label));
  }

  if (json.component) {
    validateComponentTree(json.component, seenCustomIds, label);
  }
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

  const seenCustomIds = new Set();
  (payload.components ?? []).forEach((component) => validateComponentTree(component, seenCustomIds, label));

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

  const seenCustomIds = new Set();
  for (const component of json.components ?? []) {
    const entry = serialize(component);
    assert(
      entry.type === ComponentType.TextDisplay || entry.type === ComponentType.Label,
      `${label} uses an unsupported top-level modal component type.`,
    );
    validateComponentTree(entry, seenCustomIds, label);
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
    totalComponents: countComponents(json.components ?? []),
  };
}
