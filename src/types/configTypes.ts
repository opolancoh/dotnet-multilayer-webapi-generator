export type AppConfig = {
  solutionOutputDir: string;
  dotnetTestProjectTemplates: string[];
};

export type SolutionConfig = {
  name: string;
  targetFramework: string;
  projects: ProjectConfig[];
  staticFiles: StaticFileConfig[];
  docker: DockerConfig;
};

export type ProjectConfig = BaseProjectConfig & {
  framework?: string;
  fullName?: string;
  fileName?: string;
  dir: string;
  path?: string;
};

export type BaseProjectConfig = {
  name: string;
  template: string;
  baseDir: string;
  projectReferences: string[];
};

export type StaticFileConfig = {
  name: string;
  destination: string;
};

export type DockerConfig = {
  runtimeImage: string;
  sdkImage: string;
};
