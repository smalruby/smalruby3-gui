import bindAll from 'lodash.bindall';
import webdriver from 'selenium-webdriver';
import {EDIT_MENU_XPATH} from './menu-xpaths';

const {By, until} = webdriver;

class RubyHelper {
    constructor (seleniumHelper) {
        bindAll(this, [
            'fillInRubyProgram',
            'currentRubyProgram',
            'dismissAlertsIfPresent',
            'expectInterconvertBetweenCodeAndRuby'
        ]);

        this.seleniumHelper = seleniumHelper;
        this.clickText = seleniumHelper.clickText;
        this.clickXpath = seleniumHelper.clickXpath;
    }

    get driver () {
        return this.seleniumHelper.driver;
    }

    currentRubyProgram () {
        return this.driver.executeScript(`return ace.edit('ruby-editor').getValue();`);
    }

    fillInRubyProgram (code) {
        code = code.replace(/\n/g, '\\n').replace(/'/g, "\\'");
        return this.driver.executeScript(`ace.edit('ruby-editor').setValue('${code}');`);
    }

    async dismissAlertsIfPresent () {
        try {
            // Find and dismiss any alert messages that have close buttons
            const alertCloseButtons = await this.driver.findElements(
                By.xpath('//div[contains(@class, "alert_alert-close-button")]')
            );
            for (const button of alertCloseButtons) {
                if (await button.isDisplayed()) {
                    await button.click();
                    await this.driver.sleep(100); // Wait for alert to be dismissed
                }
            }
        } catch (error) {
            // Ignore errors - alerts may not be present
        }
    }

    async expectInterconvertBetweenCodeAndRuby (inputCode, expectedCode = null) {
        await this.clickText('Ruby', '*[@role="tab"]');
        await this.fillInRubyProgram(inputCode);
        await this.clickText('Code', '*[@role="tab"]');
        
        // Dismiss any alerts that might be blocking subsequent clicks
        await this.dismissAlertsIfPresent();
        
        await this.clickXpath(EDIT_MENU_XPATH);
        await this.clickText('Generate Ruby from Code');
        await this.clickText('Ruby', '*[@role="tab"]');
        
        // If expectedCode is provided, use it; otherwise expect the same as input
        const expected = expectedCode !== null ? expectedCode : inputCode;
        expect(await this.currentRubyProgram()).toEqual(`${expected}\n`);
    }
}

export default RubyHelper;
