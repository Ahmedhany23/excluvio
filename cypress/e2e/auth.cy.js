/// <reference types="cypress" />

describe("Authentication", () => {
  describe("sign up", () => {
    beforeEach(() => {
      cy.visit("/signup");
    });

    it("should show validation when passwords do not match", () => {
      // Fill the registration form with valid details except for confirmation.
      cy.get('[data-cy="signup-name"]').type("Cypress Shopper");
      cy.get('[data-cy="signup-email"]').type("cypress-shopper@example.com");
      cy.get('[data-cy="signup-password"]').type("password123");
      cy.get('[data-cy="signup-confirm-password"]').type("different123");

      // Submit and check the form's password mismatch message.
      cy.get('[data-cy="signup-submit"]').click();
      cy.contains("Passwords do not match").should("be.visible");
    });

    it("should show validation for an invalid email", () => {
      // Enter an invalid email and complete the other fields.
      cy.get('[data-cy="signup-name"]').type("Cypress Shopper");
      cy.get('[data-cy="signup-email"]').type("not-an-email");
      cy.get('[data-cy="signup-password"]').type("password123");
      cy.get('[data-cy="signup-confirm-password"]').type("password123");

      // The browser should keep the invalid form from being submitted.
      cy.get('[data-cy="signup-submit"]').click();
      cy.get('[data-cy="signup-email"]').should("have.value", "not-an-email");
      cy.location("pathname").should("eq", "/signup");
    });
  });

  describe("login", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("should show an error for invalid credentials", () => {
      // Enter credentials that should not match a test account.
      cy.get('[data-cy="login-email"]').type("missing-user@example.com");
      cy.get('[data-cy="login-password"]').type("wrong-password");

      // Submit and verify that login remains on the login page.
      cy.get('[data-cy="login-submit"]').click();
      cy.contains("Invalid email or password").should("be.visible");
      cy.location("pathname").should("eq", "/login");
    });
  });
});
