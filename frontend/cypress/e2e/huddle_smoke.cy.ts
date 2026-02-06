describe('Huddle Feature Smoke Test', () => {
    const timestamp = new Date().getTime();
    const testUser = {
        email: `smoke_test_${timestamp}@gullygram.com`,
        password: 'password123',
        phone: `9${timestamp.toString().substring(4)}` // Pseudo-random phone
    };

    it('should allow a user to signup and create a huddle', () => {
        // 1. Signup
        cy.visit('/signup', {
            onBeforeLoad(win) {
                // Mock Geolocation to Whitefield
                cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
                    return cb({
                        coords: {
                            latitude: 12.9698,
                            longitude: 77.7499,
                            accuracy: 100,
                        },
                    });
                });
            },
        });
        cy.get('input[type="email"]').type(testUser.email);
        cy.get('input[type="password"]').type(testUser.password);
        cy.get('input[name="alias"]').type(`smoke_user_${timestamp}`);

        cy.contains('Continue').click();

        // 2. Onboarding Flow
        // Interest Selection
        cy.url().should('include', '/onboarding/interests');
        cy.contains('Technology').click(); // Select an interest
        cy.contains('Next').click();

        // Radius Selection (Assuming it's next, checking AppRoutes: /onboarding/radius)
        cy.url().should('include', '/onboarding/radius');
        cy.contains('Get Started').click();

        // Wait for redirect to Profile
        cy.url().should('include', '/profile', { timeout: 10000 });

        // 2. Navigate to Huddles Tab from Profile
        cy.contains('button', 'Huddles').click(); // This clicks the BottomNav button

        // Confirm URL update
        cy.url().should('include', '/huddles');

        // Wait for Huddles header (handling loading state)
        cy.contains('Nearby Huddles', { timeout: 15000 }).should('be.visible');

        // 3. Open Create Huddle Modal
        cy.contains('button', '+ Create').click();
        cy.contains('Start a Huddle').should('be.visible');

        // 4. Fill Form
        cy.contains('label', 'What are we doing?').next('input').type('Cypress Smoke Huddle');

        // Select Time (Tonight)
        cy.contains('button', 'Tonight').click();

        // Select Squad Size (Change slider)
        // Range input handling in Cypress can be tricky, typically invoke val() and trigger input
        cy.get('input[type="range"]')
            .invoke('val', 8)
            .trigger('change')
            .trigger('input');

        // Toggle Women Only (optional, just testing interaction)
        cy.contains('Women').click();
        // Wait, if I click the container it toggles.

        // 5. Submit
        cy.contains('Light the Signal').click();

        // 6. Verify Success
        // Should close modal
        cy.contains('Start a Huddle').should('not.exist');

        // Should see the new huddle in the list (assuming it refreshes)
        cy.contains('Cypress Smoke Huddle').should('be.visible');
    });
});
