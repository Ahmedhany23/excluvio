/// <reference types="cypress" />

describe("Shopping cart", () => {
  beforeEach(() => {
    // Begin with a clean guest cart.
    cy.visit("/");
    cy.window().then((window) =>
      window.localStorage.removeItem("products-storage"),
    );
    cy.visit("/products");
  });

  it("should add a product, change quantity, and update totals", () => {
    // Add the first available product to the guest cart.
    cy.get('[data-cy^="add-to-cart-"]').first().click();
    cy.visit("/cart");
    cy.get('[data-cy="cart-table"]').should("be.visible");
    cy.get('[data-cy^="cart-quantity-"]')
      .first()
      .clear()
      .type("2")
      .should("have.value", "2");
    cy.get('[data-cy="cart-total"]').should("be.visible");
  });

  it("should remove the last item and show an empty cart", () => {
    // Add an item and then remove it from the cart.
    cy.get('[data-cy^="add-to-cart-"]').first().click();
    cy.visit("/cart");
    cy.get('[data-cy^="cart-remove-"]').first().click();
    cy.contains("Are you sure you want to remove this item?").should(
      "be.visible",
    );
    cy.contains("button", "OK").click();
    cy.get('[data-cy="cart-empty"]').should("be.visible");
  });
});
