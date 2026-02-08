describe('Enhanced Karma System - Full E2E Tests', () => {
    let hostToken: string;
    let participantToken: string;
    let participant2Token: string;
    let hostId: string;
    let participantId: string;
    let participant2Id: string;
    let huddleId: string;
    const initialKarma = 100;

    beforeEach(() => {
        // Setup comprehensive aliases for all network requests
        cy.intercept('POST', '/api/huddles').as('createHuddle');
        cy.intercept('POST', '/api/huddles/*/join').as('joinHuddle');
        cy.intercept('POST', '/api/huddles/*/complete').as('completeHuddle');
        cy.intercept('POST', '/api/huddles/*/cancel').as('cancelHuddle');
        cy.intercept('GET', '/api/huddles*').as('getHuddles');
        cy.intercept('GET', '/api/huddles/*/participants').as('getParticipants');
        cy.intercept('POST', '/api/karma/vibe-check').as('submitVibeCheck');
        cy.intercept('GET', '/api/karma/score').as('getKarmaScore');
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
        cy.intercept('PUT', '/api/interests', { statusCode: 200 }).as('updateInterests');
        cy.intercept('PUT', '/api/profile', { statusCode: 200 }).as('updateProfile');
    });

    const completeOnboarding = () => {
        cy.url().should('include', '/onboarding/interests');
        cy.wait('@getInterests');
        cy.contains('Technology').click();
        cy.contains('Next').click();
        cy.url().should('include', '/onboarding/radius');
        cy.contains('Get Started').click();
        cy.url().should('include', '/profile');
    };

    const createUser = (role: string) => {
        const timestamp = Date.now();
        const email = `${role}_${timestamp}@example.com`;
        const username = `${role}_${timestamp}`;
        const password = 'password123';

        cy.visit('/signup');
        cy.get('input[placeholder="Enter your email"]').type(email);
        cy.get('input[placeholder="Create a password"]').type(password);
        cy.get('input[placeholder="Your full name"]').type(`${role} User`);
        cy.get('input[placeholder="Enter unique alias"]').type(username);
        cy.get('button[type="submit"]').click();
        completeOnboarding();

        let userId: string;
        let token: string;
        cy.window().then((win) => {
            const authData = JSON.parse(win.localStorage.getItem('gullygram-auth') || '{}');
            token = authData.state?.token || '';
            userId = authData.state?.userId || '';
            expect(token).to.be.ok;
            expect(userId).to.be.ok;
        });

        return cy.wrap({ userId, token, email, username });
    };

    const loginAs = (userId: string, token: string) => {
        cy.clearLocalStorage();
        cy.window().then((win) => {
            win.localStorage.setItem('gullygram-auth', JSON.stringify({
                state: {
                    isAuthenticated: true,
                    userId: userId,
                    token: token,
                    profileComplete: true,
                    _hasHydrated: true
                },
                version: 0
            }));
            win.localStorage.setItem('gullygram-location-v2', JSON.stringify({
                state: {
                    coords: { lat: 12.9698, lon: 77.7499 },
                    addressLabel: 'Whitefield, Bangalore',
                    mode: 'MANUAL',
                    radius: 5,
                    isSupportedZone: true
                },
                version: 0
            }));
        });
        cy.visit('/feed');
    };

    const getKarmaScore = () => {
        return cy.request({
            method: 'GET',
            url: 'http://localhost:8080/api/karma/score',
            headers: {
                'Authorization': `Bearer ${hostToken}`
            }
        }).then((response) => {
            return response.body.score;
        });
    };

    // ===========================================
    // TEST 1: Complete Flow with Rating Submission
    // ===========================================
    it('should complete flow with rating submission and karma verification', () => {
        const huddleTitle = `Karma Test ${Date.now()}`;
        let hostInitialKarma: number;
        let participantInitialKarma: number;

        // Create Host
        createUser('host').then((hostData: any) => {
            hostId = hostData.userId;
            hostToken = hostData.token;

            // Capture initial karma
            cy.request({
                method: 'GET',
                url: 'http://localhost:8080/api/karma/score',
                headers: { 'Authorization': `Bearer ${hostToken}` }
            }).then((res) => {
                hostInitialKarma = res.body.score || 100;
                cy.log(`Host initial karma: ${hostInitialKarma}`);
            });
        });

        // Create Participant
        cy.then(() => {
            createUser('participant').then((partData: any) => {
                participantId = partData.userId;
                participantToken = partData.token;

                cy.request({
                    method: 'GET',
                    url: 'http://localhost:8080/api/karma/score',
                    headers: { 'Authorization': `Bearer ${participantToken}` }
                }).then((res) => {
                    participantInitialKarma = res.body.score || 100;
                    cy.log(`Participant initial karma: ${participantInitialKarma}`);
                });
            });
        });

        // Host creates huddle
        cy.then(() => {
            loginAs(hostId, hostToken);
            cy.contains('button', 'Huddles').click();
            cy.contains('button', '+ Create').click();
            cy.get('input[type="text"]').type(huddleTitle);
            cy.contains('button', 'Light the Signal').click();
            cy.wait('@createHuddle').then((interception) => {
                huddleId = interception.response?.body?.id;
                expect(huddleId).to.be.ok;
            });
        });

        // Participant joins
        cy.then(() => {
            loginAs(participantId, participantToken);
            cy.contains('button', 'Huddles').click();
            cy.wait('@getHuddles');
            const markerSelector = `[data-huddle-title="${huddleTitle}"]`;
            cy.get(markerSelector, { timeout: 10000 }).parents('.leaflet-marker-icon').click({ force: true });
            cy.contains('button', 'Join').click();
            cy.wait('@joinHuddle');
        });

        // Host completes huddle
        cy.then(() => {
            loginAs(hostId, hostToken);
            cy.contains('button', 'Huddles').click();
            cy.wait(1000);
            cy.get('.leaflet-marker-icon').last().click({ force: true });
            cy.contains('View Details / Complete').click({ force: true });
            cy.get('body').type('{esc}');
            cy.wait(500);
            cy.get('[data-testid="complete-huddle-button"]').click({ force: true });
            cy.wait('@completeHuddle').then((interception) => {
                expect(interception.response?.statusCode).to.eq(200);
            });
        });

        // Participant submits rating
        cy.then(() => {
            loginAs(participantId, participantToken);
            cy.contains('button', 'Huddles').click();
            cy.wait(1000);

            // Submit rating via API (since UI might not be fully implemented)
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
                cy.log('✅ Participant rated host: 5 stars');
            });
        });

        // Host rates participant
        cy.then(() => {
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
                cy.log('✅ Host rated participant: 4 stars');
            });
        });

        // Verify karma changed
        cy.then(() => {
            cy.wait(2000); // Wait for karma processing

            cy.request({
                method: 'GET',
                url: 'http://localhost:8080/api/karma/score',
                headers: { 'Authorization': `Bearer ${hostToken}` }
            }).then((res) => {
                const hostFinalKarma = res.body.score;
                cy.log(`Host final karma: ${hostFinalKarma} (expected: ${hostInitialKarma + 5})`);
                expect(hostFinalKarma).to.be.greaterThan(hostInitialKarma);
            });

            cy.request({
                method: 'GET',
                url: 'http://localhost:8080/api/karma/score',
                headers: { 'Authorization': `Bearer ${participantToken}` }
            }).then((res) => {
                const partFinalKarma = res.body.score;
                cy.log(`Participant final karma: ${partFinalKarma} (expected: ${participantInitialKarma + 4})`);
                expect(partFinalKarma).to.be.greaterThan(participantInitialKarma);
            });
        });
    });

    // ===========================================
    // TEST 2: Non-Creator Cannot Complete Huddle
    // ===========================================
    it('should prevent non-creator from completing huddle', () => {
        const huddleTitle = `No Complete ${Date.now()}`;

        createUser('host2').then((hostData: any) => {
            hostId = hostData.userId;
            hostToken = hostData.token;
        });

        cy.then(() => {
            createUser('participant2').then((partData: any) => {
                participantId = partData.userId;
                participantToken = partData.token;
            });
        });

        // Host creates huddle
        cy.then(() => {
            loginAs(hostId, hostToken);
            cy.contains('button', 'Huddles').click();
            cy.contains('button', '+ Create').click();
            cy.get('input[type="text"]').type(huddleTitle);
            cy.contains('button', 'Light the Signal').click();
            cy.wait('@createHuddle').then((interception) => {
                huddleId = interception.response?.body?.id;
            });
        });

        // Participant joins
        cy.then(() => {
            loginAs(participantId, participantToken);
            cy.contains('button', 'Huddles').click();
            cy.wait('@getHuddles');
            const markerSelector = `[data-huddle-title="${huddleTitle}"]`;
            cy.get(markerSelector, { timeout: 10000 }).parents('.leaflet-marker-icon').click({ force: true });
            cy.contains('button', 'Join').click();
            cy.wait('@joinHuddle');
        });

        // Participant attempts to complete (should fail)
        cy.then(() => {
            cy.request({
                method: 'POST',
                url: `http://localhost:8080/api/huddles/${huddleId}/complete`,
                headers: { 'Authorization': `Bearer ${participantToken}` },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(403);
                cy.log('✅ Non-creator correctly prevented from completing huddle');
            });
        });
    });

    // ===========================================
    // TEST 3: Cannot Rate Same User Twice
    // ===========================================
    it('should prevent duplicate ratings for same user', () => {
        const huddleTitle = `Duplicate Rating Test ${Date.now()}`;

        createUser('host3').then((hostData: any) => {
            hostId = hostData.userId;
            hostToken = hostData.token;
        });

        cy.then(() => {
            createUser('participant3').then((partData: any) => {
                participantId = partData.userId;
                participantToken = partData.token;
            });
        });

        // Create and join huddle
        cy.then(() => {
            loginAs(hostId, hostToken);
            cy.contains('button', 'Huddles').click();
            cy.contains('button', '+ Create').click();
            cy.get('input[type="text"]').type(huddleTitle);
            cy.contains('button', 'Light the Signal').click();
            cy.wait('@createHuddle').then((interception) => {
                huddleId = interception.response?.body?.id;
            });
        });

        cy.then(() => {
            loginAs(participantId, participantToken);
            cy.contains('button', 'Huddles').click();
            cy.wait('@getHuddles');
            const markerSelector = `[data-huddle-title="${huddleTitle}"]`;
            cy.get(markerSelector, { timeout: 10000 }).parents('.leaflet-marker-icon').click({ force: true });
            cy.contains('button', 'Join').click();
            cy.wait('@joinHuddle');
        });

        // Complete huddle
        cy.then(() => {
            loginAs(hostId, hostToken);
            cy.contains('button', 'Huddles').click();
            cy.wait(1000);
            cy.get('.leaflet-marker-icon').last().click({ force: true });
            cy.contains('View Details / Complete').click({ force: true });
            cy.get('body').type('{esc}');
            cy.wait(500);
            cy.get('[data-testid="complete-huddle-button"]').click({ force: true });
            cy.wait('@completeHuddle');
        });

        // First rating (should succeed)
        cy.then(() => {
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
                cy.log('✅ First rating succeeded');
            });
        });

        // Second rating (should fail with 409 Conflict)
        cy.then(() => {
            cy.request({
                method: 'POST',
                url: `http://localhost:8080/api/karma/vibe-check`,
                headers: { 'Authorization': `Bearer ${participantToken}` },
                body: {
                    huddleId: huddleId,
                    revieweeId: hostId,
                    rating: 3
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.status).to.eq(409);
                cy.log('✅ Duplicate rating correctly prevented');
            });
        });
    });

    // ===========================================
    // TEST 4: Huddle Cancellation Works
    // ===========================================
    it('should allow creator to cancel huddle', () => {
        const huddleTitle = `Cancel Test ${Date.now()}`;

        createUser('host4').then((hostData: any) => {
            hostId = hostData.userId;
            hostToken = hostData.token;
        });

        cy.then(() => {
            createUser('participant4').then((partData: any) => {
                participantId = partData.userId;
                participantToken = partData.token;
            });
        });

        // Host creates huddle
        cy.then(() => {
            loginAs(hostId, hostToken);
            cy.contains('button', 'Huddles').click();
            cy.contains('button', '+ Create').click();
            cy.get('input[type="text"]').type(huddleTitle);
            cy.contains('button', 'Light the Signal').click();
            cy.wait('@createHuddle').then((interception) => {
                huddleId = interception.response?.body?.id;
            });
        });

        // Participant joins
        cy.then(() => {
            loginAs(participantId, participantToken);
            cy.contains('button', 'Huddles').click();
            cy.wait('@getHuddles');
            const markerSelector = `[data-huddle-title="${huddleTitle}"]`;
            cy.get(markerSelector, { timeout: 10000 }).parents('.leaflet-marker-icon').click({ force: true });
            cy.contains('button', 'Join').click();
            cy.wait('@joinHuddle');
        });

        // Host cancels huddle
        cy.then(() => {
            cy.request({
                method: 'POST',
                url: `http://localhost:8080/api/huddles/${huddleId}/cancel`,
                headers: { 'Authorization': `Bearer ${hostToken}` }
            }).then((response) => {
                expect(response.status).to.eq(200);
                cy.log('✅ Huddle successfully cancelled');
            });
        });

        // Verify ratings cannot be submitted for cancelled huddle
        cy.then(() => {
            cy.request({
                method: 'POST',
                url: `http://localhost:8080/api/karma/vibe-check`,
                headers: { 'Authorization': `Bearer ${participantToken}` },
                body: {
                    huddleId: huddleId,
                    revieweeId: hostId,
                    rating: 5
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should fail because huddle is cancelled
                expect(response.status).to.not.eq(200);
                cy.log('✅ Cannot rate in cancelled huddle');
            });
        });
    });
});
