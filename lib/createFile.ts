import fs from "fs";

export function createFile(filename: string, content: string): void {
  fs.writeFileSync(filename, content, "utf8");
}

export function copyFile(filename: string, originFilename: string): void {
  fs.copyFileSync(originFilename, filename);
}
