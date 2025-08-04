import sharp from 'sharp';

export async function convertSvgToPng(svgContent: string, outputPath: string, options?: { width?: number; height?: number; density?: number }): Promise<void> {
	try {
		const sharpOptions: any = {};
		if (options?.density) {
			sharpOptions.density = options.density;
		}

		let sharpInstance = sharp(Buffer.from(svgContent), sharpOptions);

		if (options?.width || options?.height) {
			sharpInstance = sharpInstance.resize(options.width, options.height);
		}

		await sharpInstance.png().toFile(outputPath);
		console.log('✔ Conversion successful:', outputPath);
	} catch (err) {
		console.error('✘ Error during conversion:', err);
		throw err;
	}
}
