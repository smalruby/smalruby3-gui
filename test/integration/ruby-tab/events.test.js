import dedent from 'dedent';
import SeleniumHelper from '../../helpers/selenium-helper';
import RubyHelper from '../../helpers/ruby-helper';
import {EDIT_MENU_XPATH} from '../../helpers/menu-xpaths';

const seleniumHelper = new SeleniumHelper();
const {
    clickText,
    clickXpath,
    getDriver,
    loadUri,
    urlFor
} = seleniumHelper;

const rubyHelper = new RubyHelper(seleniumHelper);
const {
    fillInRubyProgram,
    currentRubyProgram,
    expectInterconvertBetweenCodeAndRuby
} = rubyHelper;

let driver;

describe('Ruby Tab: Events category blocks', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    const eventsRuby = dedent`
        when_flag_clicked do
          bounce_if_on_edge
        end

        when_key_pressed("space") do
          bounce_if_on_edge
        end

        when_key_pressed("any") do
          bounce_if_on_edge
          move(10)
        end

        when_key_pressed("a") do
        end

        when_clicked do
          bounce_if_on_edge
        end

        when_clicked do
          bounce_if_on_edge
          move(10)
        end

        when_backdrop_switches("backdrop1") do
          bounce_if_on_edge
        end

        when_backdrop_switches("backdrop1") do
          bounce_if_on_edge
          move(10)
        end

        when_greater_than("loudness", 10) do
        end

        when_greater_than("loudness", 10) do
          bounce_if_on_edge
        end

        when_greater_than("timer", x) do
          bounce_if_on_edge
          move(10)
        end

        when_receive("message1") do
        end

        when_receive("message1") do
          bounce_if_on_edge
        end

        when_receive("message1") do
          bounce_if_on_edge
          move(10)
        end

        broadcast("message1")
        broadcast(x)
        broadcast_and_wait("message1")
        broadcast_and_wait(x)
    `;

    const eventsOldRuby = dedent`
        self.when(:flag_clicked) do
          bounce_if_on_edge
        end

        self.when(:key_pressed, "space") do
          bounce_if_on_edge
        end

        self.when(:key_pressed, "any") do
          bounce_if_on_edge
          move(10)
        end

        self.when(:key_pressed, "a") do
        end

        self.when(:clicked) do
          bounce_if_on_edge
        end

        self.when(:clicked) do
          bounce_if_on_edge
          move(10)
        end

        self.when(:backdrop_switches, "backdrop1") do
          bounce_if_on_edge
        end

        self.when(:backdrop_switches, "backdrop1") do
          bounce_if_on_edge
          move(10)
        end

        self.when(:greater_than, "loudness", 10) do
        end

        self.when(:greater_than, "loudness", 10) do
          bounce_if_on_edge
        end

        self.when(:greater_than, "timer", x) do
          bounce_if_on_edge
          move(10)
        end

        self.when(:receive, "message1") do
        end

        self.when(:receive, "message1") do
          bounce_if_on_edge
        end

        self.when(:receive, "message1") do
          bounce_if_on_edge
          move(10)
        end

        broadcast("message1")
        broadcast(x)
        broadcast_and_wait("message1")
        broadcast_and_wait(x)
    `;

    describe('sprite', () => {
        test('Ruby -> Code -> Ruby', async () => {
            await loadUri(urlFor('/'));
            await expectInterconvertBetweenCodeAndRuby(eventsRuby);
        });

        test('Ruby -> Code -> Ruby (backward compatibility) ', async () => {
            await loadUri(urlFor('/'));

            await clickText('Ruby', '*[@role="tab"]');
            await fillInRubyProgram(eventsOldRuby);
            await clickText('Code', '*[@role="tab"]');
            await clickXpath(EDIT_MENU_XPATH);
            await clickText('Generate Ruby from Code');
            await clickText('Ruby', '*[@role="tab"]');
            expect(await currentRubyProgram()).toEqual(`${eventsRuby}\n`);
        });
    });

    const eventsStageRuby = dedent`
        when_flag_clicked do
          switch_backdrop("backdrop1")
        end

        when_key_pressed("space") do
          switch_backdrop("backdrop1")
        end

        when_clicked do
          switch_backdrop("backdrop1")
        end

        when_backdrop_switches("backdrop1") do
          switch_backdrop("backdrop1")
        end

        when_greater_than("loudness", 10) do
          switch_backdrop("backdrop1")
        end

        when_receive("message1") do
          switch_backdrop("backdrop1")
        end

        broadcast("message1")
        broadcast_and_wait("message1")
    `;

    const eventsStageOldRuby = dedent`
        self.when(:flag_clicked) do
          switch_backdrop("backdrop1")
        end

        self.when(:key_pressed, "space") do
          switch_backdrop("backdrop1")
        end

        self.when(:clicked) do
          switch_backdrop("backdrop1")
        end

        self.when(:backdrop_switches, "backdrop1") do
          switch_backdrop("backdrop1")
        end

        self.when(:greater_than, "loudness", 10) do
          switch_backdrop("backdrop1")
        end

        self.when(:receive, "message1") do
          switch_backdrop("backdrop1")
        end

        broadcast("message1")
        broadcast_and_wait("message1")
    `;

    describe('stage', () => {
        test('Ruby -> Code -> Ruby', async () => {
            await loadUri(urlFor('/'));
            await clickXpath('//span[text()="Stage"]');
            await expectInterconvertBetweenCodeAndRuby(eventsStageRuby);
        });

        test('Ruby -> Code -> Ruby (backward compatibility) ', async () => {
            await loadUri(urlFor('/'));
            await clickXpath('//span[text()="Stage"]');

            await clickText('Ruby', '*[@role="tab"]');
            await fillInRubyProgram(eventsStageOldRuby);
            await clickText('Code', '*[@role="tab"]');
            await clickXpath(EDIT_MENU_XPATH);
            await clickText('Generate Ruby from Code');
            await clickText('Ruby', '*[@role="tab"]');
            expect(await currentRubyProgram()).toEqual(`${eventsStageRuby}\n`);
        });
    });

});
