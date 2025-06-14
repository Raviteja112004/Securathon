require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session'); // Add express-session
const { User, Helpline, CommunityPost, QuizQuestion, QuizAttempt, TeamProgress, Activity } = require('./mongodb'); // Ensure CommunityPost is imported

const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));
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
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 60000 } // Set cookie expiration (1 minute for demo purposes)
}));

// Register Handlebars helpers
hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

// Middleware to add path to all templates
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

// Middleware to add user data to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.get('/', (req, res) => {
    const user = req.session.user || null;
    res.render('index', {
        user: user,
        content: user ? 'Log Out' : 'Login',
        name: user ? `${user.firstName} ${user.lastName}` : 'User',
        form: user ? '/logout' : '/login',
        successMessage: req.session.successMessage || ''
    });
    req.session.successMessage = '';
});

app.get('/login', (req, res) => {
    res.render('login', { 
        user: req.session.user || null,
        content: '' 
    });
});

app.get('/signup', (req, res) => {
    res.render('signup', { 
        user: req.session.user || null,
        content: '' 
    });
});

app.get('/helpline', (req, res) => {
    res.render('helpline', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/training', (req, res) => {
    res.render('training', { user: req.session.user || null }); // Pass user info to helpline page
});

app.get('/quiz', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('quiz', { user: req.session.user });
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

// Cyber Lab Routes
app.get('/cyberlab', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('cyberlab', { user: req.session.user });
});

// Community Feed Routes
app.get('/community', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('community', { user: req.session.user });
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

// Quiz Routes
app.get('/api/quiz/questions', async (req, res) => {
    try {
        const { difficulty, count = 5 } = req.query;
        const questions = await QuizQuestion.aggregate([
            { $match: { difficultyLevel: difficulty } },
            { $sample: { size: parseInt(count) } }
        ]);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

app.post('/api/quiz/submit', async (req, res) => {
    try {
        const { userId, answers, difficulty } = req.body;
        const questions = await QuizQuestion.find({
            _id: { $in: Object.keys(answers) }
        });

        let score = 0;
        questions.forEach(question => {
            if (question.correctAnswer === answers[question._id]) {
                score++;
            }
        });

        const attempt = new QuizAttempt({
            userId,
            score,
            difficultyLevel: difficulty
        });
        await attempt.save();

        // Update team progress if exists
        const teamProgress = await TeamProgress.findOne({ userId });
        if (teamProgress) {
            teamProgress.totalScore += score;
            await teamProgress.save();
        }

        res.json({ score, totalQuestions: questions.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});

// TeamHub Routes
app.get('/teamhub', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('teamhub', { user: req.session.user });
});

app.post('/api/team/select', async (req, res) => {
    try {
        const { userId, teamType } = req.body;
        let teamProgress = await TeamProgress.findOne({ userId });

        if (teamProgress) {
            teamProgress.teamType = teamType;
            teamProgress.updatedAt = new Date();
        } else {
            teamProgress = new TeamProgress({
                userId,
                teamType,
                currentLevel: 1,
                totalPoints: 0,
                achievements: [],
                completedTopics: [],
                recentActivities: []
            });
        }

        await teamProgress.save();
        res.json(teamProgress);
    } catch (error) {
        console.error('Error selecting team:', error);
        res.status(500).json({ error: 'Failed to select team' });
    }
});

app.post('/api/team/update-points', async (req, res) => {
    try {
        const { userId, points, activity } = req.body;
        const teamProgress = await TeamProgress.findOne({ userId });

        if (!teamProgress) {
            return res.status(404).json({ error: 'Team progress not found' });
        }

        // Update total points
        teamProgress.totalPoints += points;

        // Add activity to recent activities
        teamProgress.recentActivities.unshift({
            type: activity.type,
            description: activity.description,
            points: points,
            timestamp: new Date()
        });

        // Keep only last 10 activities
        if (teamProgress.recentActivities.length > 10) {
            teamProgress.recentActivities = teamProgress.recentActivities.slice(0, 10);
        }

        // Check for achievements
        const newAchievements = checkAchievements(teamProgress);
        if (newAchievements.length > 0) {
            teamProgress.achievements.push(...newAchievements);
            // Add achievement activities
            newAchievements.forEach(achievement => {
                teamProgress.recentActivities.unshift({
                    type: 'achievement',
                    description: `Unlocked achievement: ${achievement}`,
                    points: 50, // Bonus points for achievements
                    timestamp: new Date()
                });
            });
        }

        // Update level based on total points
        const newLevel = Math.floor(teamProgress.totalPoints / 1000) + 1;
        if (newLevel > teamProgress.currentLevel) {
            teamProgress.currentLevel = newLevel;
            teamProgress.recentActivities.unshift({
                type: 'achievement',
                description: `Reached level ${newLevel}!`,
                points: 100, // Bonus points for leveling up
                timestamp: new Date()
            });
        }

        teamProgress.updatedAt = new Date();
        await teamProgress.save();

        res.json({
            totalPoints: teamProgress.totalPoints,
            currentLevel: teamProgress.currentLevel,
            achievements: teamProgress.achievements,
            recentActivities: teamProgress.recentActivities
        });
    } catch (error) {
        console.error('Error updating points:', error);
        res.status(500).json({ error: 'Failed to update points' });
    }
});

app.get('/api/team/leaderboard', async (req, res) => {
    try {
        const leaderboard = await TeamProgress.find()
            .sort({ totalPoints: -1 })
            .limit(10)
            .select('userId totalPoints currentLevel');

        // Get usernames for the leaderboard
        const leaderboardWithUsernames = await Promise.all(
            leaderboard.map(async (entry) => {
                const user = await User.findById(entry.userId);
                return {
                    rank: leaderboard.indexOf(entry) + 1,
                    username: user ? user.name : 'Unknown',
                    points: entry.totalPoints,
                    level: entry.currentLevel
                };
            })
        );

        res.json(leaderboardWithUsernames);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Helper function to check for achievements
function checkAchievements(teamProgress) {
    const newAchievements = [];
    const currentAchievements = new Set(teamProgress.achievements);

    // First victory achievement
    if (teamProgress.totalPoints >= 100 && !currentAchievements.has('first_win')) {
        newAchievements.push('first_win');
    }

    // Perfect score achievement
    const hasPerfectScore = teamProgress.completedTopics.some(topic => topic.score === 100);
    if (hasPerfectScore && !currentAchievements.has('perfect_score')) {
        newAchievements.push('perfect_score');
    }

    // Team player achievement
    const teamChallenges = teamProgress.recentActivities.filter(
        activity => activity.type === 'challenge'
    ).length;
    if (teamChallenges >= 5 && !currentAchievements.has('team_player')) {
        newAchievements.push('team_player');
    }

    // Security expert achievement
    if (teamProgress.currentLevel >= 5 && !currentAchievements.has('security_expert')) {
        newAchievements.push('security_expert');
    }

    return newAchievements;
}

// Dashboard Routes
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
});

app.get('/api/dashboard/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [quizAttempts, teamProgress, recentActivities] = await Promise.all([
            QuizAttempt.find({ userId }).sort({ completedAt: -1 }).limit(5),
            TeamProgress.findOne({ userId }),
            Activity.find({ userId }).sort({ completedAt: -1 }).limit(5)
        ]);

        const user = await User.findById(userId);
        
        res.json({
            username: user.name,
            quizHistory: quizAttempts,
            teamProgress,
            recentActivities,
            totalScore: teamProgress ? teamProgress.totalScore : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    console.log('http://localhost:3000');
});
