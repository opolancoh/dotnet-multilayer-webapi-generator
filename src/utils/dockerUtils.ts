import fs from 'fs/promises';
import path from 'path';
import { logTaskStart, logTaskEnd } from './logUtils.js';
import { appConfig, solutionConfig } from '../config/configManager.js';

export async function generateDockerfile(solutionDir: string, logLevel: number): Promise<void> {
  const filePath = path.join(solutionConfig.name, 'Dockerfile');

  logTaskStart(`Dockerfile: Creating at ${filePath}`, logLevel);

  const projectsToCopy = solutionConfig.projects.filter((x) => !appConfig.dotnetTestProjectTemplates.includes(x.template));

  // Find the API project (or the last project if no API is found)
  const apiProject = projectsToCopy.find((p) => p.template === 'webapi');

  if (!apiProject) {
    throw new Error('No suitable project found for Docker entrypoint');
  }

  // Generate the Dockerfile content

const dockerfileContent = `
# Stage 1: Build
FROM ${solutionConfig.docker.sdkImage} AS build
WORKDIR /app

# Copy project files individually to leverage Docker caching
${projectsToCopy.map((project) => `COPY ["${project.path}", "${project.dir}/"]`).join("\n")}

# Restore packages
RUN dotnet restore "${apiProject.path}"

# Copy the entire source code
COPY . ./

# Build and publish the application
RUN dotnet publish "${apiProject.path}" -c Release -o out --no-restore

# Stage 2: Runtime
# Use a lightweight runtime image to run the application (reduces final image size)
FROM ${solutionConfig.docker.runtimeImage} AS runtime
WORKDIR /app

# Copy the published application from the build stage
COPY --from=build /app/out ./

# Run the application
ENTRYPOINT ["dotnet", "${apiProject.fullName}.dll"]
`;

  try {
    // Write the Dockerfile
    const dockerfilePath = path.join(solutionDir, 'Dockerfile');
    await fs.writeFile(dockerfilePath, dockerfileContent);
    logTaskEnd(`Dockerfile: Created at ${filePath}`, logLevel);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate Dockerfile: ${errorMessage}`);
  }
}
