import getThemePackage from './packageReader.js';
import manifestGenerator from './manifestGenerator.js';
import path from 'path';
import storage from './storage.js';
import styleParser from './styleParser.js';
import themeConfigParser from './themeConfigParser.js';

export function build(themeConfig: ThemeConfig, config?: Partial<ThunderbirdPackage>): void {
    const themePackage = getThemePackage(config);
    const thunderbirdPackage = themePackage.extra.thunderbird;

    storage.ensureDirectory(thunderbirdPackage.outDir);

    try {
        manifestGenerator.validate(themePackage);
        themeConfigParser.validate(themeConfig);
    }
    catch (err: unknown) {
        console.error(err);
        console.log();
        return;
    }

    const styleFilePath = styleParser.getStyleFilePath(thunderbirdPackage);

    const css = styleParser.processFile(styleFilePath);
    const theme = themeConfigParser.parse(themeConfig);

    const manifest = manifestGenerator.generate(theme, themePackage, css?.filename);

    const themeFilepath = pack(manifest, themePackage, css);

    showInfo(manifest, themeFilepath);
}

function pack(manifest: Manifest, themePackage: ThemePackage, css?: ReadFile): string {
    const files = [{
        filename: 'manifest.json',
        content: JSON.stringify(manifest),
    }];

    if (css) {
        files.push({
            filename: css.filename,
            content: css.content,
        });
    }

    const themeFilename = `${themePackage.name.replaceAll('.', '-')}.xpi`;
    const themeFilepath = path.join(themePackage.extra.thunderbird.outDir, themeFilename);

    storage.zipCompress(themeFilepath, files);

    return themeFilepath;
}

function showInfo(manifest: Manifest, location: string) {
    const lines = [
        `Theme: ${manifest.name}`,
        `Id: ${manifest.browser_specific_settings.gecko.id}`,
        `Version: ${manifest.version}`,
        `File: ${location}`,
    ];

    const len = lines.reduce((gt, line) => line.length > gt ? line.length : gt, 0);

    console.log(`\n .${'-'.repeat(len)}. `);
    for (const line of lines) {
        const spaces = ' '.repeat(len - line.length);
        console.log(`| ${line}${spaces} |`);
    }
    console.log(` '${'-'.repeat(len)}' `);
}
