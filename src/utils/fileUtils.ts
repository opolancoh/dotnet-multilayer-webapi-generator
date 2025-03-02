import fs from 'fs/promises';
import path from 'path';
import { appConfig, solutionConfig } from '../config/configManager.js';
import { Logger, logTaskStart, logTaskEnd, logSuccess } from './logUtils.js';
import { generateDockerfile } from './dockerUtils.js';
import { ProjectConfig } from '../types/configTypes.js';

const logger = new Logger({ showTimestamp: false });

export interface StaticFile {
  name: string;
  destination: string;
}

export async function removeTemplateFiles(projects: ProjectConfig[]): Promise<void> {
  for (const project of projects) {
    logger.task(`Removing files for ${project.fullName}`, 1);

    const filesToRemove = [];

    if (project.template === 'classlib') {
      filesToRemove.push('Class1.cs');
    } else if (appConfig.dotnetTestProjectTemplates.includes(project.template)) {
      filesToRemove.push('UnitTest1.cs');
    }

    if (!filesToRemove.length) {
      logSuccess('No files to remove', 2);
      continue;
    }

    for (const file of filesToRemove) {
      const filePath = path.join(project.dir, file);
      logTaskStart(`${file}: Removing at ${filePath}`, 2);
      await fs.rm(filePath, { force: true });
      logTaskEnd(`${file}: Removed at ${filePath}`, 2);
    }
  }
}

export async function copyStaticFiles(sourceDir: string, destinationRootDir: string, files: StaticFile[], logLevel = 1): Promise<void> {
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file.name);
    const destinationDir = path.join(destinationRootDir, file.destination);
    const destinationPath = path.join(destinationDir, file.name);
    const destinationRelativePath = path.join(solutionConfig.name, file.destination === '.' ? '' : file.destination, file.name);

    logTaskStart(`Copying ${file.name} to ${destinationRelativePath}`, logLevel);

    await fs.mkdir(destinationDir, { recursive: true });

    const fileContent = await fs.readFile(sourcePath, 'utf8');

    await fs.writeFile(destinationPath, fileContent);

    logTaskEnd(`Copied ${file.name} to ${destinationRelativePath}`, logLevel);
  }
}

export async function addDynamicFiles(solutionDir: string): Promise<void> {
    await generateDockerfile(solutionDir, 1);
  }