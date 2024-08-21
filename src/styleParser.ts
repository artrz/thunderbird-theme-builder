import path from 'path';
import sass from 'sass';
import storage from './storage';

export default {
    processFile(filePath?: string): ReadFile | undefined {
        return filePath
            ? {
                    content: sass.compile(filePath, { style: 'compressed' }).css,
                    filename: path.format({ ...path.parse(filePath), dir: '', base: '', ext: '.css' }),
                }
            : undefined;
    },

    getStyleFilePath(thunderbirdPackage: ThunderbirdPackage): string | undefined {
        const styleFilePath = thunderbirdPackage.stylesheet
            ? path.join(thunderbirdPackage.srcDir, thunderbirdPackage.stylesheet)
            : undefined;

        if (styleFilePath && !storage.pathExists(styleFilePath)) {
            throw new Error(`Style file "${styleFilePath}" not found.`);
        }

        return styleFilePath;
    },
};
