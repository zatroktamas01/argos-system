/// <reference types="cypress" />
/* eslint-disable no-undef */

describe('Create Ticket', () => {
  it('should create a ticket successfully', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('argos_token', 'fake-token')
        win.localStorage.setItem(
          'argos_user',
          JSON.stringify({
            name: 'Test User',
            email: 'test@test.com',
            role: 'agent',
          })
        )
      },
    })

    cy.contains('Create Ticket').click()

    cy.get('input[placeholder="Describe the issue..."]')
      .type('Printer is not working')

    cy.contains('select', 'Software').select('Hardware')
    cy.contains('select', 'Medium').select('High')

    cy.get('textarea[placeholder="Potential root cause..."]')
      .type('Printer driver may be missing')

    cy.intercept('POST', 'http://localhost:5000/api/tickets', {
      statusCode: 201,
      body: {
        id: 1,
        title: 'Printer is not working',
        category: 'Hardware',
        priority: 'High',
        likelyCause: 'Printer driver may be missing',
      },
    }).as('createTicket')

    cy.contains('button', 'Create Ticket').click()

    cy.wait('@createTicket')

    cy.url().should('include', '/tickets/1')
  })
})