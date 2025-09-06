import dedent from 'dedent';
import SeleniumHelper from '../../helpers/selenium-helper';
import RubyHelper from '../../helpers/ruby-helper';

const seleniumHelper = new SeleniumHelper();
const {
    clickXpath,
    getDriver,
    loadUri,
    urlFor
} = seleniumHelper;

const rubyHelper = new RubyHelper(seleniumHelper);
const {
    expectInterconvertBetweenCodeAndRuby
} = rubyHelper;

let driver;

describe('Ruby Tab: Looks category blocks', () => {
    beforeAll(() => {
        driver = getDriver();
    });

    afterAll(async () => {
        await driver.quit();
    });

    describe('sprite', () => {
        test('Ruby -> Code -> Ruby', async () => {
            await loadUri(urlFor('/'));

            const code = dedent`
                say("Hello!", 2)
                say("Hello!")
                think("Hmm...", 2)
                think("Hmm...")
                switch_costume("costume1")
                next_costume
                switch_backdrop("backdrop1")
                switch_backdrop("next backdrop")
                switch_backdrop("previous backdrop")
                switch_backdrop("random backdrop")
                next_backdrop
                self.size += 10
                self.size = 100
                change_effect_by("color", 25)
                change_effect_by("fisheye", 25)
                change_effect_by("whirl", 25)
                change_effect_by("pixelate", 25)
                change_effect_by("mosaic", 25)
                change_effect_by("brightness", 25)
                change_effect_by("ghost", 25)
                set_effect("color", 0)
                clear_graphic_effects
                show
                hide
                go_to_layer("front")
                go_to_layer("back")
                go_layers(1, "forward")
                go_layers(1, "backward")

                costume_number

                costume_name

                backdrop_number

                backdrop_name

                size
            `;
            await expectInterconvertBetweenCodeAndRuby(code);
        });
    });

    const looksStageRuby = dedent`
        switch_backdrop("backdrop1")
        switch_backdrop("next backdrop")
        switch_backdrop("previous backdrop")
        switch_backdrop("random backdrop")
        next_backdrop
        change_effect_by("color", 25)
        change_effect_by("fisheye", 25)
        change_effect_by("whirl", 25)
        change_effect_by("pixelate", 25)
        change_effect_by("mosaic", 25)
        change_effect_by("brightness", 25)
        change_effect_by("ghost", 25)
        set_effect("color", 0)
        clear_graphic_effects

        backdrop_number

        backdrop_name
    `;

    describe('stage', () => {
        test('Ruby -> Code -> Ruby', async () => {
            await loadUri(urlFor('/'));
            await clickXpath('//span[text()="Stage"]');
            await expectInterconvertBetweenCodeAndRuby(looksStageRuby);
        });
    });
});
