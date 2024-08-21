import storage from './storage';

export default function packageReader(config?: Partial<ThunderbirdPackage>): ThemePackage {
    const themePackage = getThemePackage();
    const props = getConfig(themePackage, config);

    // Reconfigure to contain all the configured values or defaults.
    themePackage.extra.thunderbird = {
        name: props.name ?? themePackage.displayName ?? themePackage.name,
        version: props.version ?? themePackage.version,
        themeId: props.themeId ?? `${themePackage.name}@addons.thunderbird.net`,
        thunderbirdMinVersion: props.thunderbirdMinVersion ?? '115.0',
        stylesheet: props.stylesheet,
        author: {
            name: props.author?.name ?? themePackage.author?.name,
            url: props.author?.url ?? themePackage.author?.url,
        },
        srcDir: props.srcDir ?? 'src',
        outDir: props.outDir ?? 'build',
    };

    return themePackage;
}

function getThemePackage(): ThemePackage {
    const themePackage: ThemePackage = JSON.parse(storage.readFile('package.json'));

    if (!(themePackage as Partial<ThemePackage>).extra) {
        themePackage.extra = {
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
