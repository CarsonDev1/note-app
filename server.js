const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // For password hashing

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

// User schema and model
const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Routes
app.post('/notes', async (req, res) => {
	try {
		const { content, date } = req.body;
		const note = new Note({
			content,
			date: date || Date.now(),
		});
		await note.save(); // Save the note to the database

		// Return the saved note so it can be rendered on the frontend
		res.status(201).json(note);
	} catch (error) {
		res.status(500).json({ message: 'Error saving note' });
	}
});

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

app.get('/notes', async (req, res) => {
	const notes = await Note.find();
	res.json(notes);
});

app.put('/notes/:id', async (req, res) => {
	try {
		const updatedNote = await Note.findByIdAndUpdate(req.params.id, { content: req.body.content }, { new: true });

		if (!updatedNote) {
			return res.status(404).json({ message: 'Note not found' });
		}

		res.json(updatedNote);
	} catch (error) {
		res.status(500).json({ message: 'Failed to update the note' });
	}
});

app.delete('/notes/:id', async (req, res) => {
	try {
		const deletedNote = await Note.findByIdAndDelete(req.params.id);

		if (!deletedNote) {
			return res.status(404).json({ message: 'Note not found' });
		}

		res.json({ message: 'Note deleted' });
	} catch (error) {
		res.status(500).json({ message: 'Failed to delete the note' });
	}
});

// Route đăng nhập
app.post('/login', async (req, res) => {
	const { username, password } = req.body;

	// Tìm người dùng trong cơ sở dữ liệu (MongoDB)
	const user = await User.findOne({ username });
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	// Kiểm tra mật khẩu (Dùng bcrypt để so sánh mật khẩu đã mã hóa)
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		return res.status(401).json({ message: 'Incorrect password' });
	}

	// Tạo token JWT
	const token = jwt.sign({ username: user.username, id: user._id }, 'secret-key', { expiresIn: '1h' });

	// Trả về token cho client
	res.json({ token });
});

// Route đăng ký người dùng
app.post('/register', async (req, res) => {
	const { username, password } = req.body;

	// Kiểm tra xem tên người dùng đã tồn tại chưa
	const existingUser = await User.findOne({ username });
	if (existingUser) {
		return res.status(400).json({ message: 'User already exists' });
	}

	// Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
	const hashedPassword = await bcrypt.hash(password, 10);

	const user = new User({
		username,
		password: hashedPassword,
	});

	await user.save();
	res.status(201).json({ message: 'User registered successfully' });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
