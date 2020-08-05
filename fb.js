let puppeteer = require("puppeteer");
let cFile = process.argv[2];
let pageName = process.argv[3];
let nOfPost = process.argv[4];
let fs = require("fs");
(async function () {
  let credentialFile = await fs.promises.readFile(cFile);
  let { user, pwd, url } = JSON.parse(credentialFile);
  let browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized", "--disable-notifications"]
  });
  let tabs = await browser.pages();
  let tab = tabs[0];
  // normal => networkidle0
  // front end heavy => networkidle2
  await tab.goto(url, { waitUntil: "networkidle2" });
  await tab.waitForSelector("input[type=email]");
  await tab.type("input[type=email]", user, { delay: 120 });
  await tab.type("input[type=password]", pwd, { delay: 120 });
  //  click => cause navigation wrap in Promise.all
  await Promise.all([
    tab.click("input[type=submit]", { delay: 120 }),
    tab.waitForNavigation({ waitUntil: "networkidle2" })
  ])
  // home page
  // _1frb
  await tab.waitForSelector("._1frb");
  await tab.type("._1frb", pageName, { delay: 120 });
  await tab.keyboard.press("Enter");
  await tab.waitForNavigation({ waitUntil: "networkidle2" });
  // serach page
  await tab.waitForSelector("li[data-edge=keywords_pages]");
  await Promise.all([tab.click("li[data-edge=keywords_pages] a"),
  tab.waitForNavigation({ waitUntil: "networkidle2" })]);
  await tab.waitForSelector("._1glk._6phc.img");
  await Promise.all([
    tab.waitForNavigation({ waitUntil: "networkidle2" }),
    tab.click("._1glk._6phc.img")
  ])
  // await 
  await tab.waitForSelector("div[data-key=tab_posts]");
  await Promise.all([
    tab.click("div[data-key=tab_posts]"),
    tab.waitForNavigation({ waitUntil: "networkidle2" })
  ])
  await tab.waitForNavigation({ waitUntil: "networkidle2" });
  // post page
  //  like 
  // post like => best approach 
  // 20 post => 7=> 
  let idx = 0;
  do {
    //  all posts => request , time => page -> element display
    // present -> 1xnd => 7post
    await tab.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");
    //  get all post 
    let posts = await tab.$$("#pagelet_timeline_main_column ._1xnd>._4-u2._4-u8");
    let cPOst = posts[idx];
    let likeBtn = await cPOst.$("._666k ._8c74");
    await likeBtn.click({delay:120});
    // loader=> data 
    await tab.waitForSelector(".uiMorePagerLoader.pam.uiBoxLightblue", { hidden: true });
    idx++;
  } while (idx < nOfPost)
})();