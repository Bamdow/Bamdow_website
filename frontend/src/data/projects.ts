// Define a shared data structure to ensure media links are always synced
import { DEV_DATA } from './dev';
import { PHOTOGRAPHY_PROJECTS } from './photography_projects';

export const PROJECT_DATA = [
  ...PHOTOGRAPHY_PROJECTS,
  ...DEV_DATA
];
