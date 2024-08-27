import assert from 'assert';
import { build } from '../main.js';
import { existsSync } from 'fs';
import { join } from 'path';

describe('App', () => {
    describe('#build()', () => {
        it('should generate the xpi file', () => {
            const themeConfig = { color_scheme: { color_1: '#336699' } };

            build(themeConfig);

            const location = join(import.meta.dirname, '..', '..', 'build', 'thunderbird-theme-builder.xpi');

            assert.strict.equal(existsSync(location), true);
        });
    });
});
