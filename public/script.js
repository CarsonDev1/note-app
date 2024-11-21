const noteInput = document.getElementById('noteInput');
const noteList = document.getElementById('noteList');
const editModal = document.getElementById('editModal');
const editInput = document.getElementById('editInput');
const notification = document.getElementById('notification');
let currentEditId = null;

// Helper: Show notification
function showNotification(message) {
	notification.textContent = message;
	notification.style.display = 'block';
	setTimeout(() => {
		notification.style.display = 'none';
	}, 3000);
}

// Add Note
document.getElementById('addNoteButton').addEventListener('click', () => {
	const content = noteInput.value.trim();
	if (!content) return;

	const date = new Date().toLocaleString();
	const id = Date.now();
	const note = { id, content, date };

	// Render new note
	renderNote(note);
	noteInput.value = '';
	showNotification('Note added successfully!');
});

// Render a note
function renderNote({ id, content, date }) {
	const noteEl = document.createElement('div');
	noteEl.className = 'note';
	noteEl.dataset.id = id;
	noteEl.innerHTML = `
    <div class="note-content">${content}</div>
    <div class="note-time">${date}</div>
    <div class="note-actions">
      <button class="edit" onclick="editNote(${id})">✏️</button>
      <button class="delete" onclick="deleteNote(${id})">🗑️</button>
    </div>
  `;
	noteList.appendChild(noteEl);
}

// Edit Note
function editNote(id) {
	const noteEl = document.querySelector(`.note[data-id="${id}"]`);
	const content = noteEl.querySelector('.note-content').textContent;
	currentEditId = id;
	editInput.value = content;
	editModal.classList.remove('hidden');
}

// Save Edited Note
document.getElementById('saveEdit').addEventListener('click', () => {
	const content = editInput.value.trim();
	if (!content) return;

	const noteEl = document.querySelector(`.note[data-id="${currentEditId}"]`);
	noteEl.querySelector('.note-content').textContent = content;

	editModal.classList.add('hidden');
	showNotification('Note updated successfully!');
});

// Cancel Edit
document.getElementById('cancelEdit').addEventListener('click', () => {
	editModal.classList.add('hidden');
});

// Delete Note
function deleteNote(id) {
	const noteEl = document.querySelector(`.note[data-id="${id}"]`);
	noteEl.remove();
	showNotification('Note deleted successfully!');
}
