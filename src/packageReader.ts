import storage from './storage.js';

/**
 * Extracts all the required information for theme generation.
 * Here we do basically two things: Merge data coming from the package.json file
 * with the one in the config file and define some defaults for missing data.
 */
export default function packageReader(config?: Partial<ThunderbirdPackage>): ThemePackage {
    const themePackage = getThemePackage();
    const props = getThemeProperties(themePackage, config);

    // Reconfigure to contain all the configured values or defaults.
    themePackage.extra.thunderbird = {
        name: props.name ?? themePackage.displayName ?? themePackage.name,
        version: props.version ?? themePackage.version,
        themeId: props.themeId ?? `${themePackage.name}@addons.thunderbird.net`,
        thunderbirdMinVersion: props.thunderbirdMinVersion ?? '115.0',
        thunderbirdMaxVersion: props.thunderbirdMaxVersion ?? '128.6',
        stylesPath: props.stylesPath,
        author: {
            name: props.author?.name ?? themePackage.author?.name,
            url: props.author?.url ?? themePackage.author?.url,
        },
        homepage: themePackage.homepage,
        srcDir: props.srcDir ?? 'src',
        outDir: props.outDir ?? 'build',
        assetsDir: props.assetsDir,
    };

    return themePackage;
}

/**
 * Loads and returns the package.json file contents.
 */
function getThemePackage(): ThemePackage {
    // Assume the parsed object corresponds to a ThemePackage type.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const themePackage: ThemePackage = JSON.parse(storage.readFile('package.json'));

    // If the package object doesn't contain the `extra`, field we need to fix it.
    if (!(themePackage as Partial<ThemePackage>).extra) {
        themePackage.extra = {
            // @ts-expect-error -- Add missing the options container.
            thunderbird: {},
        };
    }

    return themePackage;
}

/**
 * Generates the theme properties structure by merging the possible sources.
 */
function getThemeProperties(
    themePackage: Partial<ThemePackage>,
    config?: Partial<ThunderbirdPackage>,
): Partial<ThunderbirdPackage> {
    return {
        ...themePackage.extra?.thunderbird ?? {},
        ...config ?? {},
    };
}
