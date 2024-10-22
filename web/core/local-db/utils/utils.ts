export const log = (...args: any) => {
  if ((window as any).DEBUG) {
    console.log(...args);
  }
};
export const logError = (e: any) => {
  if (e?.result?.errorClass === "SQLite3Error") {
    e = parseSQLite3Error(e);
  }
  // Sentry.captureException(e);
  console.log(e);
};

const parseSQLite3Error = (error: any) => {
  error.result = JSON.stringify(error.result);
  return error;
};

export const logInfo = console.info;
