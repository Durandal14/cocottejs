import type { FrameworkConfig } from './';

export type InstructionType =
	| 'shell'
	| 'spawn'
	| 'updateFile'
	| 'createFile'
	| 'addFile'
	| 'addInHeadHtml'
	| 'replaceLines'
	| 'addVitePlugin'
	| 'addToLine'
	| 'addJsonProperty'
	| 'removeFiles';

export interface BaseInstruction {
	type: InstructionType;
	name: string;
}

export interface ReplaceLinesInstruction extends BaseInstruction {
	type: 'replaceLines';
	path: string;
	contentFrom: RegExp | string;
	contentTo: string;
}

export interface AddVitePluginInstruction extends BaseInstruction {
	type: 'addVitePlugin';
	path: string;
	content: string;
	importName: string;
	end?: boolean;
	astro?: boolean;
}

export interface ShellInstruction extends BaseInstruction {
	type: 'shell';
	command: string;
	cwd?: string;
}

export interface SpawnInstruction extends BaseInstruction {
	type: 'spawn';
	command: string;
	cwd?: string;
	stdio?: 'inherit' | 'pipe' | 'ignore';
}

export interface UpdateFileInstruction extends BaseInstruction {
	type: 'updateFile';
	path: string;
	content: string;
	mode?: 'append' | 'replace' | 'prepend';
}

export interface CreateFileInstruction extends BaseInstruction {
	type: 'createFile';
	path: string;
	content: string;
}

export interface AddFileInstruction extends BaseInstruction {
	type: 'addFile';
	path: string;
	remotePath: string;
}

export interface AddInHeadHtmlInstruction extends BaseInstruction {
	type: 'addInHeadHtml';
	path: string;
	content: string;
}

export interface AddToLineInstruction extends BaseInstruction {
	type: 'addToLine';
	path: string;
	content: string;
	line?: number;
}

export interface AddJsonPropertyInstruction extends BaseInstruction {
	type: 'addJsonProperty';
	path: string;
	property: string;
	value: string;
}

export interface RemoveFilesInstruction extends BaseInstruction {
	type: 'removeFiles';
	path: string;
}

export type Instruction =
	| ShellInstruction
	| SpawnInstruction
	| UpdateFileInstruction
	| CreateFileInstruction
	| AddVitePluginInstruction
	| AddInHeadHtmlInstruction
	| AddFileInstruction
	| AddToLineInstruction
	| ReplaceLinesInstruction
	| AddJsonPropertyInstruction
	| RemoveFilesInstruction;

export interface InstructionSet {
	config: FrameworkConfig;
	instructions: Instruction[];
}
