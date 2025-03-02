#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { Logger, logTaskStart, logTaskEnd, logSuccess } from './utils/logUtils.js';
import { runCommand } from './utils/commandUtils.js';
import { removeTemplateFiles, copyStaticFiles, addDynamicFiles } from './utils/fileUtils.js';
import { appConfig, solutionConfig } from './config/configManager.js';
import { ProjectConfig, SolutionConfig } from './types/configTypes.js';

const appDir = process.cwd();

const logger = new Logger({ showTimestamp: false });

async function createSolution(): Promise<void> {
  const { name: solutionName, projects } = solutionConfig;
  const solutionDir = path.join(appConfig.solutionOutputDir, solutionName);

  try {
    displayConfig(solutionConfig);

    logger.action(`Create solution folder`);
    logTaskStart(`Creating folder: ${solutionName}...`, 1);
    await fs.mkdir(solutionDir, { recursive: true });
    logTaskEnd(`Successfully created folder: ${solutionName}`, 1);
    process.chdir(solutionDir);

    logger.action(`Create solution file '${solutionName}.sln'`);
    await runCommand(`dotnet new sln -n ${solutionName}`, 1);

    logger.action('Create projects');
    for (const project of projects) {
      await runCommand(`dotnet new ${project.template} -f ${project.framework} -n ${project.fullName} -o ${project.dir}`, 1);
    }

    logger.action('Remove unnecessary auto-generated template files from projects');
    await removeTemplateFiles(projects);

    logger.action('Add project references');
    await addProjectReferences(projects);

    logger.action('Add projects to solution');
    for (const project of projects) {
      await runCommand(`dotnet sln add ${project.path}`, 1);
    }

    // Add static files to solution
    logger.action('Copy static files');
    const staticFilesDir = path.join(appDir, 'resources', 'static-files');
    await copyStaticFiles(staticFilesDir, solutionDir, solutionConfig.staticFiles);

    // Add dynamic files to solution
    logger.action('Generate dynamic files');
    await addDynamicFiles(solutionDir);

    logger.success(`Solution structure created successfully!`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to create solution: ${errorMessage}`);
    process.exit(1);
  }
}

function displayConfig(config: SolutionConfig): void {
  const { name: solutionName, targetFramework, projects } = config;

  console.log('Configuration:');
  console.log(`  • Solution Name:     ${solutionName}`);
  console.log(`  • Target Framework:  ${targetFramework}`);
  console.log(`  • Projects:          ${projects.length}`);
  console.log('\nProjects to create:');

  projects.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
    console.log(`     Template:   ${p.template}`);
    console.log(`     Path:       ${p.path}`);
    console.log(`     References: ${p.projectReferences.length ? p.projectReferences.join(', ') : 'None'}`);
    if (i < projects.length - 1) console.log('');
  });
}

async function addProjectReferences(projects: ProjectConfig[]): Promise<void> {
  for (const project of projects) {
    logger.task(`Setting up references for ${project.fullName}`, 1);

    if (!project.projectReferences.length) {
      logSuccess('No references to set up', 2);
      continue;
    }

    for (const projectReferenceName of project.projectReferences) {
      const refProject = projects.find((p) => p.name === projectReferenceName);
      if (!refProject) throw new Error(`Reference ${projectReferenceName} not found`);

      await runCommand(`dotnet add ${project.path} reference ${refProject.path}`, 2);
    }
  }
}

createSolution();
