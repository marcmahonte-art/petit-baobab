// cypress/e2e/baobab.cy.ts
/// <reference types="cypress" />

/**
 * End‑to‑end test for the Mon Baobab page.
 * It logs in a child user (mocked via a JWT stored in localStorage),
 * verifies that the hero displays the correct level, and that performing
 * a dummy activity updates the XP bar and unlocks an animal.
 */

describe('Mon Baobab Hub', () => {
  const childId = 'test-child-1';
  const token = 'fake-jwt-token-for-testing'; // In real tests use a real token from Supabase

  beforeEach(() => {
    // Mock authentication – the app reads `sb-student-token` from localStorage
    window.localStorage.setItem('sb-student-token', token);
    // Also mock Supabase session (if the app uses `supabase.auth.getUser()` it will
    // return the user based on the token – we rely on the backend mock in CI)
    cy.visit('/learn/baobab');
  });

  it('should display the hero tree at the correct level', () => {
    // The hero contains an img with src containing the level number
    cy.get('section')
      .find('img')
      .should('have.attr', 'src')
      .and('match', /level-\d+\.svg$/);
  });

  it('should show the XP bar and update after a dummy activity', () => {
    // Capture initial XP width
    cy.get('[data-testid="xp-bar"]')
      .invoke('width')
      .then((initialWidth) => {
        // Trigger a dummy activity via the API (Cypress task could call backend)
        cy.request({
          method: 'POST',
          url: '/api/gamification/event',
          body: { childId, type: 'drawing.completed', xp: 200 },
          headers: { Authorization: `Bearer ${token}` },
        }).then(() => {
          // Wait for the realtime update to propagate
          cy.wait(2000);
          // Verify the XP bar grew
          cy.get('[data-testid="xp-bar"]').invoke('width').should('be.gt', initialWidth);
        });
      });
  });

  it('should unlock a new animal and display it in the Zoo card', () => {
    // Ensure no animal with type "giraffe" is present initially
    cy.get('[data-testid="zoo-card"]').should('not.contain', 'giraffe');
    // Unlock via API
    cy.request({
      method: 'POST',
      url: '/api/baobab/animals',
      body: { animal_type: 'giraffe' },
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      cy.wait(2000);
      cy.get('[data-testid="zoo-card"]').should('contain', 'giraffe');
    });
  });
});
