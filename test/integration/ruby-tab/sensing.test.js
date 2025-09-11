import dedent from 'dedent';
import SeleniumHelper from '../../helpers/selenium-helper';
import RubyHelper from '../../helpers/ruby-helper';

const seleniumHelper = new SeleniumHelper();
const {
    clickText,
    clickXpath,
    scope,
    getDriver,
    loadUri,
    notExistsByXpath,
    urlFor
} = seleniumHelper;

const rubyHelper = new RubyHelper(seleniumHelper);
const {
    expectInterconvertBetweenCodeAndRuby
} = rubyHelper;

let driver;

describe('Ruby Tab: Sensing category blocks', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    describe('sprite', () => {
        test('Ruby -> Code -> Ruby', async () => {
            await loadUri(urlFor('/'));
            await notExistsByXpath('//*[div[contains(@class, "loader_background")]]');
            await clickXpath('//button[@aria-label="Choose a Sprite"]');
            await clickText('Abby', scope.modal);
            await clickText('Sprite1', scope.spriteItems);

            const code = dedent`
                touching?("_mouse_")

                touching?("_edge_")

                touching?("Abby")

                touching_color?("#f0765e")

                color_is_touching_color?("#da343f", "#3dd46a")

                distance("_mouse_")

                distance("Abby")

                ask("What's your name?")

                answer

                Keyboard.pressed?("space")

                Mouse.down?

                Mouse.x

                Mouse.y

                self.drag_mode = "draggable"
                self.drag_mode = "not draggable"

                loudness

                Timer.value

                Timer.reset

                stage.backdrop_number

                sprite("Abby").y

                stage.backdrop_name

                stage.volume

                stage.variable("my variable")

                sprite("Abby").x

                sprite("Abby").direction

                sprite("Abby").costume_number

                sprite("Abby").costume_name

                sprite("Abby").size

                sprite("Abby").volume

                Time.now.year

                Time.now.month

                Time.now.day

                Time.now.wday + 1

                Time.now.hour

                Time.now.min

                Time.now.sec

                days_since_2000

                user_name
            `;
            await expectInterconvertBetweenCodeAndRuby(code);
        });
    });

    describe('stage', () => {
        const code = dedent`
            ask("What's your name?")

            answer

            Keyboard.pressed?("space")

            Mouse.down?

            Mouse.x

            Mouse.y

            loudness

            Timer.value

            Timer.reset

            stage.backdrop_number

            stage.backdrop_name

            stage.volume

            stage.variable("my variable")

            Time.now.year

            Time.now.month

            Time.now.day

            Time.now.wday + 1

            Time.now.hour

            Time.now.min

            Time.now.sec

            days_since_2000

            user_name
        `;

        test('Ruby -> Code -> Ruby', async () => {
            await loadUri(urlFor('/'));
            await clickXpath('//span[text()="Stage"]');
            await expectInterconvertBetweenCodeAndRuby(code);
        });
    });
});
