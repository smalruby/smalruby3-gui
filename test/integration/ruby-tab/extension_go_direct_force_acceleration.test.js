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

describe('Ruby Tab: Go Direct Force & Acceleration extension blocks', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    const code = dedent`
        gdx_for.when_gesture("shaken") do
        end

        gdx_for.when_gesture("started falling") do
        end

        gdx_for.when_gesture("turned face up") do
        end

        gdx_for.when_gesture("turned face down") do
        end

        gdx_for.when_sensor("pushed") do
        end

        gdx_for.when_sensor("pulled") do
        end

        gdx_for.force

        gdx_for.when_tilted("any") do
        end

        gdx_for.when_tilted("front") do
        end

        gdx_for.when_tilted("back") do
        end

        gdx_for.when_tilted("left") do
        end

        gdx_for.when_tilted("right") do
        end

        gdx_for.tilted?("any")

        gdx_for.tilt_angle("front")

        gdx_for.falling?

        gdx_for.spin_speed("z")

        gdx_for.spin_speed("x")

        gdx_for.spin_speed("y")

        gdx_for.acceleration("x")
    `;

    const oldCode = dedent`
        self.when(:gdx_for_gesture, "shaken") do
        end

        self.when(:gdx_for_gesture, "started falling") do
        end

        self.when(:gdx_for_gesture, "turned face up") do
        end

        self.when(:gdx_for_gesture, "turned face down") do
        end

        self.when(:gdx_force_sensor, "pushed") do
        end

        self.when(:gdx_force_sensor, "pulled") do
        end

        gdx_for_force

        self.when(:gdx_for_tilted, "any") do
        end

        self.when(:gdx_for_tilted, "front") do
        end

        self.when(:gdx_for_tilted, "back") do
        end

        self.when(:gdx_for_tilted, "left") do
        end

        self.when(:gdx_for_tilted, "right") do
        end

        gdx_for_tilted?("any")

        gdx_for_tilt_angle("front")

        gdx_for_falling?

        gdx_for_spin_speed("z")

        gdx_for_spin_speed("x")

        gdx_for_spin_speed("y")

        gdx_for_acceleration("x")
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
