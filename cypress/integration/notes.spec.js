describe('Notes API E2E Tests', () => {
	const testUser = {
		username: 'admin',
		password: '123',
	};
	let authToken;
	let noteId;

	it('Should register and log in a user', () => {
		// Log in to get the auth token
		cy.request('POST', '/login', testUser).then((loginRes) => {
			expect(loginRes.status).to.eq(200);
			authToken = loginRes.body.token;
			expect(authToken).to.exist;
		});
	});

	it('Should create a new note', () => {
		// Create a new note
		cy.request({
			method: 'POST',
			url: '/notes',
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
			body: {
				content: 'This is a test note',
			},
		}).then((createRes) => {
			expect(createRes.status).to.eq(201);
			expect(createRes.body).to.have.property('_id');
			expect(createRes.body.content).to.eq('This is a test note');
			noteId = createRes.body._id; // Save the note ID for later tests
		});
	});

	it('Should fetch all notes', () => {
		// Fetch all notes
		cy.request({
			method: 'GET',
			url: '/notes',
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		}).then((fetchRes) => {
			expect(fetchRes.status).to.eq(200);
			expect(fetchRes.body).to.have.length(1);
			expect(fetchRes.body[0]).to.have.property('content', 'This is a test note');
		});
	});

	it('Should update a note', () => {
		// Update the note
		cy.request({
			method: 'PUT',
			url: `/notes/${noteId}`,
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
			body: {
				content: 'Updated test note',
			},
		}).then((updateRes) => {
			expect(updateRes.status).to.eq(200);
			expect(updateRes.body).to.have.property('content', 'Updated test note');
		});
	});

	it('Should delete a note', () => {
		// Delete the note
		cy.request({
			method: 'DELETE',
			url: `/notes/${noteId}`,
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		}).then((deleteRes) => {
			expect(deleteRes.status).to.eq(200);
			expect(deleteRes.body).to.have.property('message', 'Note deleted');
		});
	});

	it('Should not log in with invalid credentials', () => {
		// Test invalid login
		cy.request({
			method: 'POST',
			url: '/login',
			body: { username: 'wronguser', password: 'wrongpassword' },
			failOnStatusCode: false, // Prevent Cypress from failing on status code 401
		}).then((loginRes) => {
			expect(loginRes.status).to.eq(401);
			expect(loginRes.body).to.have.property('message', 'Invalid credentials');
		});
	});
});
