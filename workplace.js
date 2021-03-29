// npm install puppeteer
// npm i -S image-hash
// npm install node-salesforce
const request = require("request");
const puppeteer = require("puppeteer");
var fs = require('fs');
 
const waitbetweenclick = 500;
const justwait = 400;
let browser; //= await puppeteer.launch();
let page;
let actions;
let prevRND = 1;
let url = '';
let prevPath = 0;

class GetPages {
  constructor() {
  }


  sleeper(timeout) {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  getRandomInt(min, max) {
    let number = Math.floor(Math.random() * Math.floor(10));
    if (number<min) number=min;
    if (number>max) number = max;
    while (prevRND == number) number=this.getRandomInt(min, max);
    return number;
  }

  getRandomNr(max) {
    let number = Math.floor(Math.random() * Math.floor(10));
    if (number==0) number = 1;
    if (number>max) number = max;
    return number;
  }

  getRandomWait() {
    let number = Math.floor(Math.random() * Math.floor(16000));
    while (number<5000) number=this.getRandomWait();
    return number;
  }

  async doSelectorClick(selector){
    //Replace RND with value between 1 and 5
    let RND = 0;
    if (selector.includes('RND2')){
      RND = this.getRandomInt(2,6);
      selector = selector.replace('RND2',RND).trim();
    } else
    if (selector.includes('RND')) {
      RND = this.getRandomInt(1,5);
      selector = selector.replace('RND',RND).trim();
    }
    
    
    try {
      await page.evaluate((selector) => {
      let element = document.querySelectorAll('.CoveoQuickview');
      element.forEach((el)=> {
        el.setAttribute('style','display:block');
      });
      element = document.querySelectorAll('.CoveoEditWidget');
      element.forEach((el)=> {
        el.setAttribute('style','display:inherit');
      });
      });
      await page.click(selector);
      await page.waitForSelector('.CoveoResultLink', { timeout: 500 });
    } catch(e){
      if (test) console.log(e);
    }
    if (test) await this.sleeper(5000); else await this.sleeper(justwait);
    //await this.sleeper(waitbetweenclick*3);
    return selector;
  }

  async doSelectorClickFast(selector){
    try {
      
      await page.click(selector.trim());
    }
    catch {

    }
    await this.sleeper(waitbetweenclick);
  }

  async doSession(thisurl, keyword, noofpaths, fixpath) {

    let mybrowser = await puppeteer.launch({ headless: false});//, args: [ '--proxy-server=https=88.99.149.188:31288' ]});
    page = await mybrowser.newPage();
    thisurl = thisurl.replace('KEYWORDS',keyword);
    console.log(thisurl);
    await page.setViewport({ width: 1580, height: 1800 });
    await page.goto(thisurl, {
      waitUntil: "networkidle0",
      timeout: 0
    });
    //await page.waitForSelector('.coveo-pager-list');
    //await page.waitForSelector('.CoveoResult');
    let prev='';
    let paththochoose = 0;
    if (test) { paththochoose = prevPath;prevPath = prevPath+1; if (prevPath>noofpaths) prevPath=1; } else {
      paththochoose = this.getRandomNr(noofpaths);
    }
    if (test && fixpath!='') {
      paththochoose = fixpath;
    }
    console.log('Path: '+paththochoose);
    for (let value of actions) {
      value = value.replace('\r','');
      if (value.trim() != '') {
        let doit=value.split(',');
        let path= doit[0].trim();
        if (path=='A' || path==paththochoose){
          if (doit[1].trim()=='FAST') {
            console.log('FAST CLICK:'+doit[2]);
            await this.doSelectorClickFast(doit[2]);    
          }
          else if (doit[1].trim()=='SLEEP') {
            await this.sleeper(Number(doit[2]));
          }
          
          else if (doit[1].trim()=='TYPE') {
            console.log('TYPE:'+keyword);
            try {
            await page.type(
              doit[2].trim(),
              keyword
            );
          } catch (e)
          {

          }
          }
          else if (doit[1].trim()=='TYPET') {
            console.log('TYPET:'+doit[3].trim());
            try {
            await page.type(
              doit[2].trim(),
              doit[3].trim()
            );
            } catch (e)
            {

            }
          }
          else if (doit[1].trim()=='SELECT') {
            console.log('SELECT:'+doit[3].trim());
            try {
            await page.select(
              doit[2].trim(),
              doit[3].trim()
            );
            } catch (e)
            {

            }
          }
          else if (doit[1].trim()=='URL') {
            url = doit[2].trim();
            thisurl = thisurl.replace('KEYWORDS',keyword);
            console.log('CHANGING URL to:'+url);
            await page.goto(thisurl, {
              waitUntil: "networkidle0",
              timeout: 0
            });
            //await page.waitForSelector('.CoveoResult');
          }
          else if (doit[1].trim()=='NORMAL') {
            console.log('NORMAL CLICK:'+doit[2]);
            if (doit[2].trim()=='PREV') {
              page.$
              prev = await this.doSelectorClick(prev);
            } else {
              prev = await this.doSelectorClick(doit[2]);
            }
          } else {
            console.log(value);
          }
        }
      }
    }

    //await this.sleeper(waitbetweenclick*3);
    await mybrowser.close();

  }

  async getFirstURL(actions){
    for (let value of actions) {
      value = value.replace('\r','');
      if (value.trim() != '') {
        let doit=value.split(',');
        if (doit[1].trim()=='URL') {
          url = doit[2].trim();
          return;
        }
      }
    }
  }

  async getNoOfActions(actions){
    let allactions=[];
    for (let value of actions) {
      value = value.replace('\r','');
      if (value.trim() != '') {
        let doit=value.split(',');
        if (doit[0].trim()!='A'){
          allactions.push(doit[0].trim());
        }
      }
    }
    let unique = [...new Set(allactions)]; 
    return unique.length;
  }

  async doprocess() {
    let touse='';
    let path = '';
    try {
      touse=process.argv[2];
      if (touse==undefined) touse='';
      path=process.argv[3];
      if (path==undefined) path='';
    }catch(e){

    }
    actions = fs.readFileSync('actions'+touse+'.txt', 'utf8').split('\n');
    var keywords = fs.readFileSync('keywords'+touse+'.txt', 'utf8').split('\n');
    let numberstoprocess = inspect.getRandomInt(keywords.length);
    let counter = 0;
    let noofpaths = await this.getNoOfActions(actions);
    console.log("Number of keywords: "+keywords.length);
    console.log("Number of actions : "+actions.length);
    console.log("Number of paths   : "+noofpaths);
    console.log("Testing           : "+test);
    url = '';
    await this.getFirstURL(actions);
    if (url=='') {
      console.log('No URL found in actions.txt');
      return;
    }
    let firsturl=url;
    prevPath = 1;
    console.log(keywords);
    while (1) {
        for (let value of keywords) {
          value = value.replace('\r','');
          counter = counter + 1;
          
          await inspect.doSession(firsturl, value, noofpaths,path);
          if (counter>numberstoprocess) break;
        }
      let wait = inspect.getRandomWait();
      await inspect.sleeper(wait);
    }
  }

  async start() {
    await inspect.doprocess();
  }
}

let inspect = new GetPages();
let test = true;
inspect.start();
