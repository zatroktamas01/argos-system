/// <reference types="cypress" />
/* eslint-disable no-undef */

describe('Knowledge Base', () => {
  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('argos_token', 'fake-token')
        win.localStorage.setItem(
          'argos_user',
          JSON.stringify({
            name: 'Admin User',
            email: 'admin@test.com',
            role: 'admin',
          })
        )
      },
    })
  })

  it('should create a knowledge article', () => {
    cy.intercept('GET', '**/api/knowledge', []).as('getArticles')

    cy.intercept('POST', '**/api/knowledge', {
      statusCode: 201,
      body: {
        _id: '1',
        title: 'Printer Fix',
      },
    }).as('createArticle')

    cy.contains('Knowledge Base').click()

    cy.get('input[placeholder="Article title"]')
      .type('Printer Fix')

    cy.get('input[placeholder="Category"]')
      .clear()
      .type('Hardware')

    cy.get('input[placeholder="Tags separated by comma"]')
      .type('printer,driver')

    cy.get('textarea[placeholder="Troubleshooting steps..."]')
      .type('Reinstall the printer driver.')

    cy.contains('Create Article').click()

    cy.wait('@createArticle')

    cy.get('input[placeholder="Article title"]')
      .should('have.value', '')
  })
})