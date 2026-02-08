describe('Karma System - Huddle Completion', () => {
    let hostToken: string;
    let participantToken: string;
    let hostId: string;
    let participantId: string;
    let huddleId: string;
    const initialKarma = 100;
    const huddleTitle = `Karma Test Huddle ${Date.now()}`;

    // Ignore benign Leaflet error during page transitions
    Cypress.on('uncaught:exception', (err, runnable) => {
        if (err.message.includes("Cannot read properties of null (reading 'document')")) {
            return false;
        }
    });

    beforeEach(() => {
        // Setup aliases for network requests
        cy.intercept('POST', '/api/huddles').as('createHuddle');
        cy.intercept('POST', '/api/huddles/*/join').as('joinHuddle');
        cy.intercept('POST', '/api/huddles/*/complete').as('completeHuddle');
        cy.intercept('GET', '/api/huddles*').as('getHuddles');
        cy.intercept('GET', '/api/karma/score').as('getKarma');

        // Mock interests to ensure onboarding works
        cy.intercept('GET', '/api/interests', {
            statusCode: 200,
            body: {
                data: [
                    { id: 1, name: 'Technology' },
                    { id: 2, name: 'Music' },
                    { id: 3, name: 'Sports' }
                ]
            }
        }).as('getInterests');

        // Mock update interests/profile
        cy.intercept('PUT', '/api/interests', { statusCode: 200 }).as('updateInterests');
        cy.intercept('PUT', '/api/profile', { statusCode: 200 }).as('updateProfile');
    });

    const completeOnboarding = () => {
        // 1. Interest Selection
        cy.url().should('include', '/onboarding/interests');
        cy.wait('@getInterests');
        // Click first interest (assuming InterestCard renders a button or dev)
        cy.contains('Technology').click();
        cy.contains('Next').click();

        // 2. Radius Selection
        cy.url().should('include', '/onboarding/radius');
        cy.contains('Get Started').click();

        // 3. Profile
        cy.url().should('include', '/profile');
    };

    it('should create users, host a huddle, join, rate, and verify karma after completion', () => {
        // ===========================================
        // 1. Create Host User
        // ===========================================
        const hostEmail = `host_${Date.now()}@example.com`;
        const hostPassword = 'password123';
        const hostUsername = `host_${Date.now()}`;

        cy.visit('/signup');
        cy.get('input[placeholder="Enter your email"]').type(hostEmail);
        cy.get('input[placeholder="Create a password"]').type(hostPassword);
        cy.get('input[placeholder="Your full name"]').type('Host User');
        cy.get('input[placeholder="Enter unique alias"]').type(hostUsername);
        cy.get('button[type="submit"]').click();

        completeOnboarding();

        // Get Host ID/Token
        cy.window().then((win) => {
            const authData = JSON.parse(win.localStorage.getItem('gullygram-auth') || '{}');
            hostToken = authData.state?.token || '';
            hostId = authData.state?.userId || '';
            expect(hostToken).to.be.ok;
            expect(hostId).to.be.ok;
        });

        // ===========================================
        // 2. Create Participant User (Logout first)
        // ===========================================
        // Force logout for reliability
        cy.clearLocalStorage();
        cy.visit('/signup');

        const partEmail = `part_${Date.now()}@example.com`;
        const partUsername = `part_${Date.now()}`;

        cy.get('input[placeholder="Enter your email"]').type(partEmail);
        cy.get('input[placeholder="Create a password"]').type(hostPassword);
        cy.get('input[placeholder="Your full name"]').type('Participant User');
        cy.get('input[placeholder="Enter unique alias"]').type(partUsername);
        cy.get('button[type="submit"]').click();

        completeOnboarding();

        cy.window().then((win) => {
            const authData = JSON.parse(win.localStorage.getItem('gullygram-auth') || '{}');
            participantToken = authData.state?.token || '';
            participantId = authData.state?.userId || '';
            expect(participantToken).to.be.ok;
            expect(participantId).to.be.ok;
        });

        // ===========================================
        // 3. Host Creates a Huddle (Login as Host)
        // ===========================================
        cy.clearLocalStorage();
        // Manually set token to login as Host (faster than UI login)
        cy.window().then((win) => {
            win.localStorage.setItem('gullygram-auth', JSON.stringify({
                state: {
                    isAuthenticated: true,
                    userId: hostId,
                    token: hostToken,
                    profileComplete: true,
                    _hasHydrated: true
                },
                version: 0
            }));

            // Seed Location to avoid "Locating..." delay
            win.localStorage.setItem('gullygram-location-v2', JSON.stringify({
                state: {
                    coords: { lat: 12.9698, lon: 77.7499 }, // Whitefield
                    addressLabel: 'Whitefield, Bangalore',
                    mode: 'MANUAL',
                    radius: 5,
                    isSupportedZone: true
                },
                version: 0
            }));
        });
        cy.visit('/feed'); // Visit feed directly

        // Open Create Modal (Floating Action Button usually)
        // Check Feed.tsx for Create Huddle button
        // Switch to Huddles Tab
        cy.contains('button', 'Huddles').click();

        // Open Create Modal
        // const huddleTitle = `Final Jointest ${Date.now()}`; // This line is removed as huddleTitle is already declared at the top
        cy.contains('button', '+ Create').click();

        // Fill Huddle Form
        cy.get('input[type="text"]').type(huddleTitle);
        // Times are handled by preset buttons (default is NOW)
        // Squad Size default is 4
        // Location is pre-filled from usage
        // Description is hardcoded in UI ('Huddle created via Quick Start')

        // Submit
        cy.contains('button', 'Light the Signal').click();
        cy.wait('@createHuddle').then((interception) => {
            expect(interception.response?.statusCode, `Create Huddle Failed: ${JSON.stringify(interception.response?.body)}`).to.eq(200);
            huddleId = interception.response?.body?.id;
            expect(huddleId).to.be.ok;
        });

        // ===========================================
        // 4. Participant Joins Huddle (Login as Participant)
        // ===========================================
        cy.clearLocalStorage();
        cy.window().then((win) => {
            win.localStorage.setItem('gullygram-auth', JSON.stringify({
                state: {
                    isAuthenticated: true,
                    userId: participantId,
                    token: participantToken,
                    profileComplete: true,
                    _hasHydrated: true
                },
                version: 0
            }));

            // Seed Location
            win.localStorage.setItem('gullygram-location-v2', JSON.stringify({
                state: {
                    coords: { lat: 12.9698, lon: 77.7499 }, // Whitefield
                    addressLabel: 'Whitefield, Bangalore',
                    mode: 'MANUAL',
                    radius: 5,
                    isSupportedZone: true
                },
                version: 0
            }));
        });
        // Participant Joins Huddle
        cy.visit('/feed');
        cy.contains('button', 'Huddles').click();
        cy.wait('@getHuddles').then((interception) => {
            expect(interception.response?.body, 'No huddles returned from API').to.have.length.gt(0);
        });

        // Find the correct marker by title
        cy.get('.leaflet-marker-icon').should('exist');

        let targetHuddleId: string;

        const findAndJoin = () => {
            cy.get('.leaflet-marker-icon').should('be.visible');

            // Log all found huddle titles for debugging
            cy.get('.leaflet-marker-icon').each(($el, index) => {
                const title = $el.find('[data-huddle-title]').attr('data-huddle-title');
                cy.log(`Marker ${index} title: ${title}`);
            });

            const markerSelector = `[data-huddle-title="${huddleTitle}"]`;
            cy.get(markerSelector, { timeout: 10000 }).should('exist').parents('.leaflet-marker-icon').click({ force: true });

            cy.get('body').then(($body) => {
                const popup = $body.find('.leaflet-popup-content');
                if (popup.text().includes('Joined ✅')) {
                    cy.log('ALREADY JOINED');
                } else {
                    cy.log('CLICKING JOIN BUTTON');
                    cy.contains('button', 'Join').click();
                    cy.wait('@joinHuddle');

                    cy.wait(2000); // Wait for the refetch after join

                    // Re-verify with retries. We click the marker to force Leaflet to show the LATEST popup content
                    // which should now be re-rendered via the new reactive key in HuddleMap.tsx
                    cy.log('VERIFYING JOINED STATUS');
                    const verifyJoined = (attempts = 0) => {
                        if (attempts > 5) {
                            cy.contains('.leaflet-popup-content', 'Joined ✅', { timeout: 1000 }).should('be.visible');
                            return;
                        }

                        // Click marker to open popup
                        cy.get(markerSelector).parents('.leaflet-marker-icon').click({ force: true });

                        cy.get('body').then(($body) => {
                            const popup = $body.find('.leaflet-popup-content');
                            if (popup.length > 0 && popup.text().includes('Joined')) {
                                cy.log('FOUND JOINED STATUS');
                            } else {
                                cy.log(`Joined status not yet reflected (attempt ${attempts + 1}). Text: "${popup.text()}"`);
                                cy.wait(2000);
                                verifyJoined(attempts + 1);
                            }
                        });
                    };
                    verifyJoined();
                }
            });
        };

        findAndJoin();

        // Final State Check
        cy.contains('.leaflet-popup-content', 'Joined ✅').should('be.visible');

        // ===========================================
        // 5. Host Completes Huddle (Login as Host)
        // ===========================================
        cy.clearLocalStorage();
        cy.window().then((win) => {
            win.localStorage.setItem('gullygram-auth', JSON.stringify({
                state: {
                    isAuthenticated: true,
                    userId: hostId,
                    token: hostToken,
                    profileComplete: true,
                    _hasHydrated: true
                },
                version: 0
            }));

            // Seed Location
            win.localStorage.setItem('gullygram-location-v2', JSON.stringify({
                state: {
                    coords: { lat: 12.9698, lon: 77.7499 }, // Whitefield
                    addressLabel: 'Whitefield, Bangalore',
                    mode: 'MANUAL',
                    radius: 5,
                    isSupportedZone: true
                },
                version: 0
            }));
        });
        cy.visit('/feed');

        // Switch to Huddles Tab
        cy.contains('button', 'Huddles').click();

        cy.wait(1000);

        // Open Huddle Details - close any existing popups first to prevent z-index conflicts
        cy.get('.leaflet-marker-icon').last().click({ force: true });
        cy.contains('View Details / Complete').click({ force: true });

        // Close the Leaflet popup by clicking outside or pressing Escape
        cy.get('body').type('{esc}');
        cy.wait(500);

        // Verify Modal Opens using test-id
        cy.get('[data-testid="huddle-modal-title"]', { timeout: 10000 })
            .should('exist')
            .and('contain.text', 'Karma Test Huddle');

        // Verify 'Complete Huddle' button exists and is clickable
        cy.get('[data-testid="complete-huddle-button"]')
            .should('exist')
            .should('not.be.disabled')
            .click({ force: true });

        // Confirm Alert (Cypress auto-confirms window:confirm)

        // Verify API call
        cy.wait('@completeHuddle').then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
        });

        // Verify Success (Modal closes or page reloads)
        cy.wait(2000);

        // ===========================================
        // 6. Test Rating Submission
        // ===========================================
        cy.log('Testing rating submission...');

        // Participant rates Host (5 stars)
        cy.request({
            method: 'POST',
            url: `http://localhost:8080/api/karma/vibe-check`,
            headers: { 'Authorization': `Bearer ${participantToken}` },
            body: {
                huddleId: huddleId,
                revieweeId: hostId,
                rating: 5
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            cy.log('✅ Participant successfully rated host: 5 stars');
        });

        // Host rates Participant (4 stars)
        cy.request({
            method: 'POST',
            url: `http://localhost:8080/api/karma/vibe-check`,
            headers: { 'Authorization': `Bearer ${hostToken}` },
            body: {
                huddleId: huddleId,
                revieweeId: participantId,
                rating: 4
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            cy.log('✅ Host successfully rated participant: 4 stars');
        });

        // Wait for karma to process
        cy.wait(2000);

        // ===========================================
        // 7. Verify Karma Increased
        // ===========================================
        cy.log('Verifying karma changes...');

        cy.request({
            method: 'GET',
            url: 'http://localhost:8080/api/karma/score',
            headers: { 'Authorization': `Bearer ${hostToken}` }
        }).then((res) => {
            const hostFinalKarma = res.body.score;
            cy.log(`Host karma: ${hostFinalKarma} (initial: ${initialKarma}, expected increase: +5)`);
            expect(hostFinalKarma).to.be.greaterThan(initialKarma);
        });

        cy.request({
            method: 'GET',
            url: 'http://localhost:8080/api/karma/score',
            headers: { 'Authorization': `Bearer ${participantToken}` }
        }).then((res) => {
            const partFinalKarma = res.body.score;
            cy.log(`Participant karma: ${partFinalKarma} (initial: ${initialKarma}, expected increase: +4)`);
            expect(partFinalKarma).to.be.greaterThan(initialKarma);
        });

        cy.log('✅ Karma scores verified successfully!');
    });

    // ===========================================
    // TEST 2: Edge Case - Non-Creator Cannot Complete
    // ===========================================
    it('should prevent non-creator from completing huddle', () => {
        const huddleTitle2 = `Edge Case Test ${Date.now()}`;

        // Create host user
        const hostEmail2 = `host2_${Date.now()}@example.com`;
        const partEmail2 = `part2_${Date.now()}@example.com`;

        cy.visit('/signup');
        cy.get('input[placeholder="Enter your email"]').type(hostEmail2);
        cy.get('input[placeholder="Create a password"]').type('password123');
        cy.get('input[placeholder="Your full name"]').type('Host 2');
        cy.get('input[placeholder="Enter unique alias"]').type(`host2_${Date.now()}`);
        cy.get('button[type="submit"]').click();
        completeOnboarding();

        let hostId2: string, hostToken2: string;
        cy.window().then((win) => {
            const authData = JSON.parse(win.localStorage.getItem('gullygram-auth') || '{}');
            hostToken2 = authData.state?.token || '';
            hostId2 = authData.state?.userId || '';
        });

        // Create participant
        cy.clearLocalStorage();
        cy.visit('/signup');
        cy.get('input[placeholder="Enter your email"]').type(partEmail2);
        cy.get('input[placeholder="Create a password"]').type('password123');
        cy.get('input[placeholder="Your full name"]').type('Part 2');
        cy.get('input[placeholder="Enter unique alias"]').type(`part2_${Date.now()}`);
        cy.get('button[type="submit"]').click();
        completeOnboarding();

        let partId2: string, partToken2: string, huddleId2: string;
        cy.window().then((win) => {
            const authData = JSON.parse(win.localStorage.getItem('gullygram-auth') || '{}');
            partToken2 = authData.state?.token || '';
            partId2 = authData.state?.userId || '';
        });

        // Host creates huddle
        cy.then(() => {
            cy.clearLocalStorage();
            cy.window().then((win) => {
                win.localStorage.setItem('gullygram-auth', JSON.stringify({
                    state: { isAuthenticated: true, userId: hostId2, token: hostToken2, profileComplete: true, _hasHydrated: true },
                    version: 0
                }));
                win.localStorage.setItem('gullygram-location-v2', JSON.stringify({
                    state: { coords: { lat: 12.9698, lon: 77.7499 }, addressLabel: 'Whitefield', mode: 'MANUAL', radius: 5, isSupportedZone: true },
                    version: 0
                }));
            });
            cy.visit('/feed');
            cy.contains('button', 'Huddles').click();
            cy.contains('button', '+ Create').click();
            cy.get('input[type="text"]').type(huddleTitle2);
            cy.contains('button', 'Light the Signal').click();
            cy.wait('@createHuddle').then((interception) => {
                huddleId2 = interception.response?.body?.id;
            });
        });

        // Participant joins
        cy.then(() => {
            cy.clearLocalStorage();
            cy.window().then((win) => {
                win.localStorage.setItem('gullygram-auth', JSON.stringify({
                    state: { isAuthenticated: true, userId: partId2, token: partToken2, profileComplete: true, _hasHydrated: true },
                    version: 0
                }));
                win.localStorage.setItem('gullygram-location-v2', JSON.stringify({
                    state: { coords: { lat: 12.9720, lon: 77.7520 }, addressLabel: 'Whitefield Test', mode: 'MANUAL', radius: 5, isSupportedZone: true },
                    version: 0
                }));
            });
            cy.visit('/feed');
            cy.contains('button', 'Huddles').click();
            cy.wait('@getHuddles');
            cy.get(`[data-huddle-title="${huddleTitle2}"]`, { timeout: 10000 }).parents('.leaflet-marker-icon').click({ force: true });
            cy.contains('button', 'Join').click();
            cy.wait('@joinHuddle');
        });

        // Participant attempts to complete (via API - should get 403)
        cy.then(() => {
            cy.request({
                method: 'POST',
                url: `http://localhost:8080/api/huddles/${huddleId2}/complete`,
                headers: { 'Authorization': `Bearer ${partToken2}` },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(403);
                cy.log('✅ Non-creator correctly prevented from completing (403 Forbidden)');
            });
        });

        // Verify huddle is still OPEN
        cy.then(() => {
            cy.request({
                method: 'GET',
                url: `http://localhost:8080/api/huddles?lat=12.9698&lon=77.7499&radiusKm=5`,
                headers: { 'Authorization': `Bearer ${hostToken2}` }
            }).then((res) => {
                const huddle = res.body.find((h: any) => h.id === huddleId2);
                expect(huddle.status).to.eq('OPEN');
                cy.log('✅ Huddle status remains OPEN after failed completion attempt');
            });
        });
    });
});
