import { FrameworkConfig } from "../types/index";
import { AstroInstaller } from "../frameworks/astro/index.js";
import { NextJSInstaller } from "../frameworks/nextjs/index.js";
import { SvelteKitInstaller } from "../frameworks/sveltekit/index.js";
import { ViteInstaller } from "../frameworks/vite/index.js";
import { createCSSInstaller } from "../features/css/index.js";
import { createLintingInstaller } from "../features/linting/index.js";
import { createPackageManager } from "../package-managers/index.js";

export async function installFramework(config: FrameworkConfig): Promise<boolean> {
    try {
        // Step 1: Install the base framework
        const framework = getFrameworkInstaller(config);
        await framework.install();

        // Step 2: Install framework-specific addons
        await framework.installAddons();

        // Step 3: Install CSS framework if specified
        const cssInstaller = createCSSInstaller(config);
        if (cssInstaller) {
            await cssInstaller.install();
        }

        // Step 4: Install linting tools if specified
        const lintingInstallers = createLintingInstaller(config);
        for (const installer of lintingInstallers) {
            await installer.install();
        }

        // Step 5: Install dependencies
        const pm = createPackageManager(config.packageManager, config.projectDir);
        await pm.install([]);

        // Step 6: Initialize git if specified
        if (config.features.git) {
            const { execSync } = await import("child_process");
            execSync(`git init -q`, { cwd: config.projectDir });
        }

        return true;
    } catch (error) {
        console.error(`Framework installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return false;
    }
}

function getFrameworkInstaller(config: FrameworkConfig) {
    switch (config.framework) {
        case "astro":
            return new AstroInstaller(config);
        case "nextjs":
            return new NextJSInstaller(config);
        case "sveltekit":
            return new SvelteKitInstaller(config);
        case "vite":
            return new ViteInstaller(config);
        default:
            throw new Error(`Unsupported framework: ${config.framework}`);
    }
} 