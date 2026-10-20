import { resolve } from 'path';

// The built frontend sits next to the backend in the repository and in the container image.
export const STATIC_ROOT = resolve(__dirname, '..', '..', 'frontend', 'dist');

export let staticRoot: string = STATIC_ROOT;

// Test seam: lets the e2e tests point the server at a temporary directory.
export function setStaticRootForTests(absolutePath: string): void {
  if (process.env.NODE_ENV !== 'test') throw new Error('setStaticRootForTests is for tests only');
  staticRoot = absolutePath;
}
