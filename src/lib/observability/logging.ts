type LogLevel = "info" | "warn" | "error";

type SafeLogFields = Record<
  string,
  string | number | boolean | null | undefined | Array<string | number | boolean>
>;

const redact = (fields: SafeLogFields = {}) =>
  Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );

export function logEvent(level: LogLevel, event: string, fields?: SafeLogFields) {
  const entry = {
    event,
    ...redact(fields),
  };

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}
