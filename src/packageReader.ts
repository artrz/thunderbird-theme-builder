import storage from './storage.js';

export default function packageReader(config?: Partial<ThunderbirdPackage>): ThemePackage {
    const themePackage = getThemePackage();
    const props = getConfig(themePackage, config);

    // Reconfigure to contain all the configured values or defaults.
    themePackage.extra.thunderbird = {
        name: props.name ?? themePackage.displayName ?? themePackage.name,
        version: props.version ?? themePackage.version,
        themeId: props.themeId ?? `${themePackage.name}@addons.thunderbird.net`,
        thunderbirdMinVersion: props.thunderbirdMinVersion ?? '115.0',
        stylesPath: props.stylesPath,
        author: {
            name: props.author?.name ?? themePackage.author?.name,
            url: props.author?.url ?? themePackage.author?.url,
        },
        srcDir: props.srcDir ?? 'src',
        outDir: props.outDir ?? 'build',
        assetsDir: props.assetsDir,
    };

    return themePackage;
}

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

function getConfig(
    themePackage: Partial<ThemePackage>,
    config?: Partial<ThunderbirdPackage>,
): Partial<ThunderbirdPackage> {
    return {
        ...themePackage.extra?.thunderbird ?? {},
        ...config ?? {},
    };
}
