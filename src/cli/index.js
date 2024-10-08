#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * @param {{cmd: string, args: {verbose: number}}} command
 */
((command) => {
    switch (command.cmd) {
        case 'init': copyTemplates(command.args); break;
        default: instructions();
    }
})(getCmd());

/**
 * @param {{verbose: number}} args
 */
function copyTemplates(args) {
    const options = { ...{ srcDir: 'src' }, ...args };
    const { verbose } = args;

    ensurePath(join(options.srcDir), verbose);

    const stubsDir = join(import.meta.dirname, '..', 'stubs');

    readdirSync(stubsDir).forEach(
        (file) => { copyFile(join(stubsDir, file), join(options.srcDir, file), verbose); },
    );
}

/**
 * @param {string} sourceFilePath
 * @param {string} destinyFilePath
 * @param {number} verbose
 */
function copyFile(sourceFilePath, destinyFilePath, verbose) {
    if (verbose === 1) {
        console.log(`Adding '${destinyFilePath}'.`);
    }
    else if (verbose === 2) {
        console.log(`Copying '${sourceFilePath}' to '${destinyFilePath}'.`);
    }
    if (!existsSync(destinyFilePath)) {
        copyFileSync(sourceFilePath, destinyFilePath);
    }
    else if (verbose > 0) {
        console.log(`File '${destinyFilePath}' already exists.`);
    }
}

/**
 * @param {string} requiredPath
 * @param {number} verbose
 */
function ensurePath(requiredPath, verbose) {
    if (!existsSync(requiredPath)) {
        if (verbose > 0) {
            console.log(`Creating path '${requiredPath}'.`);
        }
        mkdirSync(requiredPath, { recursive: true });
    }
    else if (verbose === 2) {
        console.log(`Path '${requiredPath}' already exists.`);
    }
}
function getCmd() {
    const cmd = {
        cmd: process.argv[2],
        args: process.argv
            .slice(3)
            .filter((arg) => arg.startsWith('--'))
            .map((arg) => arg.substring(2).split('='))
            .reduce(
                (args, arg) => ({ ...args, ...{ [arg[0]]: arg[1] } }),
                { verbose: '1' },
            ),
    };

    cmd.args.verbose = parseInt(cmd.args.verbose, 10);

    return cmd;
}

function instructions() {
    console.log();
    console.log('USAGE:');
    console.log(' > npx tbtb init [--verbose=0|1|2]');
    console.log();
}
