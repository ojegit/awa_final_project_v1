const baseURI = "http://localhost:3000"

describe('Express validator middleware testing', () => {

    it("Attempted login with email and password not meeting validator requirements", ()=>{
        const body = {
            email: "abcd123",
            password: "qwerT3"
        }
        const options = {
            url: baseURI+"/login",
            method: "POST",
            body: body,
            followRedirect: false,
            failOnStatusCode: false,
        };
        
        cy.request(options).should((response) => {
            expect(response.status).to.eq(422);
        })
        
    })

    it("Attempted register with email and password not meeting validator requirements", ()=>{
        const body = {
            email: "abcd123",
            password: "qwerT3"
        }
        const options = {
            url: baseURI+"/register",
            method: "POST",
            body: body,
            followRedirect: false,
            failOnStatusCode: false,
        };
        
        cy.request(options).should((response) => {
            expect(response.status).to.eq(422);
        })
        
    })

})