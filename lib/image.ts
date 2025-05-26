const sharp = require('sharp');
const fs = require('fs');

function convertSvgToPng(svgContent: string, outputPath: string) {
	sharp(Buffer.from(svgContent))
		.png()
		.toFile(outputPath, (err: any, info: any) => {
			if (err) {
				console.error('Error during conversion:', err);
			} else {
				console.log('Conversion successful:', info);
			}
		});
}

// Exemple d'utilisation :
const svgContent =
	'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>';
const outputPath = 'output.png';

convertSvgToPng(svgContent, outputPath);
