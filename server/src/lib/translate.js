import { v2 } from "@google-cloud/translate";

function isConfigured() {
  return Boolean(process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

export function ensureTranslateConfigured() {
  if (!isConfigured()) {
    const err = new Error("TRANSLATE_NOT_CONFIGURED");
    err.code = "TRANSLATE_NOT_CONFIGURED";
    throw err;
  }
}

export async function translateText({ text, target, source }) {
  ensureTranslateConfigured();

  const { Translate } = v2;
  const translate = new Translate({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  const [translated] = await translate.translate(text, { to: target, from: source || undefined });
  return translated;
}

