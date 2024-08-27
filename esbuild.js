import { cpSync, rmSync } from 'fs';
import { context } from 'esbuild';
import packageJson from './package.json' with { type: 'json' };

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
    name: 'esbuild-problem-matcher',

    setup(build) {
        build.onStart(() => {
            console.log('[watch] build started');
        });
        build.onEnd((result) => {
            result.errors.forEach(({ text, location }) => {
                console.error(`✘ [ERROR] ${text}`);
                console.error(`    ${location.file}:${location.line}:${location.column}:`);
            });
            console.log('[watch] build finished');
        });
    },
};

/**
 * This plugin allows to copy files to the built package.
 * @param {{src: string, dest: string}} options
 */
const esbuildCopyFilesPlugin = (options = {}) =>
    /**
    * @type {import('esbuild').Plugin}
    */
    ({
        name: 'copy-files',

        setup(build) {
            build.onStart(() => {
                console.log(`[watch] Coping to ${options.dest}`);
            });
            build.onEnd(() => {
                cpSync(options.src, options.dest, {
                    dereference: true,
                    preserveTimestamps: true,
                    recursive: true,
                });
                console.log(`[watch] Copied ${options.dest}`);
            });
        },
    })
;

async function main() {
    rmSync('dist', { force: true, recursive: true });

    const ctx = await context({
        entryPoints: ['src/main.ts'],
        outfile: 'dist/index.js',
        platform: 'node',

        target: 'esnext',
        format: 'esm',
        bundle: true,

        external: Object.keys(packageJson.dependencies),

        minify: production,
        sourcemap: !production,

        plugins: [
            esbuildCopyFilesPlugin({
                dest: './dist/stubs',
                src: './src/stubs',
            }),
            esbuildCopyFilesPlugin({
                dest: './dist/cli',
                src: './src/cli',
            }),
            /* add to the end of plugins array */
            esbuildProblemMatcherPlugin,
        ],
    });
    if (watch) {
        await ctx.watch();
    }
    else {
        await ctx.rebuild();
        await ctx.dispose();
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
