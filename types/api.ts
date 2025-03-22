import { FrameworkConfig } from './index.js';
import { Instruction } from './instructions.js';

export interface APIResponse {
	instructions: Instruction[];
	config: FrameworkConfig;
}
