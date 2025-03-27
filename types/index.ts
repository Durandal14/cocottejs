export type Framework = 'astro' | 'sveltekit' | 'nextjs' | 'vite';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';
export type Language = 'js' | 'ts';
export type CSSFramework = 'tailwind' | 'unocss';
export type DevTool = 'eslint' | 'prettier' | 'husky' | 'docker';
export type TestingFramework = 'vitest' | 'playwright';
export type Addon = 'mdsvex' | 'zod' | 'zustand' | 'partytown';
export type LintingTool = 'eslint' | 'prettier';
export type Front = 'react' | 'vue' | 'svelte' | 'solid';
export interface FrameworkConfig {
	language: Language;
	packageManager: PackageManager;
	framework: Framework;
	css?: CSSFramework;
	front?: Front;
	dev?: DevTool[];
	testing?: TestingFramework[];
	addons?: Addon[];
	git?: boolean;
	dependencies?: boolean;
	cssTheme?: string;
	shadcnAddons?: string[];
}

export interface Installer {
	install(): Promise<void>;
}

export interface PackageManagerInterface {
	install(packages: string[]): Promise<void>;
	add(packages: string[]): Promise<void>;
	run(script: string): Promise<void>;
}
