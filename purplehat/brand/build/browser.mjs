// Shared headless-Chromium helper (playwright-core). Override paths with PW_CORE / CHROME env vars.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const PW = process.env.PW_CORE || '/home/user/lemomo-ai/lemo-opuscar/node_modules/playwright-core/index.mjs';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const { chromium } = await import(PW);
export async function launch() {
  return chromium.launch({ executablePath: CHROME, args: ['--allow-file-access-from-files', '--font-render-hinting=none', '--disable-lcd-text'] });
}
export const fileUrl = (p) => pathToFileURL(path.resolve(p)).href;
