// @ts-check

import eslint from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

const style = stylistic.configs.customize({
    arrowParens: true,
    blockSpacing: true,
    braceStyle: 'stroustrup',
    commaDangle: 'always-multiline',
    indent: 4,
    jsx: false,
    quoteProps: 'consistent-as-needed',
    semi: true,
});

export default tseslint.config(
    eslint.configs.all,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        plugins: {
            '@stylistic': stylistic,
        },
        rules: {
            'camelcase': ['error', { properties: 'never' }], // skip object props for interoperability
            'capitalized-comments': 'off',       // We may comment code too
            'func-style': ['error', 'declaration', { allowArrowFunctions: true }], // Use declarations for hoisting, expressions for var scoping
            'key-spacing': 'off',                // So we can align object prop values
            'max-statements': ['error', 15],     // Default (10) might be too strict
            'no-console': 'warn',                // We do need to output to console
            'no-inline-comments': 'off',         // Inline comments like this one
            'no-magic-numbers': ['warn', { ignore: [0, 1] }], // Lets be more practical
            'no-ternary': 'off',                 // Ternary operator rocks
            'no-undefined': 'off',               // No-shadow-restricted-names blocks overwriting `undefined`
            'no-use-before-define': 'off',       // function declaration hoisting is useful for code readability
            'one-var': 'off',                    // Not grouping vars declaration makes code easier to read
            'prefer-named-capture-group': 'off', // No named captured groups for regex
            'sort-imports': 'warn',              // Just warn, don't fail
            'sort-keys': 'warn',                 // Sometimes makes more sense to order by context than naming

            '@typescript-eslint/prefer-string-starts-ends-with': ['warn'],
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

            ...style.rules,
            '@stylistic/key-spacing': 'off',
            '@stylistic/max-statements-per-line': ['error', { max: 2 }], // mainly for arrow funcs not returning a value
            '@stylistic/no-multi-spaces': ['warn', { exceptions: { Property: true }, ignoreEOLComments: true }],
            '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
            '@stylistic/wrap-iife': ['error', 'inside', { functionPrototypeMethods: true }],
        },
    },
    {
        name: 'general',
        files: ['**/*.js', '**/*.ts', '**/*.mjs'],
        languageOptions: {
            parserOptions: {
                ecmaVersion: 6,
                project: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'class-methods-use-this': 'off',
            '@typescript-eslint/class-methods-use-this': 'error',
        },
    },
    {
        name: 'JS',
        files: ['**/*.js'],
        languageOptions: {
            globals: { ...globals.node },
        },
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
        },
    },
    // custom for project
    {
        name: 'This package',
        files: ['src/**/*.js', 'src/**/*.ts'],
        rules: {
            'no-console': 'off',
            'no-magic-numbers': 'off',
            'sort-keys': 'off',
        },
    },
    {
        name: 'Stubs',
        files: ['src/stubs/**/*.js'],
        rules: {
            '@typescript-eslint/no-unsafe-call': 'off',
        },
    },
);
