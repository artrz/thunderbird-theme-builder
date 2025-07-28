import Joi from 'joi';
import storage from './storage';

export default {
    /**
     * Generates the theme manifest file.
     */
    generate(
        themeColors: GeneratedThemeColors,
        themeImages: Record<string, string> | undefined,
        themePackage: ThemePackage,
        hasCss: boolean,
    ): Manifest {
        const properties = themePackage.extra.thunderbird;

        // https://developer.thunderbird.net/add-ons/mailextensions/supported-manifest-keys
        return {
            manifest_version: 2, // v3 support only for Thunderbird 128+
            name: properties.name,
            version: properties.version,
            description: themePackage.description,
            author: properties.author.name,
            homepage_url: properties.homepage ?? properties.author.url,
            browser_specific_settings: {
                gecko: {
                    id: properties.themeId,
                    strict_min_version: properties.thunderbirdMinVersion,
                    strict_max_version: properties.thunderbirdMaxVersion,
                },
            },
            theme: {
                colors: themeColors.colors,
                images: themeImages,
            },
            theme_experiment: {
                stylesheet: hasCss ? `${themePackage.name}.css` : undefined,
                colors: themeColors.experimentColors,
            },
        };
    },

    // eslint-disable-next-line max-lines-per-function
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
                    thunderbirdMaxVersion: Joi.string()
                        .pattern(/^\d+(\.\d+)?$/u)
                        .required(),
                    stylesPath: Joi.alternatives()
                        .try(
                            Joi.string(),
                            Joi.array().items(Joi.string()),
                        ),
                    author: Joi.object({
                        name: Joi.string(),
                        url: Joi.string(),
                    }).required(),
                    homepage: Joi.string(),
                    srcDir: Joi.string()
                        .required(),
                    outDir: Joi.string()
                        .required(),
                    assetsDir: Joi.string(),
                }),
            }),
        }).unknown();

        Joi.assert(themePackage, schema);

        const properties = themePackage.extra.thunderbird;
        if (properties.assetsDir && !storage.pathExists(properties.assetsDir)) {
            throw new Error(`Invalid assets directory '${properties.assetsDir}'`);
        }
    },
};
