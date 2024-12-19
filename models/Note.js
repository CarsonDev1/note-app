const mongoose = require('mongoose');

// Định nghĩa schema cho Note
const noteSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

// Tạo model từ schema
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
