import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'acorn';
import { walk } from 'estree-walker';

/**
 * Adds an import statement to a file if it doesn't already exist
 * @param filePath Path to the file
 * @param importStatement The import statement to add
 * @param importCheck A regex to check if the import already exists
 * @returns The modified code or null if file doesn't exist
 */
export function addImportToFile(
	filePath: string,
	importStatement: string,
	importCheck: RegExp
): string | null {
	if (!fs.existsSync(filePath)) return null;

	let code = fs.readFileSync(filePath, 'utf8');

	// Check if import already exists
	const hasImport = importCheck.test(code);
	if (!hasImport) {
		code = `${importStatement}\n` + code;
	}

	return code;
}

/**
 * Finds the position of a specific property in an AST
 * @param code The source code
 * @param propertyName Name of the property to find
 * @param expectedValueType Type of the property value (e.g., "ArrayExpression")
 * @returns Position of the property value end or null if not found
 */
export function findPropertyPosition(
	code: string,
	propertyName: string,
	expectedValueType: string
): number | null {
	const ast = parse(code, { sourceType: 'module', ecmaVersion: 'latest' });
	let position = null;
	walk(ast as any, {
		enter(node: any) {
			if (
				node.type === 'Property' &&
				node.key.name === propertyName &&
				node.value.type === expectedValueType
			) {
				position = node.value.end - 1;
			}
		},
	});

	return position;
}

/**
 * Adds a value to an array property in the code if it's not already present
 * @param code The source code
 * @param propertyPosition Position where to insert the value
 * @param valueToAdd The value to add
 * @param checkString A string to check if the value is already present
 * @returns The modified code
 */
export function addValueToProperty(
	code: string,
	propertyPosition: number | null,
	valueToAdd: string,
	checkString: string
): string {
	if (propertyPosition !== null && !code.includes(checkString)) {
		return code.slice(0, propertyPosition) + `, ${valueToAdd}` + code.slice(propertyPosition);
	}
	return code;
}

/**
 * Updates a file with the given code
 * @param filePath Path to the file
 * @param code The new content
 * @param successMessage Message to log on success
 */
export function updateFile(filePath: string, code: string, successMessage: string): void {
	fs.writeFileSync(filePath, code, 'utf8');
	console.log(successMessage);
}

/**
 * Generic function to modify a config file by adding imports and values to properties
 * @param projectDir Project directory
 * @param fileName Name of the file to modify
 * @param importStatement Import statement to add
 * @param importCheck Regex to check if import exists
 * @param propertyName Property name to modify
 * @param valueToAdd Value to add to the property
 * @param checkString String to check if value is already present
 * @param successMessage Success message to display
 */
export function modifyConfigFile(
	projectDir: string,
	fileName: string,
	importStatement: string,
	importCheck: RegExp,
	propertyName: string,
	valueToAdd: string,
	checkString: string
): void {
	const filePath = path.join(projectDir, fileName);

	// Add import if needed
	let code = addImportToFile(filePath, importStatement, importCheck);
	if (!code) return;

	// Find property position
	const position = findPropertyPosition(code, propertyName, 'ArrayExpression');

	// Add value to property if needed
	code = addValueToProperty(code, position, valueToAdd, checkString);

	// Update file
	updateFile(filePath, code, `✅ ${checkString} added to ${fileName}`);
}
