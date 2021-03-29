const puppeteer = require('puppeteer');
function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: false})
  const page = await browser.newPage()
  
  const navigationPromise = page.waitForNavigation()
  await page.setRequestInterception(true);
  page.on('request', async request => {
        let responseBody;
        if (request.redirectChain().length === 0) {
            // body can only be access for non-redirect responses
            //responseBody = await request.buffer();
        }

        const information = {
            url: request.url(),
            requestHeaders: request.headers(),
            requestPostData: request.postData(),
            //requestBody,
        };
        console.log(information);
        request.continue();
  });
  await page.goto('https://www.mondou.com/fr-CA/p-tour-rocket-pour-chats-bleu/1035454-MASTER/1035454')
  
  await page.setViewport({ width: 1906, height: 922 })
  
  await page.waitForSelector('#searchbox > .CoveoSearchbox > .CoveoOmnibox > .magic-box-input > input')
  await page.click('#searchbox > .CoveoSearchbox > .CoveoOmnibox > .magic-box-input > input')
  await page.type('#searchbox > .CoveoSearchbox > .CoveoOmnibox > .magic-box-input > input','chat');
  await page.type('#searchbox > .CoveoSearchbox > .CoveoOmnibox > .magic-box-input > input',String.fromCharCode(13));
  
  //await page.waitForSelector('#searchbox > .CoveoSearchbox > .CoveoOmnibox > .magic-box-input > input')
  //await page.click('#searchbox > .CoveoSearchbox > .CoveoOmnibox > .magic-box-input > input')
  
  await navigationPromise
  
  await delay(4000);
  await page.waitForSelector('.coveo-card-layout:nth-child(1) > .coveo-result-frame > .coveo-result-row > .CoveoResultLink > .CoveoImageFieldValue > span > img')
  await page.click('.coveo-card-layout:nth-child(1) > .coveo-result-frame > .coveo-result-row > .CoveoResultLink > .CoveoImageFieldValue > span > img')
  
  await navigationPromise
  
  await delay(4000);
  await page.waitForSelector('.form-group > .input-group > .input-group-btn > .btn > .fa-plus')
  await page.click('.form-group > .input-group > .input-group-btn > .btn > .fa-plus')
  
  await page.waitForSelector('span #addToCartMsg')
  await page.click('span #addToCartMsg')
  
  await delay(4000);
  await page.waitForSelector('.minicart-notification-summary-footer > .minicart-notification-summary-controls > .row > .col-sm-12 > .btn')
  await page.click('.minicart-notification-summary-footer > .minicart-notification-summary-controls > .row > .col-sm-12 > .btn')
  
  await navigationPromise
  
  await browser.close()
})()