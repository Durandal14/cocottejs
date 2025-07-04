import {
	Instruction,
	ShellInstruction,
	SpawnInstruction,
	AddFileInstruction,
	ReplaceLinesInstruction,
	CreateFileInstruction,
	AddVitePluginInstruction,
	AddToLineInstruction,
	AddJsonPropertyInstruction,
	RemoveFilesInstruction,
} from '../types/instructions.js';
import { exec, ExecOptions } from 'child_process';
import { spawn, SpawnOptions } from 'child_process';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import AdmZip from 'adm-zip';

const SERVER_URL = 'https://cocottejs.com/';
// const SERVER_URL = 'http://localhost:5173/';

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
			case 'addJsonProperty':
				await this.addJsonProperty(instruction);
				break;
			case 'removeFiles':
				await this.removeFiles(instruction);
				break;
		}
	}

	private static async addJsonProperty(instruction: AddJsonPropertyInstruction): Promise<void> {
		const content = await fs.readFile(instruction.path, 'utf-8');
		const updatedContent = await this.handleJsonFile(content, instruction);
		await fs.writeFile(instruction.path, updatedContent);
	}

	private static async handleJsonFile(
		content: string,
		instruction: AddJsonPropertyInstruction
	): Promise<string> {
		try {
			// Remove comments before parsing
			const contentWithoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
			const jsonContent = JSON.parse(contentWithoutComments);

			// Update the property
			this.updateNestedProperty(jsonContent, instruction.property, JSON.parse(instruction.value));

			// Return formatted JSON
			return JSON.stringify(jsonContent, null, 2);
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Failed to parse JSON: ${error.message}`);
			}
			throw new Error('Failed to parse JSON: Unknown error');
		}
	}

	private static updateNestedProperty(
		obj: Record<string, any>,
		propertyPath: string,
		value: any
	): void {
		if (propertyPath.includes('.')) {
			const props = propertyPath.split('.');
			let current = obj;

			// Navigate to the nested property location
			for (let i = 0; i < props.length - 1; i++) {
				if (!current[props[i]]) {
					current[props[i]] = {};
				}
				current = current[props[i]];
			}

			// Set the final property value
			current[props[props.length - 1]] = value;
		} else {
			obj[propertyPath] = value;
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
			// ... existing code ...

			// Better command parsing to handle spaces in arguments
			let args: string[];
			if (typeof instruction.command === 'string') {
				// Handle quoted arguments properly
				args = instruction.command.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
				const command = args.shift();
				if (!command) {
					return reject(new Error('No command specified'));
				}

				const options: SpawnOptions = {
					cwd: instruction.cwd || '.',
					stdio: isDebug
						? ['inherit', 'inherit', 'inherit']
						: instruction.stdio
							? [instruction.stdio, instruction.stdio, instruction.stdio]
							: ['pipe', 'pipe', 'pipe'],
					shell: true, // Better cross-platform support
				};

				const childProcess = spawn(command, args, options);

				// Handle process errors
				childProcess.on('error', (error: any) => {
					reject(new Error(`Failed to start process: ${error.message}`));
				});

				childProcess.on('close', (code: number) => {
					if (code === 0) {
						resolve();
					} else {
						reject(new Error(`Process exited with code ${code}`));
					}
				});
			} else {
				reject(new Error('Invalid command format'));
			}
		});
	}

	private static async createFile(instruction: CreateFileInstruction): Promise<void> {
		// Get directory path from file path
		const dirPath = path.dirname(instruction.path);
		// Create directory and any parent directories if they don't exist
		await fs.mkdir(dirPath, { recursive: true });

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
				(match, plugins) => `plugins: [${plugins}, ${pluginConfig}]`
			);
			// remove ,, if it exists
			updatedContent = updatedContent.replace(/,,/, ',');
		} else {
			updatedContent += content.replace(/plugins:\s*\[/, `${plugins}: [${pluginConfig}, `);
		}

		await fs.writeFile(viteConfigPath, updatedContent);
	}

	private static async addFile(instruction: AddFileInstruction): Promise<void> {
		const remoteFile = instruction.remotePath.startsWith("http") ? instruction.remotePath : SERVER_URL + instruction.remotePath
		const response = await fetch(remoteFile);
		const content = await response.arrayBuffer();

		// Get directory path from file path
		const dirPath = path.dirname(instruction.path);

		// Create directory and any parent directories if they don't exist
		await fs.mkdir(dirPath, { recursive: true });

		// Check if the remote file is a ZIP file
		if (remoteFile.endsWith('.zip')) {
			// For ZIP files, instruction.path should be a directory (ending with '/')
			const extractPath = instruction.path.endsWith('/')
				? instruction.path
				: instruction.path + '/';

			// Create the extraction directory if it doesn't exist
			await fs.mkdir(extractPath, { recursive: true });

			// Extract the ZIP file
			const zip = new AdmZip(Buffer.from(content));
			zip.extractAllTo(extractPath, true);
		} else {
			// For regular files, write the content directly
			await fs.writeFile(instruction.path, Buffer.from(content));
		}
	}

	private static async removeFiles(instruction: RemoveFilesInstruction): Promise<void> {
		try {
			const stats = await fs.stat(instruction.path);
			if (stats.isDirectory()) {
				await fs.rm(instruction.path, { recursive: true, force: true });
			} else {
				await fs.unlink(instruction.path);
			}
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
				throw error;
			}
			// If the file or directory does not exist, ignore the command
		}
	}

	private static async replaceLines(instruction: ReplaceLinesInstruction): Promise<void> {
		const content = await fs.readFile(instruction.path, 'utf-8');

		let searchPattern: string | RegExp = instruction.contentFrom;

		// Handle different types of contentFrom
		if (typeof instruction.contentFrom === 'string') {
			// Check if the string looks like a regex pattern (starts with / and ends with /flags)
			// Be more strict: must start with / and end with / followed by optional flags
			const regexMatch = instruction.contentFrom.match(/^\/(.+)\/([gimuy]*)$/);
			if (regexMatch) {
				const [, pattern, flags] = regexMatch;
				try {
					searchPattern = new RegExp(pattern, flags);
				} catch (error) {
					// If regex creation fails, treat as literal string
					console.warn(`Invalid regex pattern "${pattern}", treating as literal string:`, error);
					searchPattern = instruction.contentFrom;
				}
			}
			// If it's a string but not a regex pattern, keep it as a string
			// No need to do anything, searchPattern is already set to instruction.contentFrom
		} else if (typeof instruction.contentFrom === 'object' && instruction.contentFrom !== null && !(instruction.contentFrom instanceof RegExp)) {
			// Handle RegExp that may have been serialized/deserialized
			const regexObj = instruction.contentFrom as any;
			if (regexObj.source || regexObj.pattern) {
				const source = regexObj.source || regexObj.pattern;
				const flags = regexObj.flags || (regexObj.global ? 'g' : '') + (regexObj.ignoreCase ? 'i' : '') + (regexObj.multiline ? 'm' : '');
				try {
					searchPattern = new RegExp(source, flags);
				} catch (error) {
					// If regex creation fails, treat as literal string
					console.warn(`Invalid regex pattern "${source}", treating as literal string:`, error);
					searchPattern = source;
				}
			}
		}

		try {
			const updatedContent = content.replaceAll(searchPattern, instruction.contentTo);
			await fs.writeFile(instruction.path, updatedContent);
		} catch (error) {
			// If replaceAll fails (e.g., with invalid regex), try with literal string replacement
			if (error instanceof TypeError && error.message.includes('Invalid regular expression')) {
				console.warn('replaceAll failed with regex, falling back to literal string replacement');
				const updatedContent = content.replaceAll(String(instruction.contentFrom), instruction.contentTo);
				await fs.writeFile(instruction.path, updatedContent);
			} else {
				throw error;
			}
		}
	}

	// Add a content in a specific number of line of a file
	private static async addToLine(instruction: AddToLineInstruction): Promise<void> {
		const line = instruction.line ? instruction.line - 1 : 0;
		let content = '';
		try {
			content = await fs.readFile(instruction.path, 'utf-8');
		} catch (error) {
			// Create directory if it doesn't exist
			const dirPath = path.dirname(instruction.path);
			await fs.mkdir(dirPath, { recursive: true });
			// Create empty file
			await fs.writeFile(instruction.path, '');
		}

		let newContent = '';
		// if line is negative, add to the end of the file
		if (line < 0) {
			newContent = `${content}\n${instruction.content}`;
		} else {
			const lines = content.split('\n');
			lines.splice(line, 0, instruction.content);
			newContent = lines.join('\n');
		}
		await fs.writeFile(instruction.path, newContent);
	}
}
