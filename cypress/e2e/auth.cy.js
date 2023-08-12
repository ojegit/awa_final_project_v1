
const baseURI = "http://localhost:3000"

describe('Auth testing', () => {

    it("Unauthorized access to '/user' should trigger redirect", ()=>{
        const options = {
            url: baseURI+"/user",
            method: "GET",
            followRedirect: false,
            failOnStatusCode: false,
        };
        
        cy.request(options).should((response) => {
            expect(response.status).to.eq(302);
        })
        
    })

    it("Unauthorized access to '/admin' should trigger redirect", ()=>{
        const options = {
            url: baseURI+"/admin",
            method: "GET",
            followRedirect: false,
            failOnStatusCode: false,
        };
        
        cy.request(options).should((response) => {
            expect(response.status).to.eq(302);
        })
        
    })
})
 
