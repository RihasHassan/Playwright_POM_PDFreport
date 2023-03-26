

export class collectiePage{

    constructor(page)
    {

        this.page=page
    

    this.searchField_locator=this.page.locator('.search-field-input')
    this.searchButton_locator=this.page.locator('button[type="submit"]')
    this.searchResultCount_Locator=this.page.locator('.results')
    
    this.firstProduct_Locator=this.page.locator('(//div[@class="collection-art-object-list-item"])[1]//img')
    
    this.ObjectgegevensBtn=this.page.getByRole('button', { name: 'Open Objectgegevens' })
    this.F_number_Locator=this.page.getByText('F-nummer')
    this.JH_nummer_Locator=this.page.getByText('JH-nummer')
    this.Inventarisnummer_Locator=this.page.getByText('Afmetingen')
    
    }

    async cookieAlert()
    {

        await this.page.locator('//button[contains(@class,"cookie-banner-button") and contains(text(),"Akkoord")]')
        .click()
    }
    async searchWithItem(searchingItem)    
    
    {
          await this.searchField_locator.first().type(searchingItem,{force: true})
          await this.searchButton_locator.click({force: true})
          
    }
    
    async searchResultCount()
    {
    
         let count=await this.searchResultCount_Locator.textContent()//.trim()  
         let number =parseInt(count.replace(/[^a-zA-Z0-9 .]/g, ''))
          return number


    }
   
    async clicksOnFirstProduct()
    {
        await this.firstProduct_Locator.first().click({force:true})
        
    }
    

    
    async clicksOnObjectgegevens()
    {
            await this.ObjectgegevensBtn.click({ force: true })
    }


    getFnumber()
    {

 return this.F_number_Locator
    }

     getJH_nummer()
    {

        return this.JH_nummer_Locator
    }

    async getInventarisnummer()
    {
        return this.Inventarisnummer_Locator
        
    }
    

    
    
    
    }