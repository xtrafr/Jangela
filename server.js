const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for development
// Note: This will reset when the server restarts
let users = [
  // Default admin user
  {
    id: 1,
    name: 'Admin',
    username: 'admin',
    password: 'admin',
    type: 'admin'
  }
];
let students = [];

// API Routes
app.post('/api/users', (req, res) => {
  try {
    const { name, username, password, type, students: newStudents } = req.body;
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const userId = Date.now();
    const user = { id: userId, name, username, password, type };
    users.push(user);

    if (type === 'parent' && newStudents) {
      newStudents.forEach(student => {
        students.push({
          ...student,
          id: Date.now() + Math.random(),
          parentId: userId
        });
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', (req, res) => {
  try {
    const usersWithStudents = users.map(user => {
      if (user.type === 'parent') {
        const userStudents = students.filter(s => s.parentId === user.id);
        return { ...user, students: userStudents };
      }
      return user;
    });
    
    res.json(usersWithStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    // Remove user's students if any
    students = students.filter(s => s.parentId !== userId);
    
    // Remove user
    users = users.filter(u => u.id !== userId);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle all routes by serving index.html from public directory
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// For Vercel serverless deployment
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
