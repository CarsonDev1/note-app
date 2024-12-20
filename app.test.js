const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app'); // Import your app instance
const Note = require('./models/Note'); // Import Note model
const User = require('./models/User'); // Import User model

const testUser = {
	username: 'admin',
	password: '123',
};

let authToken;

beforeAll(async () => {
	// Connect to a test database
	await mongoose.connect('mongodb+srv://admin:HqLPXhuroWmKsw0V@twitter.jcv2bll.mongodb.net/', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	// Clean the database before running tests
	await Note.deleteMany({});
	await User.deleteMany({});

	// Register and log in a user to get an auth token
	await request(app).post('/register').send(testUser);
	const res = await request(app).post('/login').send(testUser);
	authToken = res.body.token;
});

afterAll(async () => {
	// Disconnect and clean up database
	await mongoose.connection.db.dropDatabase();
	await mongoose.connection.close();
});

describe('Notes API', () => {
	let noteId;

	test('Should create a new note', async () => {
		const res = await request(app)
			.post('/notes')
			.send({ content: 'This is a test note' })
			.set('Authorization', `Bearer ${authToken}`);

		expect(res.statusCode).toBe(201);
		expect(res.body).toHaveProperty('_id');
		expect(res.body.content).toBe('This is a test note');
		noteId = res.body._id;
	});

	test('Should fetch all notes', async () => {
		const res = await request(app).get('/notes').set('Authorization', `Bearer ${authToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0]).toHaveProperty('content', 'This is a test note');
	});

	test('Should update a note', async () => {
		const res = await request(app)
			.put(`/notes/${noteId}`)
			.send({ content: 'Updated test note' })
			.set('Authorization', `Bearer ${authToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('content', 'Updated test note');
	});

	test('Should delete a note', async () => {
		const res = await request(app).delete(`/notes/${noteId}`).set('Authorization', `Bearer ${authToken}`);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('message', 'Note deleted');
	});
});

describe('User Authentication API', () => {
	test('Should log in a user', async () => {
		const res = await request(app).post('/login').send(testUser);

		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('token');
	});

	test('Should not log in with invalid credentials', async () => {
		const res = await request(app).post('/login').send({ username: 'wronguser', password: 'wrongpassword' });

		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty('message', 'Invalid credentials');
	});
});
