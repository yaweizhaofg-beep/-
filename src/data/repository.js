import { MockRepository } from './mock-repository.js';
import { HttpRepository } from './http-repository.js';
const config = globalThis.STUDIO_CONFIG || {};
export const mode = config.mode === 'http' ? 'http' : 'mock';
export const repository = mode === 'http' ? new HttpRepository(config.apiBase) : new MockRepository();
