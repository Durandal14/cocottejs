import { Instruction, ShellInstruction, SpawnInstruction, CreateFileInstruction, AddImportInstruction, AddVitePluginInstruction } from '../types/instructions.js';
import { exec } from 'child_process';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';

export class InstructionExecutor {
    static async execute(instruction: Instruction): Promise<void> {
        switch (instruction.type) {
            case 'shell':
                await this.executeShell(instruction);
                break;
            case 'spawn':
                await this.executeSpawn(instruction);
                break;
            // case 'updateFile':
            case 'createFile':
                await this.createFile(instruction);
                break;
            case 'addImport':
                await this.addImport(instruction);
                break;
            case 'addVitePlugin':
                await this.addVitePlugin(instruction);
                break;
        }
    }

    private static executeShell(instruction: ShellInstruction): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(instruction.command, { cwd: instruction.cwd || "." }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    private static executeSpawn(instruction: SpawnInstruction): Promise<void> {
        return new Promise((resolve, reject) => {
            const [command, ...args] = instruction.command.split(' ');
            const process = spawn(command, args, {
                ...instruction.options,
                cwd: instruction.options?.cwd || ".",
                stdio: instruction.options?.stdio || 'inherit'
            });

            process.on('close', (code: number) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Process exited with code ${code}`));
                }
            });
        });
    }

    private static async createFile(instruction: CreateFileInstruction): Promise<void> {
        // const response = await fetch(instruction.remotePath);
        // const content = await response.text();
        const content = instruction.content;
        await fs.writeFile(instruction.path, content);
    }

    private static async addImport(instruction: AddImportInstruction): Promise<void> {
        const content = await fs.readFile(instruction.file, 'utf-8');
        const newContent = `${instruction.content}\n${content}`;
        await fs.writeFile(instruction.file, newContent);
    }

    private static async addVitePlugin(instruction: AddVitePluginInstruction): Promise<void> {
        // Implementation depends on your Vite configuration structure
        const viteConfigPath = instruction.path;
        const content = await fs.readFile(viteConfigPath, 'utf-8');
        const pluginConfig = `\n    ${instruction.content},`;

        // Add plugin to plugins array
        const updatedContent = content.replace(
            /plugins:\s*\[/,
            `plugins: [${pluginConfig}`
        );
        await fs.writeFile(viteConfigPath, updatedContent);
    }
} 