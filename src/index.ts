import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import { compressAndEncode } from './utils';
import { TriggerOptions } from './types';

export async function triggerWorkflow(options: TriggerOptions, data: object): Promise<string> {
  const execAsync = promisify(exec);

  // 1. Determine file path: use custom path if provided, otherwise generate a temporary one.
  const filePath = options.filePath ?? path.join(os.tmpdir(), 'automa-trigger', `${crypto.randomUUID()}.json`);
  
  // Create directory and write file
  // Note: fs.mkdir with recursive:true is safe to call even if the directory exists.
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data));

  // 2. Compress path and build URL
  const compressedPath = compressAndEncode(filePath);
  const searchParams = new URLSearchParams({
    filePath: compressedPath,
    websiteName: options.websiteName,
    extensionId: options.extensionId,
    workflowId: options.workflowId,
  });
  const url = `${options.triggerUrl}?${searchParams.toString()}`;

  // 3. Determine AHK script path robustly
  const ahkScriptPath = path.resolve(__dirname, 'openMinimized.ahk');

  // 4. Execute command
  let browserExe;
  if (options.browser === 'chrome') {
    browserExe = 'chrome.exe';
  } else if (options.browser === 'edge') {
    browserExe = 'msedge.exe';
  } else {
    throw new Error(`Unsupported browser: ${options.browser}`);
  }

  const command = `"${ahkScriptPath}" "${browserExe}" "--new-window" "${url}"`;
  
  await execAsync(command);

  // 5. Return the path of the file that was used
  return filePath;
}