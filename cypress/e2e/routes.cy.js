const baseURI = "http://localhost:3000"

describe('Routes testing', () => {

    //The page doesn't load because route doesn't exist
    it("Route '/ABCD' should not exist: expecting 404", () => {
        const options = {
            url: baseURI+"/ABCD",
            method: "GET",
            failOnStatusCode: false,
        }
        cy.request(options).should((response) => {
            expect(response.status).to.eq(404);
        })
    })

    it("Route '/' should exist: expecting 200 after redirect", () => {
        const options = {
            url: baseURI+"/",
            method: "GET",
            failOnStatusCode: false,
        }
        cy.request(options).should((response) => {
            expect(response.status).to.eq(200);
        })
    })

    it("Route '/user' should exist: expecting 200 after redirect", () => {
        const options = {
            url: baseURI+"/user",
            method: "GET",
            failOnStatusCode: false,
        }
        cy.request(options).should((response) => {
            expect(response.status).to.eq(200);
        })
    })

    
    it("Route '/search' should exist: expecting 200 after redirect",()=>{
        const body = {
            query: ""
        }
        const options = {
            url: baseURI+"/search",
            method: "POST",
            body: body
        }
        cy.request(options).should((response) => {
            expect(response.status).to.eq(200);
        })
    })


    it("Route '/admin' should exist: expecting 200 after redirect", () => {
        const options = {
            url: baseURI+"/admin",
            method: "GET",
            failOnStatusCode: false,
        }
        cy.request(options).should((response) => {
            expect(response.status).to.eq(200);
        })
    })


})
