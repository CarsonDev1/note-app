const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

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
	.then(() => console.log('MongoDB connected'))
	.catch((err) => console.error('MongoDB connection error:', err));

// Note schema and model
const noteSchema = new mongoose.Schema({
	content: { type: String, required: true },
	date: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

// Routes
app.get('/notes', async (req, res) => {
	const notes = await Note.find();
	res.json(notes);
});

// Get a specific note
app.get('/notes/:id', async (req, res) => {
	try {
		const note = await Note.findById(req.params.id);
		if (!note) {
			return res.status(404).json({ message: 'Note not found' });
		}
		res.json(note);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch the note' });
	}
});

app.post('/notes', async (req, res) => {
	const note = new Note({
		content: req.body.content,
		date: req.body.date || Date.now(),
	});
	await note.save();
	res.json(note);
});

app.put('/notes/:id', async (req, res) => {
	const updatedNote = await Note.findByIdAndUpdate(req.params.id, { content: req.body.content }, { new: true });
	res.json(updatedNote);
});

app.delete('/notes/:id', async (req, res) => {
	await Note.findByIdAndDelete(req.params.id);
	res.json({ message: 'Note deleted' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
