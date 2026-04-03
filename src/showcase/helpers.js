export function cloneDefault(value) {
  return JSON.parse(JSON.stringify(value));
}

export function labelForOption(options, value, fallback = value) {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

export function labelsForValues(options, values) {
  if (!values?.length) {
    return [];
  }

  return values.map((value) => labelForOption(options, value, value));
}

export function collectionValues(collection, formatter) {
  if (!collection) {
    return [];
  }

  return Array.from(collection.values()).map(formatter);
}

export function userDisplay(user) {
  return user.globalName ?? user.displayName ?? user.username;
}

export function mentionableNamesFromInteraction(interaction) {
  const roles = interaction.roles ? collectionValues(interaction.roles, (role) => `@${role.name}`) : [];
  const users = interaction.users ? collectionValues(interaction.users, userDisplay) : [];
  return [...roles, ...users];
}


export function formatList(items, fallback = 'None selected') {
  if (!items || items.length === 0) {
    return fallback;
  }

  return items.join(', ');
}

function candidateFieldEntries(fields) {
  const entries = [];

  if (Array.isArray(fields?.components)) {
    entries.push(...fields.components);
  }

  if (fields?.fields?.size) {
    entries.push(...fields.fields.values());
  }

  if (Array.isArray(fields)) {
    entries.push(...fields);
  }

  return entries;
}

export function findModalFieldComponent(fields, customId) {
  for (const entry of candidateFieldEntries(fields)) {
    const component = entry?.component ?? entry;
    const entryCustomId = component?.customId ?? component?.custom_id;

    if (entryCustomId === customId) {
      return component;
    }
  }

  return null;
}

export function getModalFieldValues(fields, customId) {
  const component = findModalFieldComponent(fields, customId);
  return component?.values ?? [];
}

export function getModalFieldValue(fields, customId) {
  const component = findModalFieldComponent(fields, customId);
  return component?.value ?? null;
}
