require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session'); // Add express-session
const { User, Helpline, CommunityPost, QuizScore } = require('./mongodb'); // Ensure CommunityPost and QuizScore are imported

const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
hbs.registerHelper('formatDate', (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
});
// Configure express-session
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'cyberguard-secure-session-secret-key-2024', // Using a secure secret key
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true // Prevents client side JS from reading the cookie
    }
}));

app.get('/', (req, res) => {
    // Check if the user is logged in
    const user = req.session.user || null;
    res.render('index', {
        content: user ? 'Log Out' : 'Login',
        name: user ? `${user.firstName} ${user.lastName}` : 'User',
        form: user ? '/logout' : '/login', // Change form to point to logout if logged in
        successMessage: req.session.successMessage || ''
    });
    req.session.successMessage = ''; // Clear success message after displaying
});


app.get('/login', (req, res) => {
    res.render('login', { content: '' });
});

app.get('/signup', (req, res) => {
    res.render('signup', { content: '' });
});

app.get('/helpline', (req, res) => {
    res.render('helpline', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/training', (req, res) => {
    res.render('training', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/quiz', (req, res) => {
    res.render('quiz', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/lab', (req, res) => {
    res.render('lab', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/team-selection', (req, res) => {
    res.render('team-selection', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/white', (req, res) => {
    res.render('white', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/redteam', (req, res) => {
    res.render('redteam', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/penet', (req, res) => {
    res.render('penet', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/Social', (req, res) => {
    res.render('Social', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/cyber-game', (req, res) => {
    res.render('cyber-game', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/exploit', (req, res) => {
    res.render('exploit', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/architecture', (req, res) => {
    res.render('architecture', { user: req.session.user || null }); // Pass user info to helpline page
});


// Signup Route
// Signup Route
app.post('/signup', async (req, res) => {
    try {
        const check = await User.findOne({ name: req.body.name });
        if (check) {
            return res.render('signup', { content: 'Username already taken', wrongPassword: "Username taken" });
        } else {
            // const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password

            const data = {
                name: req.body.name,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                password: req.body.password, // Use the hashed password
            };

            const newUser = new User(data);
            await newUser.save();
            req.session.successMessage = "SignUp successful"; // Set success message
            return res.redirect('/'); // Redirect to home after signup
        }
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).send('Internal Server Error');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ name: req.body.name });

        if (!user) {
            return res.render('login', { content: 'Wrong Details', wrongPassword: 'Wrong Username' });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);

        if (isMatch) {
            // Store user information in session
            req.session.user = {
                name: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
            };
            req.session.successMessage = 'Login successful!'; // Set success message
            return res.redirect('/'); // Redirect to home after login
        } else {
            return res.render('login', { wrongPassword: 'Wrong Password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send('Internal Server Error');
    }
});
// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/'); // Redirect to home after logout
    });
});


// Community Page
app.get('/community', async (req, res) => {
    try {
        const posts = await CommunityPost.find().sort({ createdAt: -1 }); // Fetch posts sorted by latest first
        res.render('community', { user: req.session.user || null, posts });
    } catch (error) {
        console.error('Error fetching community posts:', error.message);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

// Post a new community message
app.post('/community/post', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to post.' });
    }

    const { text } = req.body;
    const username = req.session.user.name; // Use session name

    try {
        const newPost = new CommunityPost({ username, text });
        await newPost.save();
        res.redirect('/community');
    } catch (error) {
        console.error('Error posting message:', error.message);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

// Reply to a community post
app.post('/community/reply/:postId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to reply.' });
    }

    const { text } = req.body;
    const username = req.session.user.name; // Use session name
    const postId = req.params.postId;

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        post.replies.push({ username, text });
        await post.save();
        res.redirect('/community');
    } catch (error) {
        console.error('Error replying to post:', error.message);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

// Add leaderboard route
app.get('/leaderboard', async (req, res) => {
    try {
        const scores = await QuizScore.find()
            .sort({ percentage: -1, date: -1 })
            .limit(100); // Show top 100 scores
        
        res.render('leaderboard', {
            user: req.session.user || null,
            scores,
            content: req.session.user ? 'Log Out' : 'Login',
            name: req.session.user ? `${req.session.user.firstName} ${req.session.user.lastName}` : 'User',
            form: req.session.user ? '/logout' : '/login'
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Add API endpoint to save quiz scores
app.post('/api/save-quiz-score', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'You must be logged in to save scores.' });
    }

    try {
        const { score, totalQuestions } = req.body;
        const percentage = ((score / totalQuestions) * 100).toFixed(2);

        const newScore = new QuizScore({
            username: req.session.user.name,
            score,
            totalQuestions,
            percentage
        });

        await newScore.save();
        res.json({ success: true, message: 'Score saved successfully!' });
    } catch (error) {
        console.error('Error saving quiz score:', error);
        res.status(500).json({ error: 'Failed to save score.' });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    console.log('http://localhost:3000');
});
