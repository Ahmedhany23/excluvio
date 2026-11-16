/// <reference types="cypress" />

describe("Checkout", () => {
  it("should redirect guests to login", () => {
    // Confirm checkout requires a signed-in user.
    cy.visit("/checkout");
    cy.location("pathname").should("eq", "/login");
  });

  it("should sign in, add a product, and open checkout", () => {
    // Sign in with the demo account shown by the login page.
    cy.visit("/login");
    cy.contains("button", "Fill Demo Data").click();
    cy.get('[data-cy="login-submit"]').click();
    cy.location("pathname").should("eq", "/");

    // Add a catalog product to the signed-in cart.
    cy.visit("/products");
    cy.get('[data-cy^="add-to-cart-"]').first().click();

    // Verify checkout shows its billing form and order summary.
    cy.visit("/checkout");
    cy.contains("Billing Details").should("be.visible");
    cy.contains("Subtotal").should("be.visible");
    cy.contains("Shipping").should("be.visible");
    cy.contains("Total").should("be.visible");

    // Visit the success page directly without using the Stripe payment form.
    cy.visit("/payment-success?amount=100");
    cy.location("pathname").should("eq", "/payment-success");
    cy.contains("Congratulations").should("be.visible");
  });
});
