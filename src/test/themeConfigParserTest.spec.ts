import { expect } from 'chai';
import themeConfigParser from '../themeConfigParser.js';

describe('themeConfigParser', () => {
    describe('#parse()', () => {
        it('should contain expected properties', () => {
            const themeConfig = {
                color_scheme: { color_1: '#336699' },
                theme_colors: { button_background_active: 'color_1' },
                theme_experiment_colors: { '--primary': 'color_1' },
            };

            const expected = {
                colors: {
                    button_background_active: '#336699', // Replaced color value
                    color_1__primary: '#336699', // (1) Register the color so the configured experiment color can use it.
                    color_1: '#336699', // (2) Register the color to be used as experiment color.
                },
                experimentColors: {
                    color_1__primary: '--primary', // (1) Configured color is registered with the previously mapped key.
                    color_1: '--color_1', // (2) Color available as a general experiment color.
                },
            };

            const generated = themeConfigParser.parse(themeConfig);
            expect(generated).to.deep.equal(expected);
        });
    });
});
