export function cloneDefault(value) {
  return JSON.parse(JSON.stringify(value));
}

export function labelForOption(options, value, fallback = value) {
  return options.find((option) => option.value === value)?.label ?? fallback;
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

export function mentionableNamesFromResolved(mentionables) {
  if (!mentionables) {
    return [];
  }

  const roles = mentionables.roles ? Array.from(mentionables.roles.values()).map((role) => `@${role.name}`) : [];
  const users = mentionables.users ? Array.from(mentionables.users.values()).map(userDisplay) : [];
  return [...roles, ...users];
}

export function formatList(items, fallback = 'None selected') {
  if (!items || items.length === 0) {
    return fallback;
  }

  return items.join(', ');
}
