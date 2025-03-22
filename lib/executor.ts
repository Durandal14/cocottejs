import {
	Instruction,
	ShellInstruction,
	SpawnInstruction,
	AddFileInstruction,
	ReplaceLinesInstruction,
	CreateFileInstruction,
	AddVitePluginInstruction,
	AddToLineInstruction,
} from '../types/instructions.js';
import { exec, ExecOptions } from 'child_process';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

export class InstructionExecutor {
	static async execute(instruction: Instruction, isDebug: boolean = false): Promise<void> {
		switch (instruction.type) {
			case 'shell':
				await this.executeShell(instruction, isDebug);
				break;
			case 'spawn':
				await this.executeSpawn(instruction, isDebug);
				break;
			case 'createFile':
				await this.createFile(instruction);
				break;
			case 'addToLine':
				await this.addToLine(instruction);
				break;
			case 'addVitePlugin':
				await this.addVitePlugin(instruction);
				break;
			case 'addFile':
				await this.addFile(instruction);
				break;
			case 'replaceLines':
				await this.replaceLines(instruction);
				break;
		}
	}

	private static executeShell(instruction: ShellInstruction, isDebug: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			const options: ExecOptions = {
				cwd: instruction.cwd || '.',
				...(isDebug ? { stdio: 'inherit' } : {}),
			};
			exec(instruction.command, options, (error: Error | null, stdout: string, stderr: string) => {
				if (error) {
					reject(error);
					return;
				}
				resolve();
			});
		});
	}

	private static executeSpawn(instruction: SpawnInstruction, isDebug: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			const [command, ...args] = instruction.command.split(' ');
			const options = {
				cwd: instruction.cwd || '.',
				stdio: isDebug ? 'inherit' : instruction.stdio || 'pipe',
			};

			const process = spawn(command, args, options);

			process.on('close', code => {
				if (code === 0) {
					resolve();
				} else {
					reject(new Error(`Process exited with code ${code}`));
				}
			});
		});
	}

	private static async createFile(instruction: CreateFileInstruction): Promise<void> {
		await fs.writeFile(instruction.path, instruction.content);
	}

	private static async addVitePlugin(instruction: AddVitePluginInstruction): Promise<void> {
		const viteConfigPath = instruction.path || 'vite.config.ts';
		let content = '';
		try {
			content = await fs.readFile(viteConfigPath, 'utf-8');
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				content =
					"import { defineConfig } from 'vite';\nexport default defineConfig({\n\tplugins: [],\n})";
				await fs.writeFile(viteConfigPath, content);
			} else {
				throw error;
			}
		}
		const pluginImport = `${instruction.importName}\n`;
		const pluginConfig = `${instruction.content}`;

		let updatedContent = '';
		if (!content.includes(pluginImport)) {
			updatedContent = pluginImport;
		}

		// Add plugin to plugins array
		const plugins = instruction.astro ? 'integrations' : 'plugins';
		if (instruction.end) {
			updatedContent += content.replace(
				/plugins:\s*\[([\s\S]*?)\]/,
				(match, plugins) => `plugins: [${plugins},${pluginConfig}]`
			);
			// remove ,, if it exists
			updatedContent = updatedContent.replace(/,,/, ',');
		} else {
			updatedContent += content.replace(/plugins:\s*\[/, `plugins: [${pluginConfig},`);
		}

		await fs.writeFile(viteConfigPath, updatedContent);
	}

	private static async addFile(instruction: AddFileInstruction): Promise<void> {
		const server = 'http://localhost:5173/files/';
		const response = await fetch(server + instruction.remotePath);
		const content = await response.text();
		await fs.writeFile(instruction.path, content);
	}

	private static async replaceLines(instruction: ReplaceLinesInstruction): Promise<void> {
		const content = await fs.readFile(instruction.path, 'utf-8');
		const updatedContent = content.replace(instruction.contentFrom, instruction.contentTo);
		await fs.writeFile(instruction.path, updatedContent);
	}

	// Add a content in a specific number of line of a file
	private static async addToLine(instruction: AddToLineInstruction): Promise<void> {
		const line = instruction.line ? instruction.line - 1 : 0;
		const content = await fs.readFile(instruction.path, 'utf-8');
		let newContent = '';
		// if line is negative, add to the end of the file
		if (line < 0) {
			newContent = `${content}\n${instruction.content}`;
		} else {
			const lines = content.split('\n');
			lines.splice(line, 0, instruction.content);
			newContent = lines.join('\n');
			await fs.writeFile(instruction.path, newContent);
		}
	}
}
