document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is parent
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'parent') {
        window.location.href = 'index.html';
        return;
    }

    const studentGradesContainer = document.getElementById('studentGrades');
    const logoutBtn = document.getElementById('logoutBtn');

    function translateGrade(grade) {
        const translations = {
            'good': 'Bien',
            'regular': 'Regular',
            'bad': 'Mal'
        };
        return translations[grade] || grade;
    }

    function getGradeClass(grade) {
        return grade ? grade : 'no-grade';
    }

    function displayGrades() {
        // Get students associated with current parent
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const myStudents = students.filter(student => student.parentId === currentUser.id);
        const grades = JSON.parse(localStorage.getItem('grades')) || {};
        const today = getTodayDate();

        studentGradesContainer.innerHTML = '';

        if (myStudents.length === 0) {
            studentGradesContainer.innerHTML = '<p class="no-students">No hay estudiantes registrados</p>';
            return;
        }

        myStudents.forEach(student => {
            const studentSection = document.createElement('div');
            studentSection.className = 'student-section';
            
            const studentHeader = document.createElement('div');
            studentHeader.className = 'student-header';
            studentHeader.innerHTML = `
                <h3>${student.name}</h3>
                <span class="student-course">${student.course.toUpperCase()}</span>
            `;

            const gradesGrid = document.createElement('div');
            gradesGrid.className = 'grades-grid';

            // Get today's grades for this student
            const todayGrades = grades[today]?.[student.id] || {};

            // Create grade cards
            const gradeTypes = [
                { id: 'firstPlate', name: 'Primer Plato' },
                { id: 'secondPlate', name: 'Segundo Plato' },
                { id: 'dessert', name: 'Postre' },
                { id: 'attitude', name: 'Actitud' }
            ];

            gradeTypes.forEach(type => {
                const grade = todayGrades[type.id];
                const card = document.createElement('div');
                card.className = 'grade-card';
                card.innerHTML = `
                    <h4>${type.name}</h4>
                    <div class="grade-value ${getGradeClass(grade)}">
                        ${grade ? translateGrade(grade) : 'Pendiente'}
                    </div>
                `;
                gradesGrid.appendChild(card);
            });

            studentSection.appendChild(studentHeader);
            studentSection.appendChild(gradesGrid);
            studentGradesContainer.appendChild(studentSection);
        });

        // Update last update time
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        document.getElementById('lastUpdate').textContent = now.toLocaleDateString('es-ES', options);
    }

    // Helper function to get today's date in YYYY-MM-DD format
    function getTodayDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Handle logout
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Initial load
    displayGrades();

    // Refresh grades every minute
    setInterval(displayGrades, 60000);
});