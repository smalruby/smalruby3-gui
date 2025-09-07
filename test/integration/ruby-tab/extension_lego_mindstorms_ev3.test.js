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

describe('Ruby Tab: LEGO MINDSTORMS EV3 extension blocks', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    const code = dedent`
        ev3.motor_turn_this_way_for("A", 1)
        ev3.motor_turn_this_way_for("B", 1)
        ev3.motor_turn_this_way_for("C", 1)
        ev3.motor_turn_this_way_for("D", 1)
        ev3.motor_turn_that_way_for("A", 1)
        ev3.motor_set_power("A", 100)

        ev3.motor_position("A")

        ev3.when_button_pressed("1") do
        end

        ev3.when_button_pressed("2") do
        end

        ev3.when_button_pressed("3") do
        end

        ev3.when_button_pressed("4") do
        end

        ev3.when_distance_lt(5) do
        end

        ev3.when_brightness_lt(50) do
        end

        ev3.button_pressed?("1")

        ev3.distance

        ev3.brightness

        ev3.beep_note(60, 0.5)
    `;

    const oldCode = dedent`
        ev3_motor_turn_this_way_for("A", 1)
        ev3_motor_turn_this_way_for("B", 1)
        ev3_motor_turn_this_way_for("C", 1)
        ev3_motor_turn_this_way_for("D", 1)
        ev3_motor_turn_that_way_for("A", 1)
        ev3_motor_set_power("A", 100)

        ev3_motor_position("A")

        self.when(:ev3_button_pressed, "1") do
        end

        self.when(:ev3_button_pressed, "2") do
        end

        self.when(:ev3_button_pressed, "3") do
        end

        self.when(:ev3_button_pressed, "4") do
        end

        self.when(:ev3_distance_gt, 5) do
        end

        self.when(:ev3_brightness_gt, 50) do
        end

        ev3_button_pressed?("1")

        ev3_distance

        ev3_brightness

        ev3_beep_note(60, 0.5)
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
