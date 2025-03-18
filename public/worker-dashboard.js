document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is worker
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser || currentUser.type !== 'worker') {
        window.location.href = 'index.html';
        return;
    }

    const courseSelect = document.getElementById('courseSelect');
    const studentsList = document.getElementById('studentsList');
    const gradingForm = document.getElementById('gradingForm');
    const selectedStudentName = document.getElementById('selectedStudentName');
    const mealGradingForm = document.getElementById('mealGradingForm');
    const logoutBtn = document.getElementById('logoutBtn');
    let currentStudentId = null;

    // Load students based on selected course
    function loadStudents(course = '') {
        const students = JSON.parse(localStorage.getItem('students')) || [];
        studentsList.innerHTML = '';

        const filteredStudents = course 
            ? students.filter(student => student.course === course)
            : students;

        if (filteredStudents.length === 0) {
            studentsList.innerHTML = '<p class="no-students">No hay estudiantes en este curso</p>';
            return;
        }

        // Group students by course for better organization
        const studentsByCourse = {};
        filteredStudents.forEach(student => {
            if (!studentsByCourse[student.course]) {
                studentsByCourse[student.course] = [];
            }
            studentsByCourse[student.course].push(student);
        });

        // Display students grouped by course
        Object.entries(studentsByCourse)
            .sort(([courseA], [courseB]) => courseA.localeCompare(courseB))
            .forEach(([course, courseStudents]) => {
                const courseSection = document.createElement('div');
                courseSection.className = 'course-section';
                courseSection.innerHTML = `<h3 class="course-title">${course.toUpperCase()}</h3>`;

                const studentsGrid = document.createElement('div');
                studentsGrid.className = 'students-grid';

                courseStudents
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .forEach(student => {
                        const studentCard = document.createElement('div');
                        studentCard.className = 'student-card';
                        studentCard.innerHTML = `
                            <h4>${student.name}</h4>
                            <button class="grade-student-btn" data-student-id="${student.id}">
                                Calificar
                            </button>
                        `;
                        studentsGrid.appendChild(studentCard);
                    });

                courseSection.appendChild(studentsGrid);
                studentsList.appendChild(courseSection);
            });
    }

    // Handle course filter change
    courseSelect.addEventListener('change', function() {
        loadStudents(this.value);
        gradingForm.style.display = 'none';
    });

    // Handle student selection for grading
    studentsList.addEventListener('click', function(e) {
        const gradeBtn = e.target.closest('.grade-student-btn');
        if (!gradeBtn) return;

        const studentId = gradeBtn.dataset.studentId;
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const student = students.find(s => String(s.id) === studentId); // Convert to string for comparison

        if (student) {
            currentStudentId = studentId;
            selectedStudentName.textContent = student.name;
            gradingForm.style.display = 'block';
            gradingForm.scrollIntoView({ behavior: 'smooth' });

            // Clear previous selections
            document.querySelectorAll('.grade-btn.selected').forEach(btn => {
                btn.classList.remove('selected');
            });

            // Load existing grades if any
            const grades = JSON.parse(localStorage.getItem('grades')) || {};
            const todayGrades = grades[getTodayDate()]?.[studentId];
            
            if (todayGrades) {
                Object.entries(todayGrades).forEach(([plate, grade]) => {
                    const btn = document.querySelector(`.grade-buttons[data-plate="${plate}"] .grade-btn[data-grade="${grade}"]`);
                    if (btn) btn.classList.add('selected');
                });
            }
        }
    });

    // Handle grade button clicks
    document.querySelectorAll('.grade-btn').forEach(button => {
        button.addEventListener('click', function() {
            const gradeButtons = this.parentElement.querySelectorAll('.grade-btn');
            gradeButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Handle form submission
    mealGradingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!currentStudentId) {
            alert('Por favor, seleccione un estudiante');
            return;
        }

        // Get selected grades
        const studentGrades = {
            firstPlate: document.querySelector('.grade-buttons[data-plate="first"] .grade-btn.selected')?.dataset.grade,
            secondPlate: document.querySelector('.grade-buttons[data-plate="second"] .grade-btn.selected')?.dataset.grade,
            dessert: document.querySelector('.grade-buttons[data-plate="dessert"] .grade-btn.selected')?.dataset.grade,
            attitude: document.querySelector('.grade-buttons[data-plate="attitude"] .grade-btn.selected')?.dataset.grade
        };

        // Validate all grades are selected
        if (!studentGrades.firstPlate || !studentGrades.secondPlate || 
            !studentGrades.dessert || !studentGrades.attitude) {
            alert('Por favor, seleccione todas las calificaciones');
            return;
        }

        // Save grades
        const today = getTodayDate();
        const grades = JSON.parse(localStorage.getItem('grades')) || {};
        
        if (!grades[today]) {
            grades[today] = {};
        }
        
        grades[today][currentStudentId] = studentGrades;
        localStorage.setItem('grades', JSON.stringify(grades));

        // Reset form and show success message
        gradingForm.style.display = 'none';
        currentStudentId = null;
        alert('Calificaciones guardadas correctamente');
    });

    // Handle cancel button
    document.querySelector('.cancel-btn').addEventListener('click', function() {
        gradingForm.style.display = 'none';
        currentStudentId = null;
    });

    // Handle logout
    logoutBtn.addEventListener('click', function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Helper function to get today's date in YYYY-MM-DD format
    function getTodayDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // Initial load
    loadStudents();
});