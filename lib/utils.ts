import { spawn } from "child_process";
import { SpawnOptions } from "../types/index";
import ora from 'ora';

const DEBUG = false;

export const SPECIAL_KEYS = {
    ENTER: "\r",
    ARROW_UP: "\u001B[A",
    SPACE: "\x20",
    ARROW_DOWN: "\u001B[B",
    ARROW_RIGHT: "\u001B[C",
    Y: "y",
} as const;

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function typeEnter(): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, 500);
        process.stdin.write(SPECIAL_KEYS.ENTER);
    });
}

export function spawnWithPrompts(
    cmd: string,
    cmdParts: string[],
    projectName: string,
    framework: string,
    options: SpawnOptions = {}
): Promise<void> {
    console.log(cmd, cmdParts, projectName, framework);
    return new Promise((resolve, reject) => {
        const spinner = ora({
            text: `Setting up ${framework} project: ${projectName}`,
            color: 'cyan'
        }).start();

        const childProcess = spawn(cmd, cmdParts, {
            stdio: DEBUG ? ["inherit", "inherit", "inherit"] : ["pipe", "pipe", "pipe"],
            ...options,
        });

        let buffer = "";

        childProcess.stdout?.on("data", (data) => {
            const output = data.toString();
            buffer += output;

            if (DEBUG) {
                spinner.text = output.trim();
            }

            if (
                output.includes("(y)") ||
                output.includes("(Y)") ||
                output.includes("[y/n]") ||
                output.includes("[Y/n]") ||
                output.includes("(yes)") ||
                output.includes("(Yes)")
            ) {
                childProcess.stdin?.write("y\n");
                spinner.text = 'Automatically answered "y" to a prompt';
            }
        });

        childProcess.stderr?.on("data", (data) => {
            const error = data.toString();
            if (error.includes("Error") || error.includes("error:")) {
                spinner.fail(`Error: ${error}`);
            }
        });

        childProcess.on("close", (code) => {
            if (code === 0) {
                spinner.succeed(`${framework} project "${projectName}" created successfully!`);
                resolve();
            } else {
                spinner.fail(`Process exited with code ${code}`);
                if (buffer.includes("Error")) {
                    console.error(`Details: ${buffer.split("Error")[1]}`);
                }
                reject(new Error(`${framework} installation failed with code ${code}`));
            }
        });
    });
}