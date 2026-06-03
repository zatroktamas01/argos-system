/// <reference types="cypress" />
/* eslint-disable no-undef */

describe('Logout', () => {
  it('should logout successfully', () => {
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

    cy.contains('Logout').click()

    cy.url().should('include', '/login')
  })
})