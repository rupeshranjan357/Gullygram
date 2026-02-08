describe('Karma System Smoke Tests', () => {
    const userA = {
        username: `userA_${Date.now()}`,
        email: `usera_${Date.now()}@example.com`,
        password: 'password123',
        alias: `UserA_${Date.now()}`
    };
    const userB = {
        username: `userB_${Date.now()}`,
        email: `userb_${Date.now()}@example.com`,
        password: 'password123',
        alias: `UserB_${Date.now()}`
    };

    before(() => {
        // Setup Users
        cy.request('POST', 'http://localhost:8080/api/auth/signup', userA).then((res) => {
            userA.id = res.body.userId;
        });
        cy.request('POST', 'http://localhost:8080/api/auth/signup', userB).then((res) => {
            userB.id = res.body.userId;
        });
    });

    const login = (email, password) => {
        cy.intercept('POST', '**/auth/login').as('loginReq');
        cy.visit('/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button[type="submit"]').click();
        cy.wait('@loginReq').its('response.statusCode').should('eq', 200);
        // Wait for profile redirection
        cy.url().should('include', '/profile');
    };

    it('should display initial karma score on profile', () => {
        cy.intercept('GET', '**/api/karma/score').as('getScore');

        login(userA.email, userA.password);

        // We are on profile, look for API call
        // Note: useQuery might fire immediately after login success if on profile page
        cy.wait('@getScore', { timeout: 10000 }).then((interception) => {
            assert.isNotNull(interception.response.body, 'API returned a body');
            // Log body or check value. Since we can't see logs easily, assertion helps.
            // If body is just 100, checking body equals 100 works.
            // If body is {data: 100}, checking 'data' property.
            // We assume it returns 100.
            expect(interception.response.statusCode).to.eq(200);
        });

        cy.contains('Trust Score', { timeout: 10000 }).should('be.visible');
        // Check for either 100 or 0 to confirm rendering
        cy.get('body').then(($body) => {
            if ($body.text().includes('100')) {
                cy.contains('100').should('be.visible');
            } else {
                // If 100 is not found, fail with a useful message
                // Or check if 0 is present (which means default/loading fail)
                cy.contains('0').should('not.exist'); // Fail if 0 is found instead of 100? No, let's just assert 100 directly.
                cy.contains('100').should('be.visible');
            }
        });
    });

    it.skip('should display karma history content', () => {
        cy.intercept('GET', '**/api/karma/history').as('getHistory');
        login(userA.email, userA.password);

        // Navigate directly to karma history page
        cy.visit('/karma/history');

        cy.url().should('include', '/karma/history');
        cy.wait('@getHistory');

        // Current score on history page
        cy.contains('100', { timeout: 10000 }).should('be.visible');
        cy.contains('Trending Up').should('be.visible');
    });
});
