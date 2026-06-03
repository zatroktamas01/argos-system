/* eslint-env mocha */
/* global cy */
/// <reference types="cypress" />

describe("Argos Login", () => {
  it("should login successfully with admin user", () => {
    cy.visit("http://localhost:3000/login");

    cy.get('input[type="email"]').type("admin@argos.com");
    cy.get('input[type="password"]').type("admin123");

    cy.contains("button", "Log In").click();

    cy.url().should("not.include", "/login");
  });
});