import * as sass from 'sass';
import { lstatSync, readdirSync } from 'fs';
import path from 'path';
import storage from './storage.js';

export default {
    /**
     * Searches for the available styles returning the normalized path for each of them.
     * A path existence verification is performed for each identified path.
    */
    getStylePaths(thunderbirdPackage: ThunderbirdPackage): string[] | undefined {
        const stylePaths = thunderbirdPackage.stylesPath;

        if (!stylePaths) {
            return undefined;
        }

        const paths = (Array.isArray(stylePaths) ? stylePaths : [stylePaths])
            .map((stylesPath) => path.join(thunderbirdPackage.srcDir, stylesPath));

        paths.forEach((stylesPath) => {
            if (stylesPath && !storage.pathExists(stylesPath)) {
                throw new Error(`Styles path "${stylesPath}" not found.`);
            }
        });

        return paths;
    },

    /**
     * Compile the styles inside the given paths and return the whole compiled data as a single string.
     */
    processStylePaths(stylePaths: string[]): string {
        return stylePaths
            .map((stylePath) => lstatSync(stylePath).isDirectory()
                ? compileDirectory(stylePath)
                : compileFile(stylePath))
            .join('\n');
    },
};

function compileDirectory(stylesDir: string): string {
    const validExts = ['css', 'scss', 'sass'];
    return readdirSync(stylesDir)
        .filter((file) => storage.fileHasExtension(file, validExts))
        .sort()
        .map((file) => compileFile(path.join(stylesDir, file)))
        .join('\n');
}

function compileFile(filePath: string): string {
    const style = 'expanded'; // or 'compressed'
    return sass.compile(filePath, { style }).css;
}
