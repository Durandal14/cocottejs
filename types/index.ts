export type Framework = "astro" | "sveltekit" | "nextjs" | "vite";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type Language = "js" | "ts";
export type CSSFramework = "tailwind" | "unocss";
export type TestingFramework = "vitest" | "playwright";
export type LintingTool = "eslint" | "prettier";
export type Front = "react" | "vue" | "svelte" | "solid";
export interface FrameworkConfig {
    framework: Framework;
    packageManager: PackageManager;
    projectDir: string;
    language: Language;
    front?: Front;
    features: {
        css?: CSSFramework;
        testing?: TestingFramework[];
        linting?: LintingTool[];
        git?: boolean;
    };
}

export interface Installer {
    install(): Promise<void>;
}

export interface PackageManagerInterface {
    install(packages: string[]): Promise<void>;
    add(packages: string[]): Promise<void>;
    run(script: string): Promise<void>;
}

export interface PackageOptions {
    meta: "astro" | "sveltekit" | "nextjs";
    compiler: "npm" | "pnpm" | "yarn" | "bun";
    projectDir: string;
    language: "js" | "ts";
    css?: "tailwind" | "unocss";
    eslint?: boolean;
    prettier?: boolean;
    playwright?: boolean;
    vitest?: boolean;
    git?: boolean;
    dependencies?: boolean;
}

export interface SpawnOptions {
    stdio?: 'pipe' | 'inherit' | 'ignore' | Array<'pipe' | 'inherit' | 'ignore'>;
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    argv0?: string;
    detached?: boolean;
    uid?: number;
    gid?: number;
    serialization?: 'json' | 'advanced';
    shell?: boolean | string;
    windowsVerbatimArguments?: boolean;
    windowsHide?: boolean;
    signal?: AbortSignal;
    timeout?: number;
    killSignal?: NodeJS.Signals | number;
}