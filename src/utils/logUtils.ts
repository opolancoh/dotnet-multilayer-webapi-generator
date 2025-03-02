import chalk from 'chalk';

export interface LogOptions {
  showTimestamp?: boolean;
}

export class Logger {
  private options: LogOptions;

  constructor(options: LogOptions = {}) {
    this.options = {
      showTimestamp: options.showTimestamp || false,
    };
  }

  public configure(options: Partial<LogOptions>): void {
    this.options = { ...this.options, ...options };
  }

  private getTimestamp(): string {
    if (!this.options.showTimestamp) return '';

    const now = new Date();
    return `[${now.toISOString()}] `;
  }

  private logMessage(
    prefix: string,
    message: string,
    level: number = 0,
    newline: boolean = false,
  ): void {
    const timestamp = this.getTimestamp();

    console.log(`${newline ? '\n' : ''}${'  '.repeat(level)}${prefix} ${timestamp}${message}`);
  }

  public success(message: string, level: number = 0): void {
    const prefix = chalk.green.bold('[SUCCESS]');
    this.logMessage(prefix, message, level, true);
  }

  public error(message: string, level: number = 0, error?: Error): void {
    const timestamp = this.getTimestamp();
    const prefix = chalk.red.bold('❌ [ERROR]');

    console.error(`${'  '.repeat(level)}${prefix} ${timestamp}${message}`);

    if (error?.stack) {
      console.error(`${'  '.repeat(level + 1)}${chalk.red(error.stack)}`);
    }
  }

  public action(message: string, level: number = 0): void {
    const prefix = chalk.yellow.bold('[ACTION]');
    this.logMessage(prefix, message, level, true);
  }

  public task(message: string, level: number = 0): void {
    const prefix = chalk.cyan('[TASK]');
    this.logMessage(prefix, message, level);
  }
}

export function logCommandStart(command: string, level: number = 0) {
  return process.stdout.write(
    `${'  '.repeat(level)}  ${chalk.dim('EXEC:')} $ ${chalk.cyan(command)}`,
  );
}

export function logCommandEnd(command: string, level: number = 0) {
  return process.stdout.write(
    `\r${'  '.repeat(level)}${chalk.green('✓')} ${chalk.dim('EXEC:')} $ ${chalk.cyan(command)} \n`,
  );
}

export function logTaskStart(message: string, level: number = 0) {
  return process.stdout.write(`${'  '.repeat(level)}  ${message}`);
}

export function logTaskEnd(message: string, level: number = 0) {
  return process.stdout.write(`\r${'  '.repeat(level)}${chalk.green('✓')} ${message} \n`);
}

export function logSuccess(message: string, level: number = 0) {
  return process.stdout.write(`${'  '.repeat(level)}${chalk.green('✓')} ${message} \n`);
}
