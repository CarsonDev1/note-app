// Helper: Show notification
function showNotification(message) {
	const notification = document.getElementById('notification');
	notification.textContent = message;
	notification.style.display = 'block';
	setTimeout(() => {
		notification.style.display = 'none';
	}, 3000);
}

// Kiểm tra xem người dùng đã đăng nhập chưa
if (window.location.pathname === '/notes.html') {
	if (!localStorage.getItem('token')) {
		window.location.href = 'index.html'; // Nếu không có token, chuyển đến trang đăng nhập
	} else {
		const userNameElement = document.getElementById('userName');
		const token = localStorage.getItem('token');
		const decodedToken = jwt_decode(token);
		userNameElement.textContent = `Welcome, ${decodedToken.username}`;
	}
}

// Đăng nhập
document.getElementById('loginButton')?.addEventListener('click', async () => {
	const username = document.getElementById('loginUsername').value;
	const password = document.getElementById('loginPassword').value;

	const response = await fetch('http://localhost:5000/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	});

	const data = await response.json();
	if (response.ok) {
		localStorage.setItem('token', data.token);
		window.location.href = 'notes.html'; // Chuyển đến trang ghi chú sau khi đăng nhập thành công
	} else {
		alert(data.message);
	}
});

// Đăng ký
document.getElementById('registerButton')?.addEventListener('click', async () => {
	const username = document.getElementById('registerUsername').value;
	const password = document.getElementById('registerPassword').value;

	const response = await fetch('http://localhost:5000/register', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	});

	const data = await response.json();
	if (response.ok) {
		alert('Registration successful! Now you can log in.');
		window.location.href = 'index.html'; // Quay lại trang đăng nhập sau khi đăng ký thành công
	} else {
		alert(data.message);
	}
});

// Đăng xuất
document.getElementById('logoutButton')?.addEventListener('click', () => {
	localStorage.removeItem('token');
	window.location.href = 'index.html'; // Quay lại trang đăng nhập
});

// Thêm ghi chú
// Thêm ghi chú (Send to backend and save to database)
document.getElementById('addNoteButton').addEventListener('click', async () => {
	const noteInput = document.getElementById('noteInput');
	const content = noteInput.value.trim();
	if (!content) return;

	const date = new Date().toLocaleString();
	const note = { content, date };

	// Send the note to the backend (POST request)
	const response = await fetch('http://localhost:5000/notes', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(note),
	});

	const data = await response.json();
	if (response.ok) {
		// Render new note on client-side
		renderNote(data);
		noteInput.value = '';
		showNotification('Note added successfully!');
	} else {
		alert(data.message);
	}
});

// Load notes from the database on page load
window.addEventListener('DOMContentLoaded', async () => {
	const response = await fetch('http://localhost:5000/notes');
	const notes = await response.json();
	if (response.ok) {
		notes.forEach((note) => renderNote(note));
	} else {
		alert('Failed to load notes');
	}
});

// Render một ghi chú
function renderNote({ _id, content, date }) {
	const noteList = document.getElementById('noteList');
	const noteEl = document.createElement('div');
	noteEl.className = 'note';
	noteEl.dataset.id = _id;
	noteEl.innerHTML = `
    <div class="note-content">${content}</div>
    <div class="note-time">${new Date(date).toLocaleString()}</div>
    <div class="note-actions">
      <button class="edit" onclick="editNote('${_id}')">✏️</button>
      <button class="delete" onclick="deleteNote('${_id}')">🗑️</button>
    </div>
  `;
	noteList.appendChild(noteEl);
}

// Sửa ghi chú
function editNote(id) {
	const noteEl = document.querySelector(`.note[data-id="${id}"]`);
	const content = noteEl.querySelector('.note-content').textContent;
	currentEditId = id;
	editInput.value = content;
	editModal.classList.remove('hidden');
}

// Lưu ghi chú đã chỉnh sửa
document.getElementById('saveEdit').addEventListener('click', async () => {
	const content = editInput.value.trim();
	if (!content) return;

	const response = await fetch(`http://localhost:5000/notes/${currentEditId}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ content }),
	});

	const data = await response.json();
	if (response.ok) {
		const noteEl = document.querySelector(`.note[data-id="${currentEditId}"]`);
		noteEl.querySelector('.note-content').textContent = content;

		editModal.classList.add('hidden');
		showNotification('Note updated successfully!');
	} else {
		alert(data.message);
	}
});

// Hủy bỏ chỉnh sửa
document.getElementById('cancelEdit').addEventListener('click', () => {
	editModal.classList.add('hidden');
});

// Xóa ghi chú
function deleteNote(id) {
	const noteEl = document.querySelector(`.note[data-id="${id}"]`);
	if (!noteEl) return;

	fetch(`http://localhost:5000/notes/${id}`, {
		method: 'DELETE',
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.message === 'Note deleted') {
				noteEl.remove();
				showNotification('Note deleted successfully!');
			} else {
				alert(data.message);
			}
		})
		.catch((err) => alert('Error deleting note'));
}
