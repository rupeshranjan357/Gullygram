describe('Huddle Feature Smoke Test', () => {
    beforeEach(() => {
        // 1. Mock Authentication
        const authState = {
            state: {
                userId: 'test-user-id',
                alias: 'Tester',
                token: 'fake-jwt-token',
                isAuthenticated: true,
                profileComplete: true,
                _hasHydrated: true
            },
            version: 0
        };
        window.localStorage.setItem('gullygram-auth', JSON.stringify(authState));

        // 2. Mock Geolocation (Indiranagar - Supported Zone)
        cy.visit('http://localhost:5173/huddles', {
            onBeforeLoad(win) {
                cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
                    return cb({
                        coords: {
                            latitude: 12.9716,
                            longitude: 77.6412, // Indiranagar Center
                            accuracy: 10,
                        },
                    });
                });
            },
        });
    });

    it('should load the Huddle Map and display markers', () => {
        // 3. Intercept Huddle API
        cy.intercept('GET', '**/api/huddles*', {
            statusCode: 200,
            body: [
                {
                    id: 'huddle-1',
                    title: 'Cypress Test Match',
                    description: 'Automated test huddle',
                    lat: 12.9716,
                    lon: 77.6412,
                    locationName: 'Indiranagar Park',
                    startTime: new Date(Date.now() + 3600000).toISOString(),
                    maxParticipants: 10,
                    currentParticipants: 2,
                    isJoined: false,
                    status: 'OPEN'
                }
            ]
        }).as('getHuddles');

        // 4. Verify we are on Huddles Tab
        // The URL should be /huddles and "Nearby Huddles" should appear
        cy.contains('Nearby Huddles').should('be.visible');

        // 5. Verify API Call
        cy.wait('@getHuddles', { timeout: 10000 });

        // 6. Verify Map Elements
        cy.get('.leaflet-container', { timeout: 10000 }).should('be.visible');

        // 7. Verify Marker exists
        cy.get('.custom-huddle-marker', { timeout: 10000 }).should('exist');

        // 8. Click Marker and Check Popup
        cy.get('.custom-huddle-marker').click();
        cy.contains('Cypress Test Match').should('be.visible');
        cy.contains('Join').should('be.visible');
    });
});
