import type { FrameworkConfig } from './';

export type InstructionType =
    | 'shell'
    | 'spawn'
    | 'updateFile'
    | 'createFile'
    | 'addImport'
    | 'addInHeadHtml'
    | 'addVitePlugin';

export interface BaseInstruction {
    type: InstructionType;
    name: string;
    order: number;
}

export interface AddVitePluginInstruction extends BaseInstruction {
    type: 'addVitePlugin';
    path: string;
    content: string;
}

export interface ShellInstruction extends BaseInstruction {
    type: 'shell';
    command: string;
    cwd?: string;
}

export interface SpawnInstruction extends BaseInstruction {
    type: 'spawn';
    command: string;
    options?: {
        cwd?: string;
        stdio?: 'inherit' | 'pipe' | 'ignore';
    };
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
    remoteUrl?: string;
}

export interface AddImportInstruction extends BaseInstruction {
    type: 'addImport';
    file: string;
    content: string;
}

export interface AddInHeadHtmlInstruction extends BaseInstruction {
    type: 'addInHeadHtml';
    path: string;
    content: string;
}

export type Instruction =
    | ShellInstruction
    | SpawnInstruction
    | UpdateFileInstruction
    | CreateFileInstruction
    | AddImportInstruction
    | AddVitePluginInstruction
    | AddInHeadHtmlInstruction;

export interface InstructionSet {
    config: FrameworkConfig;
    instructions: Instruction[];
}

