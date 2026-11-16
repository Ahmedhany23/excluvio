# Excluvio E-commerce Platform

Excluvio is a full-stack e-commerce application built with the Next.js App Router. It features a complete shopping experience, including user authentication, product browsing and filtering, a shopping cart, wishlists, and a secure checkout process powered by Stripe. The backend is built with Next.js API Routes and interacts with a MongoDB database via Prisma.

## Key Features

- **Modern Frontend:** Built with Next.js 15+ (App Router) and React 19.
- **Complete E-commerce Flow:** Browse products, add items to a cart and wishlist, and complete purchases through a secure checkout.
- **User Authentication:** Secure sign-up, login, and session management using NextAuth.js.
- **Product Catalog & Filtering:**
  - Dynamic product listing, detail pages, and related item suggestions.
  - Advanced filtering by category and price range.
  - Full-text search functionality across the product catalog.
- **Advanced Shopping Cart:**
  - Client-side cart management for guests using Zustand for a fast UX.
  - Automatic server-side cart synchronization for authenticated users.
  - Seamless merging of guest and user carts upon login.
- **Secure Payments:** Integration with Stripe Elements for handling payments, including a custom-built checkout form that supports saved billing details.
- **User Profile Management:**
  - Dedicated user dashboard to view account details.
  * Comprehensive order history tracking.
  - Securely change account passwords.
- **Robust Backend:**
  - Backend logic and API endpoints are built using Next.js API Routes.
  - Utilizes MongoDB for data storage with Prisma as a type-safe ORM.

## Technology Stack

| Frontend                                                                | Backend                                                   |
| ----------------------------------------------------------------------- | --------------------------------------------------------- |
| [Next.js](https://nextjs.org/) (App Router)                             | [Node.js](https://nodejs.org/)                            |
| [TypeScript](https://www.typescriptlang.org/)                           | Next.js API Routes                                        |
| [Ant Design](https://ant.design/)                                       | [MongoDB](https://www.mongodb.com/)                       |
| [Tailwind CSS](https://tailwindcss.com/)                                | [Prisma](https://www.prisma.io/)                          |
| [Zustand](https://zustand-demo.pmnd.rs/) (Client-side State)            | [NextAuth.js](https://next-auth.js.org/) (Authentication) |
| [TanStack Query](https://tanstack.com/query/latest) (Server-side State) | [Stripe](https://stripe.com/) (Payments)                  |

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- A MongoDB database instance
- A Stripe account for payment processing

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/ahmedhany23/excluvio.git
    cd excluvio
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the following variables. Replace the placeholder values with your actual credentials.

    ```env
    # Prisma / MongoDB
    DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>/<database_name>"

    # NextAuth.js
    # Generate a secret using: openssl rand -base64 32
    NEXTAUTH_SECRET="your_nextauth_secret"
    NEXTAUTH_URL="http://localhost:3000"

    # Stripe
    STRIPE_SECRET_KEY="sk_test_..."
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_..."
    ```

4.  **Generate the Prisma Client:**
    This command reads your `prisma/schema.prisma` file and generates the type-safe Prisma Client.

    ```bash
    npx prisma generate
    ```

5.  **Run the development server:**

    ```bash
    npm run dev
    ```

6.  Open your browser and navigate to `http://localhost:3000`.

## Project Structure

The project follows a feature-sliced architecture within the Next.js App Router paradigm, promoting scalability and maintainability.

````
/
├── app/                  # Next.js App Router
│   ├── (auth)/             # Authentication pages (login, signup)
│   ├── (pages)/            # Core application pages (cart, products, profile)
│   ├── api/                # Backend API routes for all server-side logic
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/           # Reusable, generic UI components (ProductCard, Footer, etc.)
├── features/             # Feature-sliced modules (cart, checkout, home)
├── hooks/                # Custom React hooks for data-fetching and logic
├── lib/                  # Helper functions and utilities
├── prisma/               # Prisma schema, migrations, and client
├── providers/            # Application-wide context providers (React Query, Auth)
└── public/               # Static assets (images, icons)


## Testing

The project uses Jest and React Testing Library for component tests, and Cypress for browser-based end-to-end tests.

### Tools

- Jest
- React Testing Library
- @testing-library/user-event
- Cypress

### Jest Tests

```bash
npm run test
```

### Cypress E2E Tests

Cypress specs are in `cypress/e2e/`. They cover authentication, product search, catalog filtering, cart actions, and checkout page navigation.

1. Configure the required `.env.local` values described in [Getting Started](#installation--setup). A working database with products and the demo login account is needed for the authenticated and catalog flows.
2. Start the Next.js app in one terminal:

   ```bash
   npm run dev
   ```

3. In another terminal, run the full E2E suite:

   ```bash
   npx cypress run
   ```

   To open the Cypress interactive runner instead, use:

   ```bash
   npx cypress open
   ```

   To run one spec, pass its path, for example:

   ```bash
   npx cypress run --spec cypress/e2e/cart.cy.js
   ```

Cypress uses `http://localhost:3000` as its `baseUrl`, configured in `cypress.config.js`. The current checkout E2E flow checks authenticated checkout and the payment success page navigation; it does not submit a real Stripe payment.
