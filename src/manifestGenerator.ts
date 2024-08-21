import Joi from 'joi';

export default {
    generate(
        generatedThemeColors: GeneratedThemeColors,
        themePackage: ThemePackage,
        cssFilename?: string,
    ): Manifest {
        const properties = themePackage.extra.thunderbird;

        // https://developer.thunderbird.net/add-ons/mailextensions/supported-manifest-keys
        return {
            // https://webextension-api.thunderbird.net/en/128-esr-mv3/changes/esr128.html
            manifest_version: 2, // v3 support only for Thunderbird 128+
            name: themePackage.displayName ?? themePackage.name,
            version: properties.version,
            description: themePackage.description,
            author: themePackage.author?.name,
            homepage_url: themePackage.author?.url,
            browser_specific_settings: {
                gecko: {
                    id: properties.themeId,
                    strict_min_version: properties.thunderbirdMinVersion,
                },
            },
            theme: {
                colors: generatedThemeColors.colors,
            },
            theme_experiment: {
                stylesheet: cssFilename,
                colors: generatedThemeColors.experimentColors,
            },
        };
    },

    validate(themePackage: ThemePackage) {
        const schema = Joi.object({
            name: Joi.string()
                .required(),
            // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version#version_format
            version: Joi.string()
                .pattern(/^(0|[1-9][0-9]{0,8})([.](0|[1-9][0-9]{0,8})){0,3}$/u)
                .required(),
            displayName: Joi.string(),
            description: Joi.string(),
            author: Joi.object({
                name: Joi.string(),
                url: Joi.string(),
            }),
            extra: Joi.object({
                thunderbird: Joi.object({
                    name: Joi.string()
                        .required(),
                    version: Joi.string()
                        .pattern(/^\d+([.]\d+){0,2}$/u),
                    themeId: Joi.alternatives()
                        .try(
                            Joi.string().email({ tlds: { allow: false } }),
                            Joi.string().pattern(/^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/iu),
                        ),
                    thunderbirdMinVersion: Joi.string()
                        .pattern(/^\d+(\.\d+)?$/u)
                        .required(),
                    stylesheet: Joi.string(),
                    author: Joi.object({
                        name: Joi.string(),
                        url: Joi.string(),
                    }).required(),
                    srcDir: Joi.string()
                        .required(),
                    outDir: Joi.string()
                        .required(),
                }),
            }),
        }).unknown();

        Joi.assert(themePackage, schema);
    },
};
