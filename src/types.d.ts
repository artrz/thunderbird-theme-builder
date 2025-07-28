/**
 * The Thunderbird manifest structure.
 */
interface Manifest {
    manifest_version: number;
    name: string;
    version: string;
    description?: string;
    author?: string;
    homepage_url?: string;
    browser_specific_settings: {
        gecko: {
            id: string;
            strict_min_version: string;
            strict_max_version: string;
        };
    };
    theme: {
        colors: ThemeColors;
        images?: Record<string, string>;
    };
    theme_experiment: {
        stylesheet?: string;
        colors: ThemeExperimentColors;
    };
}

type ThemeColors = Record<string, string>;

type ThemeExperimentColors = Record<string, string>;

interface ThemeConfig {
    color_scheme: ColorScheme;
    theme_colors?: Record<string, string>;
    theme_experiment_colors?: Record<string, string>;
    images?: Record<string, string>;
}

type ColorScheme = Record<string, string>;

interface GeneratedThemeColors {
    colors: ThemeColors;
    experimentColors: ThemeExperimentColors;
}

interface ReadFile {
    content: string;
    filename: string;
}

/**
 * The package.json file structure.
 */
interface ThemePackage {
    name: string;
    version: string;
    displayName?: string;
    description?: string;
    author?: {
        name?: string;
        url?: string;
    };
    homepage?: string;
    extra: {
        thunderbird: ThunderbirdPackage;
    };
}

/**
 * The configuration structure.
 */
interface ThunderbirdPackage {
    name: string;
    themeId: string;
    version: string;
    thunderbirdMinVersion: string;
    thunderbirdMaxVersion: string;
    stylesPath?: string | string[];
    author: {
        name?: string;
        url?: string;
    };
    homepage?: string;
    srcDir: string;
    outDir: string;
    assetsDir?: string;
}
