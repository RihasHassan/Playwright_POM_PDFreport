// @ts-check
const { test, expect } = require('@playwright/test');
const{collectiePage}=require('../POM/collectionPage')
const{homePage}=require('../POM/homePage')


const expectedDataJson=require('../ExpectedData.json')


test.describe('Test case suite',()=>{

let page
let context
let homePageObj
let collectiePageobj

test.beforeAll(async({browser})=>{


context=await browser.newContext()
page=await browser.newPage()


homePageObj=new homePage(page)
collectiePageobj=new collectiePage(page)


})


test.afterEach(async ({},testInfo) => {

  let result = testInfo.status
  let testName = testInfo.title
  testName = testName.replace(/[^a-zA-Z0-9]/g, '');

  if (result === 'failed' || result === 'passed') {
      
  const screenshot = await page.screenshot({path: './screenshots/'+testName+'.png',fullPage: true });
  }
   await page.waitForTimeout(1000)

})
test('Verify that user Go to the collection search by clicking in the link -> Ontdek de collectie', async () => {

  await page.goto('/');
  await collectiePageobj.cookieAlert()
  await homePageObj.clickOnLink('Ontdek de collectie')
  await page.url().includes('collectie') //verifying that user is on collectie page or not 

});

test('Verify that search reult for Het Gele Huis is more than 700 results',async()=>{

  await page.goto('/nl/collectie')
  await collectiePageobj.cookieAlert()
  await collectiePageobj.searchWithItem(expectedDataJson.SearchingItem)
  let count =await collectiePageobj.searchResultCount()
  expect(count).toBeGreaterThan(700)

  })

test('Verify the details of painting selected from search list of Het Gele Huis',async()=>{
      
  await page.goto('/nl/collectie')
  await collectiePageobj.cookieAlert()
  await collectiePageobj.searchWithItem(expectedDataJson.SearchingItem)
  await collectiePageobj.clicksOnFirstProduct()
  await collectiePageobj.clicksOnObjectgegevens()
  await expect(await collectiePageobj.getFnumber()).toBeVisible()
  await expect(await collectiePageobj.getJH_nummer()).toBeVisible()
  await expect(await collectiePageobj.getInventarisnummer()).toBeVisible()
})

test.afterAll(async()=>{

await page.close()
})

})