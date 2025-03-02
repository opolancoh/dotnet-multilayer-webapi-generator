import { exec, ExecOptions } from 'child_process';
import util from 'util';
import { logCommandStart, logCommandEnd } from './logUtils.js';

interface CommandResult {
  stdout: string;
  stderr: string;
  code: number | null;
}

const execPromise = util.promisify(exec);

export async function runCommand(command: string, logLevel = 0, options: ExecOptions = {}): Promise<CommandResult> {
  try {
    logCommandStart(command, logLevel);

    const mergedOptions = {
      ...options,
      env: { ...process.env, ...(options.env || {}) },
    };

    const { stdout, stderr } = await execPromise(command, mergedOptions);

    logCommandEnd(command, logLevel);

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      code: 0,
    };
  } catch (error) {
    // Handle exec errors (non-zero exit codes)
    const execError = error as { code: number; stdout: string; stderr: string };

    logCommandEnd(`${command} (failed with code ${execError.code})`, logLevel);

    return {
      stdout: execError.stdout?.trim() || '',
      stderr: execError.stderr?.trim() || '',
      code: execError.code,
    };
  }
}
