import type { FrameworkConfig } from './';

export type InstructionType =
  | 'shell'
  | 'spawn'
  | 'updateFile'
  | 'createFile'
  | 'addFile'
  | 'addImport'
  | 'addInHeadHtml'
  | 'replaceLines'
  | 'addVitePlugin'
  | 'addToEnd';

export interface BaseInstruction {
  type: InstructionType;
  name: string;
}

export interface ReplaceLinesInstruction extends BaseInstruction {
  type: 'replaceLines';
  path: string;
  contentFrom: string;
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
}

export interface AddFileInstruction extends BaseInstruction {
  type: 'addFile';
  path: string;
  remotePath: string;
}

export interface AddImportInstruction extends BaseInstruction {
  type: 'addImport';
  path: string;
  content: string;
  second?: boolean;
}

export interface AddInHeadHtmlInstruction extends BaseInstruction {
  type: 'addInHeadHtml';
  path: string;
  content: string;
}

export interface AddToEndInstruction extends BaseInstruction {
  type: 'addToEnd';
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
  | AddInHeadHtmlInstruction
  | AddFileInstruction
  | AddToEndInstruction
  | ReplaceLinesInstruction;

export interface InstructionSet {
  config: FrameworkConfig;
  instructions: Instruction[];
}
