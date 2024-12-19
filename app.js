const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Note = require('./models/Note'); // Import Note model
const User = require('./models/User'); // Import User model

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
	.connect('mongodb+srv://admin:HqLPXhuroWmKsw0V@twitter.jcv2bll.mongodb.net/', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('MongoDB connected successfully'))
	.catch((err) => console.error('MongoDB connection error:', err.message));

// Middleware for authentication
const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Unauthorized: No token provided' });
	}

	const token = authHeader.split(' ')[1];
	try {
		const decoded = jwt.verify(token, 'secret-key');
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized: Invalid token' });
	}
};

// Routes

// Create a new note (protected route)
app.post('/notes', async (req, res) => {
	try {
		const { content } = req.body;
		if (!content) {
			return res.status(400).json({ message: 'Note content is required' });
		}

		const note = new Note({
			content,
			date: Date.now(),
		});
		await note.save();
		res.status(201).json(note);
	} catch (error) {
		console.error('Error saving note:', error);
		res.status(500).json({ message: 'Error saving note', error: error.message });
	}
});

// Get all notes (protected route)
app.get('/notes', async (req, res) => {
	try {
		const notes = await Note.find();
		res.json(notes);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
	}
});

// Update a note by ID (protected route)
app.put('/notes/:id', async (req, res) => {
	try {
		const { content } = req.body;

		if (!content) {
			return res.status(400).json({ message: 'Note content is required' });
		}

		const updatedNote = await Note.findByIdAndUpdate(
			req.params.id,
			{ content },
			{ new: true } // Return the updated note
		);

		if (!updatedNote) {
			return res.status(404).json({ message: 'Note not found' });
		}

		res.json(updatedNote);
	} catch (error) {
		res.status(500).json({ message: 'Failed to update the note', error: error.message });
	}
});

// Delete a note by ID (protected route)
app.delete('/notes/:id', async (req, res) => {
	try {
		const deletedNote = await Note.findByIdAndDelete(req.params.id);

		if (!deletedNote) {
			return res.status(404).json({ message: 'Note not found' });
		}

		res.json({ message: 'Note deleted' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete the note', error: error.message });
	}
});

// User registration
app.post('/register', async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ message: 'Username and password are required' });
		}

		const existingUser = await User.findOne({ username });

		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hashedPassword });

		await user.save();
		res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Error registering user', error: error.message });
	}
});

// User login
app.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ message: 'Username and password are required' });
		}

		const user = await User.findOne({ username });

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = jwt.sign({ id: user._id, username: user.username }, 'secret-key', {
			expiresIn: '1h',
		});

		res.json({ token });
	} catch (error) {
		res.status(500).json({ message: 'Error logging in', error: error.message });
	}
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Unhandled error:', err);
	res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app; // Export app for testing
