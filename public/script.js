document.addEventListener('DOMContentLoaded', function() {
    // Initialize default users if localStorage is empty
    const defaultUsers = [
        { id: 1, name: 'Admin User', username: 'admin', password: 'admin123', type: 'admin' },
        { id: 5, name: 'Ana Rodríguez', username: 'ana', password: 'worker1', type: 'worker' },
        { id: 6, name: 'Miguel Torres', username: 'miguel', password: 'worker2', type: 'worker' },
        { id: 7, name: 'Isabel Ruiz', username: 'isabel', password: 'worker3', type: 'worker' }
    ];

    // Initialize students data structure if empty
    const defaultStudents = [];

    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('students')) {
        localStorage.setItem('students', JSON.stringify(defaultStudents));
    }

    const loginForm = document.getElementById('loginForm');
    const userTypeButtons = document.querySelectorAll('.user-type-btn');
    let selectedUserType = 'parent'; // Default user type

    userTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            userTypeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedUserType = this.dataset.type;
        });
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user with matching credentials and type
        const user = users.find(u => 
            u.username === username && 
            u.password === password && 
            u.type === selectedUserType
        );

        if (user) {
            // Store current user info in session
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect based on user type
            switch(user.type) {
                case 'admin':
                    window.location.href = 'admin-dashboard.html';
                    break;
                case 'worker':
                    window.location.href = 'worker-dashboard.html';
                    break;
                case 'parent':
                    window.location.href = 'parent-dashboard.html';
                    break;
            }
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });
});