#!/usr/bin/env node

import { installFramework } from "./lib/installer.js";
import { FrameworkConfig } from "./types/index";
import * as fs from "fs";
import * as path from "path";

/**
 * Marmite - A simple CLI tool for scaffolding web projects
 *
 * Usage: npx marmite <scriptId>
 */
async function main(): Promise<void> {
    try {
        // Get command line arguments
        const args = process.argv.slice(1);
        if (args.length < 1) {
            console.error("Error: Missing argument.");
            console.log("Usage: npx marmite <scriptId>");
            process.exit(1);
        }

        // Parse arguments
        let config: FrameworkConfig;
        try {
            config = JSON.parse(atob(args[1]));
        } catch (error) {
            console.error(
                "Error: Invalid scriptId format. Please ensure it's properly base64 encoded."
            );
            process.exit(1);
        }

        // Validate the decoded object
        if (!config || typeof config !== "object" || !config.framework) {
            console.error(
                "Error: Invalid scriptId structure. Missing required properties.",
                config
            );
            process.exit(1);
        }

        // Check if project directory exists
        const projectPath = path.resolve(process.cwd(), config.projectDir);
        if (fs.existsSync(projectPath)) {
            console.error(`\n❌ Error: Directory "${config.projectDir}" already exists.`);
            console.error(`Please choose a different project name or delete the existing directory.`);
            process.exit(1);
        }

        console.log(
            `Starting project setup for ${config.framework}: ${config.projectDir}`
        );

        // Install the framework and its features
        const success = await installFramework(config);

        if (success) {
            console.log(
                `\n🎉 Project setup complete! Your ${config.framework} project is ready.`
            );
        } else {
            console.error("Project setup failed. Please check the errors above.");
            process.exit(1);
        }
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