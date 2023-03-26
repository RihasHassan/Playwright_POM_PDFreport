
export class homePage{

    constructor(page)
    {
        this.page=page
    


    this.Clicking_Link_Locator=this.page.locator('.cta-list-item a')

    }

    async clickOnLink(clicksOn)    

	{    

          await this.page.getByText(clicksOn).click({ force: true })

    }






}