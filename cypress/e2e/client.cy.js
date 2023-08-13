
const baseURI = "http://localhost:3000"

describe('Client side testing', () => {

    it("id=\"main-content\" exists on '/'", ()=>{
        cy.visit('http://localhost:3000/')
        cy.get('#main-content').should('exist');
    })

    it("id=\"main-navbar-search\" exists on '/'", ()=>{
        cy.visit('http://localhost:3000/')
        cy.get('#main-navbar-search').should('exist');
    })
    
    it("id=\"main-navbar-search\" exists on '/'", ()=>{
        cy.visit('http://localhost:3000/')
        cy.get('#main-navbar-search').should('exist');
    })
    
    it("id=\"main-navbar-locales\" exists on '/'", ()=>{
        cy.visit('http://localhost:3000/')
        cy.get('#main-navbar-locales').should('exist');
    })    

    it("id=\"login-form\" exists on '/login'", ()=>{
        cy.visit('http://localhost:3000/login')
        cy.get('#login-form').should('exist');
    })
    
    it("id=\"submitRegister\" exists on '/register'", ()=>{
        cy.visit('http://localhost:3000/register')
        cy.get('#submitRegister').should('exist');
    })

})

