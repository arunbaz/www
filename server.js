const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const secretKey = 'your-secret-key';

// Enable CORS for all routes
app.use(cors());

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Use your MySQL username
  password: '', // Use your MySQL password
  database: 'events_db', // Ensure the database exists in MySQL
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Register user route
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;

  db.query(query, [name, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      return res.status(500).json({ message: 'Server error while registering user.' });
    }
    res.status(201).json({ message: 'User registered successfully.' });
  });
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ auth: false, message: 'Email and password are required' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return res.status(500).json({ auth: false, message: 'Server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ auth: false, message: 'User not found' });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ auth: false, message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ auth: true, token });
  });
});

// Middleware to verify the token
// Middleware to verify the token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];

  // Check if the token is provided
  if (!token) {
    console.log('No token provided');
    return res.status(403).json({ auth: false, message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token.split(' ')[1], secretKey, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err); // Log the error if token verification fails
      return res.status(500).json({ auth: false, message: 'Failed to authenticate token' });
    }

    console.log('Token verified successfully:', decoded); // Log success when token is verified
    req.userId = decoded.id; // Assign the user ID from the decoded token to the request
    next(); // Move on to the next middleware or route handler
  });
}


// Create event route (requires authentication)
app.post('/create-event', verifyToken, (req, res) => {
  const { event_name, event_date, location, sport } = req.body;

  const query = `INSERT INTO events (event_name, event_date, location, sport, user_id) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [event_name, event_date, location, sport, req.userId], (err, result) => {
    if (err) {
      console.error('Error creating event:', err);
      return res.status(500).json({ message: 'Server error while creating event.' }); // Return error as JSON
    }
    res.status(201).json({ message: 'Event created successfully.' });
  });
});


// View events route (fetch all events)
app.get('/view-events', (req, res) => {
  const query = `SELECT e.id, e.event_name, e.event_date, e.location, e.sport, u.name as organizer 
                 FROM events e 
                 JOIN users u ON e.user_id = u.id`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching events:', err);
      return res.status(500).json({ message: 'Server error while fetching events.' });
    }
    res.status(200).json(results);
  });
});

// Fetch user's registered events (requires authentication)
// Fetch user's registered events (requires authentication)
app.get('/my-events', verifyToken, (req, res) => {
  const query = `
    SELECT e.event_name, e.event_date, e.location, e.sport
    FROM events e
    JOIN registrations r ON e.id = r.event_id
    WHERE r.user_id = ?`;  // Ensure that the registration table is linked here

  db.query(query, [req.userId], (err, results) => {
    if (err) {
      console.error('Error fetching registered events:', err);
      return res.status(500).json({ message: 'Server error while fetching registered events.' });
    }

    // Ensure that an array is returned
    if (results.length === 0) {
      return res.status(200).json([]);  // Return an empty array if no events found
    }

    res.status(200).json(results);  // Return the registered events
  });
});

app.get('/available-events', (req, res) => {
  const query = `SELECT id, event_name FROM events`;  // Fetch only event IDs and names
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error while fetching events.' });
    }
    res.status(200).json(results);  // Send back the list of events
  });
});

// Register for event route (requires authentication)
app.post('/register-event', verifyToken, (req, res) => {
  const { event_id } = req.body;
  const user_id = req.userId; // Get user ID from token

  const query = `INSERT INTO registrations (user_id, event_id) VALUES (?, ?)`;

  db.query(query, [user_id, event_id], (err, result) => {
    if (err) {
      console.error('Error registering for event:', err);
      return res.status(500).json({ message: 'Server error while registering for event.' });
    }
    res.status(200).json({ message: 'Registered for event successfully.' });
  });
});


// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
