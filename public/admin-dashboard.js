document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is admin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    const modal = document.getElementById('userModal');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeBtn = document.querySelector('.close');
    const userForm = document.getElementById('userForm');
    const userType = document.getElementById('userType');
    const studentSection = document.getElementById('studentSection');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentsList = document.getElementById('studentsList');
    const logoutBtn = document.getElementById('logoutBtn');

    // Show/hide student section based on user type selection
    userType.addEventListener('change', function() {
        studentSection.style.display = this.value === 'parent' ? 'block' : 'none';
        const studentInputs = studentSection.querySelectorAll('input, select');
        studentInputs.forEach(input => {
            input.required = this.value === 'parent';
        });
    });

    // Add new student fields
    addStudentBtn.addEventListener('click', function() {
        const studentEntry = document.createElement('div');
        studentEntry.className = 'student-entry';
        studentEntry.innerHTML = `
            <div class="form-group">
                <label>Nombre del Estudiante</label>
                <input type="text" class="student-name" required>
            </div>
            <div class="form-group">
                <label>Curso</label>
                <select class="student-course" required>
                    <option value="">Seleccionar curso</option>
                    <option value="hh">HH</option>
                    <option value="lh1">LH1</option>
                    <option value="lh2">LH2</option>
                    <option value="lh3">LH3</option>
                    <option value="lh4">LH4</option>
                    <option value="lh5">LH5</option>
                    <option value="lh6">LH6</option>
                    <option value="dbh1">DBH1</option>
                    <option value="dbh2">DBH2</option>
                    <option value="dbh3">DBH3</option>
                    <option value="dbh4">DBH4</option>
                </select>
            </div>
            <button type="button" class="remove-student-btn">Eliminar</button>
        `;
        studentsList.appendChild(studentEntry);

        // Add remove button functionality
        const removeBtn = studentEntry.querySelector('.remove-student-btn');
        removeBtn.addEventListener('click', function() {
            studentEntry.remove();
        });
    });

    // Show modal
    addUserBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        userForm.reset();
        document.getElementById('modalTitle').textContent = 'Añadir Usuario';
    });

    // Close modal
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle form submission
    userForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Validate passwords match
        const password = document.getElementById('userPassword').value;
        const confirmPassword = document.getElementById('userPasswordConfirm').value;
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Get form data
        const userData = {
            id: Date.now(), // Simple way to generate unique ID
            name: document.getElementById('userName').value,
            username: document.getElementById('userUsername').value,
            password: password,
            type: userType.value
        };

        // Get student information if parent
        if (userData.type === 'parent') {
            const studentEntries = studentsList.querySelectorAll('.student-entry');
            const students = Array.from(studentEntries).map(entry => ({
                name: entry.querySelector('.student-name').value,
                course: entry.querySelector('.student-course').value
            }));

            if (students.length === 0) {
                alert('Debe añadir al menos un estudiante');
                return;
            }

            // Save students to localStorage
            const existingStudents = JSON.parse(localStorage.getItem('students')) || [];
            const newStudents = students.map(student => ({
                id: Date.now() + Math.random(), // Simple way to generate unique ID
                name: student.name,
                course: student.course,
                parentId: userData.id
            }));
            localStorage.setItem('students', JSON.stringify([...existingStudents, ...newStudents]));
        }

        // Save user to localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));

        // Close modal and refresh table
        modal.style.display = 'none';
        loadUsers();
    });

    // Load and display users
    function loadUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const tableBody = document.getElementById('userTableBody');
        const students = JSON.parse(localStorage.getItem('students')) || [];

        tableBody.innerHTML = '';
        users.forEach(user => {
            if (user.type !== 'admin') { // Don't show admin in the table
                const row = document.createElement('tr');
                
                // Get student information if parent
                let studentInfo = '';
                if (user.type === 'parent') {
                    const userStudents = students.filter(s => s.parentId === user.id);
                    studentInfo = userStudents.map(s => `${s.name} (${s.course.toUpperCase()})`).join(', ');
                }

                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.username}</td>
                    <td>${user.type === 'parent' ? `Padre/Madre - ${studentInfo}` : 'Trabajador'}</td>
                    <td>
                        <button onclick="deleteUser(${user.id})" class="delete-btn">Eliminar</button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        });
    }

    // Delete user function
    window.deleteUser = function(userId) {
        if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            let students = JSON.parse(localStorage.getItem('students')) || [];

            // Remove user's students if it's a parent
            students = students.filter(student => student.parentId !== userId);
            localStorage.setItem('students', JSON.stringify(students));

            // Remove user
            users = users.filter(user => user.id !== userId);
            localStorage.setItem('users', JSON.stringify(users));

            loadUsers();
        }
    };

    // Handle logout
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Initial load
    loadUsers();
});