import Joi from 'joi';
import stub from './stubs/themeColors.js';

export default {
    /**
     * Generates the theme colors for manifest's theme.colors and theme_experiment.colors.
     * The generated colors include
     */
    parse(themeConfig: ThemeConfig): GeneratedThemeColors {
        const colors = generateMainThemeColors(
            themeConfig.color_scheme,
            themeConfig.theme_colors ?? {},
        );

        const { colors: mtc, experimentColors: mec } = generateMainThemeExperimentColors(
            themeConfig.color_scheme,
            themeConfig.theme_experiment_colors ?? {},
        );

        const { colors: stc, experimentColors: sec } = generateSchemeColors(
            themeConfig.color_scheme,
        );

        return {
            colors: { ...colors, ...mtc, ...stc },
            experimentColors: { ...mec, ...sec },
        };
    },

    validate(themeConfig: ThemeConfig) {
        const schema = Joi.object({
            color_scheme: Joi.object()
                .pattern(
                    Joi.string(),
                    Joi.string().pattern(/^#([0-9a-fA-F]{3,4})|([0-9a-fA-F]{6,8})$/u),
                )
                .required(),

            theme_colors: Joi.object()
                .pattern(Joi.string(), Joi.string()),

            theme_experiment_colors: Joi.object()
                .pattern(Joi.string(), Joi.string()),
        });

        Joi.assert(themeConfig, schema);

        validateColors(themeConfig);

        const colorsToUse = [
            ...Object.values(themeConfig.theme_colors ?? {}),
            ...Object.values(themeConfig.theme_experiment_colors ?? {}),
        ]
            .filter((colorName, index, all) => colorName === all[index]);

        const missingColors = colorsToUse
            .filter((colorName) => !(colorName in themeConfig.color_scheme));

        if (missingColors.length > 0) {
            throw new Error(`Missing color definitions:\n${prettyJson(missingColors)}`);
        }

        const unusedColors = Object.keys(themeConfig.color_scheme)
            .filter((colorName) => !colorsToUse.includes(colorName));

        if (unusedColors.length > 0) {
            console.warn(`* Colors not referenced in 'theme_colors' nor 'theme_experiment_colors':\n${prettyJson(unusedColors)}`);
        }
    },
};

/**
 * Generates an object where each key is a theme color setting and each value a hex color.
 */
function generateMainThemeColors(colorScheme: ColorScheme, themeNamedColors: ThemeColors) {
    return Object
        .entries(themeNamedColors)
        .reduce<ThemeColors>((themeColors, [setting, themeColorName]) => {
            // Replace the color names by their values.
            themeColors[setting] = colorScheme[themeColorName];
            return themeColors;
        }, {});
}

/**
 * Generates an object where each key is a theme experiment color setting and each value a hex color.
 */
function generateMainThemeExperimentColors(
    colorScheme: ColorScheme,
    themeExperimentNamedColors: ThemeExperimentColors,
): GeneratedThemeColors {
    return Object
        .entries(themeExperimentNamedColors)
        .reduce<GeneratedThemeColors>((expColors, [colorVariable, themeColorName]) => {
            // Generate a name for the color variable and get the color from the theme.
            const expColorName = themeColorName + colorVariable.replaceAll('-', '_');
            const expColorValue = colorScheme[themeColorName];

            // Add the color setting to the theme colors list.
            expColors.colors[expColorName] = expColorValue;
            // Add the color setting to the theme_experiment colors list.
            expColors.experimentColors[expColorName] = colorVariable;

            return expColors;
        }, {
            colors: {},
            experimentColors: {},
        });
}

/**
 * Generates an object where each key is a theme color setting and each value a hex color.
 */
function generateSchemeColors(colorScheme: ColorScheme): GeneratedThemeColors {
    return Object
        .entries(colorScheme)
        .reduce<GeneratedThemeColors>((theme, [themeColorName, themeColorValue]) => {
            // Add the color to the theme colors list.
            theme.colors[themeColorName] = themeColorValue;

            // Add the color to the theme_experiment colors list.
            const expColorName = `--${themeColorName}`;
            theme.experimentColors[themeColorName] = expColorName;

            return theme;
        }, {
            colors: {},
            experimentColors: {},
        });
}

function validateColors(themeConfig: ThemeConfig): void {
    assertUniqueColors(themeConfig);
    validateColorKeys(themeConfig);
}

function validateColorKeys(themeConfig: ThemeConfig): void {
    if (!themeConfig.theme_colors) {
        return;
    }

    const validThemeColors = getColorConfigKeys();

    const themeColors = Object.keys(themeConfig.theme_colors);

    const invalids = themeColors.filter((key) => !validThemeColors.includes(key));

    if (invalids.length) {
        throw new Error(`Invalid color keys:\n${prettyJson(invalids)}\n`
            + `Valid colors are:\n${prettyJson(validThemeColors)}`);
    }

    const missing = validThemeColors.filter((key) => !themeColors.includes(key));

    if (missing.length) {
        console.warn(`* Theme colors missing in 'theme_colors':\n${prettyJson(missing)}`);
    }
}

function assertUniqueColors(themeConfig: ThemeConfig): void {
    const themeColorValues = Object.values(themeConfig.color_scheme)
        .map((color) => color.replaceAll(' ', ''));

    const dupes = findDupes(themeColorValues);

    if (dupes.length) {
        throw new Error(`Duplicated color keys:\n${prettyJson(dupes)}`);
    }
}

function findDupes(array: string[]): string[] {
    return [...new Set(array.filter((value, index, all) => all.indexOf(value) !== index))];
}

function getColorConfigKeys(): string[] {
    const themeColors = (stub as ThemeConfig).theme_colors;

    // The sub does have `theme_colors` defined.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Object.keys(themeColors!);
}

function prettyJson(variable: unknown): string {
    return JSON.stringify(variable, null, 1);
}
