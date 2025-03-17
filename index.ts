#!/usr/bin/env node

import { APIService } from "./lib/api.js";
import { InstructionExecutor } from "./lib/executor.js";
import * as fs from "fs";
import * as path from "path";

/**
 * Marmite - A CLI tool for scaffolding web projects with remote instructions
 *
 * Commands:
 *   build <identifier> <projectDir>    Build a project using public API
 *   get <identifier> <token> <projectDir>  Build a project using private API
 *
 * Examples:
 *   marmite build v1:nextjs-ts-react-tailwind-eslint my-project
 *   marmite get v1:nextjs-ts-react-tailwind-eslint my-token my-project
 */
async function main(): Promise<void> {
    try {
        // Get command line arguments
        const args = process.argv.slice(1);
        if (args.length < 3) {
            console.error("Error: Missing required arguments.");
            console.log("Usage:");
            console.log("  marmite build <identifier> <projectDir>");
            console.log("  marmite get <identifier> <token> <projectDir>");
            process.exit(1);
        }

        const [caller, command, identifier, ...rest] = args;
        console.log("CACA", command, identifier, rest);
        // Validate command
        if (command !== 'build' && command !== 'get') {
            console.error("Error: Invalid command.");
            console.log("Available commands:");
            console.log("  build - Build a project using public API");
            console.log("  get   - Build a project using private API");
            process.exit(1);
        }

        // Parse remaining arguments based on command
        let projectDir: string;
        let token: string | undefined;

        if (command === 'build') {
            if (rest.length !== 1) {
                console.error("Error: build command requires exactly 2 arguments.");
                console.log("Usage: marmite build <identifier> <projectDir>");
                process.exit(1);
            }
            projectDir = rest[0];
        } else {
            if (rest.length !== 2) {
                console.error("Error: get command requires exactly 3 arguments.");
                console.log("Usage: marmite get <identifier> <token> <projectDir>");
                process.exit(1);
            }
            [token, projectDir] = rest;
        }

        // Check if project directory exists
        const projectPath = path.resolve(process.cwd(), projectDir);
        if (fs.existsSync(projectPath)) {
            console.error(`\n❌ Error: Directory "${projectDir}" already exists.`);
            console.error(`Please choose a different project name or delete the existing directory.`);
            process.exit(1);
        }

        console.log(`\n🚀 Starting project setup with identifier: ${identifier}`);
        if (command === 'get') {
            console.log("🔒 Using private API with authentication");
        }

        // Fetch instructions from API
        let apiResponse;
        try {
            if (command === 'get' && token) {
                apiResponse = await APIService.getPrivateInstructions(identifier, projectDir, token);
            } else {
                apiResponse = await APIService.getPublicInstructions(identifier, projectDir);
            }
        } catch (error) {
            console.error("Failed to fetch instructions:", error instanceof Error ? error.message : "Unknown error");
            process.exit(1);
        }
        console.log("CACA", JSON.stringify(apiResponse, null, 2));

        // Create project directory
        // fs.mkdirSync(projectPath, { recursive: true });
        // process.chdir(projectPath);

        // Execute instructions in sequence
        console.log("\n📝 Executing setup instructions...");
        for (const instruction of apiResponse.instructions) {
            try {
                await InstructionExecutor.execute(instruction);
                console.log(`✅ Executed instruction: ${instruction.name}`);
            } catch (error) {
                console.error(`❌ Failed to execute instruction ${instruction.name}:`, error instanceof Error ? error.message : "Unknown error");
                process.exit(1);
            }
        }

        let countStep = 2
        console.log("\n🎉 Project setup complete! Your project is ready.");
        console.log(`\nNext steps:`);
        console.log(`1. cd ${projectDir}`);
        if (apiResponse.config.dependencies) {
            console.log(`2. ${apiResponse.config.packageManager} install`);
            countStep++;
        }
        console.log(`${countStep}. ${apiResponse.config.packageManager} ${apiResponse.config.packageManager === "npm" ? "run " : ""}dev`);

    } catch (error) {
        console.error(
            "An error occurred:",
            error instanceof Error ? error.message : "Unknown error"
        );
        process.exit(1);
    }
}

// Run the main function
main(); 