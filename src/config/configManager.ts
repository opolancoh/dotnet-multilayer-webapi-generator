import path from 'path';
import { AppConfig, SolutionConfig } from '../types/configTypes.js';
import appConfigData from './app.config.json' assert { type: 'json' };
import solutionConfigData from './solution.config.json' assert { type: 'json' };

// Helper function to recursively freeze an object
function deepFreeze<T>(obj: T): T {
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

// Load and freeze AppConfig
function loadAppConfig(): Readonly<AppConfig> {
  return deepFreeze(appConfigData);
}

// Load and freeze SolutionConfig
function loadSolutionConfig(): Readonly<SolutionConfig> {
  const transformedConfig = {
    ...solutionConfigData,
    projects: solutionConfigData.projects.map((project) => {
      const fullName = `${solutionConfigData.name}.${project.name}`;
      const fileName = `${fullName}.csproj`;

      return {
        ...project,
        framework: solutionConfigData.targetFramework,
        fullName,
        fileName,
        dir: path.join(project.baseDir, fullName),
        path: path.join(project.baseDir, fullName, fileName),
      };
    }),
  };

  return deepFreeze(transformedConfig);
}

export const appConfig = loadAppConfig();

export const solutionConfig = loadSolutionConfig();
