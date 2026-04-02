function format(scope, message) {
  return `[${scope}] ${message}`;
}

export const logger = Object.freeze({
  info(scope, message) {
    console.log(format(scope, message));
  },
  warn(scope, message) {
    console.warn(format(scope, message));
  },
  error(scope, message, error) {
    console.error(format(scope, message));
    if (error) {
      console.error(error);
    }
  },
});
