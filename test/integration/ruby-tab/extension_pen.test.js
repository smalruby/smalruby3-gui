import dedent from 'dedent';
import SeleniumHelper from '../../helpers/selenium-helper';
import RubyHelper from '../../helpers/ruby-helper';
import {EDIT_MENU_XPATH} from '../../helpers/menu-xpaths';

const seleniumHelper = new SeleniumHelper();
const {
    getDriver,
    loadUri,
    urlFor,
    clickText,
    clickXpath
} = seleniumHelper;

const rubyHelper = new RubyHelper(seleniumHelper);
const {
    expectInterconvertBetweenCodeAndRuby,
    fillInRubyProgram,
    currentRubyProgram
} = rubyHelper;

let driver;

describe('Ruby Tab: Pen extension blocks', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    const code = dedent`
        Pen.clear
        pen.stamp
        pen.down
        pen.up
        pen.color = "#c11318"
        pen.color += 10
        pen.saturation += 10
        pen.brightness += 10
        pen.transparency += 10
        pen.color = 50
        pen.saturation = 50
        pen.brightness = 50
        pen.transparency = 50
        pen.size += 1
        pen.size = 1
    `;

    const oldCode = dedent`
        pen_clear
        pen_stamp
        pen_down
        pen_up
        self.pen_color = "#c11318"
        self.pen_color += 10
        self.pen_saturation += 10
        self.pen_brightness += 10
        self.pen_transparency += 10
        self.pen_color = 50
        self.pen_saturation = 50
        self.pen_brightness = 50
        self.pen_transparency = 50
        self.pen_size += 1
        self.pen_size = 1
    `;

    test('Ruby -> Code -> Ruby', async () => {
        await loadUri(urlFor('/'));

        await expectInterconvertBetweenCodeAndRuby(code);
    });

    test('Ruby -> Code -> Ruby (backward compatibility)', async () => {
        await loadUri(urlFor('/'));

        await clickText('Ruby', '*[@role="tab"]');
        await fillInRubyProgram(oldCode);
        await clickText('Code', '*[@role="tab"]');
        await clickXpath(EDIT_MENU_XPATH);
        await clickText('Generate Ruby from Code');
        await clickText('Ruby', '*[@role="tab"]');
        expect(await currentRubyProgram()).toEqual(`${code}\n`);
    });
});
