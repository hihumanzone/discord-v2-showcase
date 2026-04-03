function stamp() {
  return new Date().toISOString();
}

function write(level, scope, message, error) {
  const prefix = `[${stamp()}] [${level}] [${scope}]`;
  if (error) {
    console.error(prefix, message, error);
    return;
  }

  console.log(prefix, message);
}

export const logger = Object.freeze({
  info(scope, message) {
    write('INFO', scope, message);
  },
  warn(scope, message) {
    write('WARN', scope, message);
  },
  error(scope, message, error) {
    write('ERROR', scope, message, error);
  },
});
