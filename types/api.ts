import { FrameworkConfig } from './index.js';
import { Instruction } from './instructions.js';

export interface APIResponse {
	instructions: Instruction[];
	config: FrameworkConfig;
}

export const SERVER_URL = 'https://cocottejs.com/';
// export const SERVER_URL = 'http://localhost:5173/';