import * as fs from 'fs';
import AdmZip from 'adm-zip';

export default {
    ensureDirectory(directoryPath: string): void {
        if (!this.pathExists(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }
    },

    pathExists(filePath: string): boolean {
        return fs.existsSync(filePath);
    },

    readFile(filePath: string, encoding?: BufferEncoding): string {
        return fs.readFileSync(filePath, { encoding: encoding ?? 'utf8' });
    },

    zipCompress(fileName: string, filesList: (string | ReadFile)[]) {
        const zip = new AdmZip();

        for (const file of filesList) {
            if (typeof file === 'string') {
                zip.addLocalFile(file);
            }
            else {
                zip.addFile(file.filename, Buffer.from(file.content, 'utf8'));
            }
        }

        zip.writeZip(fileName);

        return fileName;
    },

    // createFile(filePath: string, fileContents: string): string {
    //     fs.writeFileSync(filePath, fileContents);
    //     return filePath;
    // },
    // deleteFile(filePath: string): void {
    //     fs.unlinkSync(filePath);
    // },
    // copyFile(sourceFilePath: string, destinyFilePath: string): void {
    //     fs.copyFileSync(sourceFilePath, destinyFilePath);
    // },
};
