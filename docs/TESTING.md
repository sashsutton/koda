# 🧪 Testing Strategy & Guide

Koda implements a robust **Testing Pyramid** to ensure the platform's reliability, security, and performance. We use a combination of Unit, Integration, and End-to-End (E2E) tests.

---

## 🏗️ The Testing Pyramid

### 1. Unit Tests (Vitest)
These tests verify individual functions and logic in isolation. They are fast and run frequently during development.

**Key Files**:
- `__tests__/lib/utils.test.ts`: Utility functions testing (e.g., class merging).
- `__tests__/lib/image-helper.test.ts`: S3 URL generation and placeholder logic.
- `__tests__/lib/validations.test.ts`: Zod schema validation for products and updates.
- `__tests__/lib/error-translator.test.ts`: Mapping backend errors to frontend translation keys.

### 2. Integration Tests (Vitest + MongoDB Memory Server)
These tests verify that different parts of the system work together, particularly the interaction between our code and the database.

**Strategy**: We use `mongodb-memory-server` to spin up a real, temporary MongoDB instance in memory. This allows us to test real Mongoose queries without mocking the DB or affecting production data.

**Key Files**:
- `__tests__/integration/setup.ts`: Global test setup for the in-memory DB.
- `__tests__/integration/models.test.ts`: Verifies schema constraints, discriminators, and data persistence for `Product` and `Automation`.
- `__tests__/actions/products.test.ts`: Tests server actions like filtering, creating, and deleting products.
- `__tests__/actions/cart.test.ts`: Verifies cart synchronization and cleanup logic.
- `__tests__/actions/admin.test.ts`: Tests administrative tasks (banning, role updates, Clerk sync).
- `__tests__/lib/auth-utils.test.ts`: Verifies security checks and role-based access control.
- `__tests__/lib/cache-utils.test.ts`: Tests Redis caching logic with mocks.

### 3. End-to-End (E2E) Tests (Playwright)
These tests simulate a real user interacting with the application in a browser. They ensure that the entire stack (Frontend + Backend + Services) is functioning correctly.

**Key Files**:
- `e2e/landing.spec.ts`: Verifies landing page content and basic navigation.

---

## 🚀 Running Tests

### Unit & Integration (Vitest)
```bash
# Run all tests once
npm run test

# Run tests in watch mode (best for development)
npx vitest
```

### End-to-End (Playwright)
```bash
# Install browsers (first time only)
npx playwright install

# Run E2E tests
npx playwright test

# Run E2E tests with UI reporter
npx playwright test --ui
```

---

## 🛠️ Testing Best Practices

1. **Isolation**: Unit tests should never touch the real network or database. Use mocks for services like Stripe, Clerk, and S3.
2. **Clean State**: Integration tests automatically wipe the in-memory database between each test to ensure a clean state (see `setup.ts`).
3. **Mocking External Services**:
    - **Stripe**: We mock the Stripe SDK to verify API calls without hitting actual Stripe servers.
    - **Clerk**: We mock `auth()` and `currentUser()` to simulate different user states (Logged-in, Admin, Banned).
    - **AWS S3**: We mock the S3 client to avoid real uploads.
4. **Lean Queries**: We test that our data retrieval logic uses `.lean()` where appropriate for performance.
5. **Security First**: Every server action test includes a "Should fail if not authenticated" case.
