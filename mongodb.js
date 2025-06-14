const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb+srv://ravitejamuvce:IGm70s5edUlSiON0@users.ex4rhva.mongodb.net/?retryWrites=true&w=majority&appName=Users', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema and Model
const LoginSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
 
});

LoginSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(this.password, salt);
        console.log('Hashed password:', hashPassword);
        this.password = hashPassword;
        next();
    } catch (error) {
        console.log('Error while hashing password:', error);
        next(error);
    }
});


const HelplineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    issueDescription: {
        type: String,
        required: true
    }
});

const replySchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
    username: { type: String, required: true },
    text: { type: String, required: true },
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now }
});

const CommunityPost = mongoose.model('CommunityPost', postSchema);

const User = mongoose.model('Authentication', LoginSchema);
const Helpline = mongoose.model('Helpline', HelplineSchema);

// Quiz Schema
const quizQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    difficultyLevel: { 
        type: String, 
        enum: ['Beginner', 'Intermediate', 'Hard'],
        required: true 
    }
});

const quizAttemptSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authentication', required: true },
    score: { type: Number, required: true },
    difficultyLevel: { 
        type: String, 
        enum: ['Beginner', 'Intermediate', 'Hard'],
        required: true 
    },
    completedAt: { type: Date, default: Date.now }
});

// TeamHub Schema
const teamHubSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    teamType: { type: String, enum: ['Red', 'White'], required: true },
    currentLevel: { type: Number, default: 1 },
    totalPoints: { type: Number, default: 0 },
    achievements: [{ type: String }],
    completedTopics: [{
        topicName: String,
        completedAt: { type: Date, default: Date.now },
        score: Number,
        pointsEarned: Number
    }],
    recentActivities: [{
        type: { type: String, enum: ['quiz', 'challenge', 'achievement'] },
        description: String,
        points: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Activity Schema
const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Authentication', required: true },
    activityType: { 
        type: String, 
        enum: ['Quiz', 'Game', 'Challenge'],
        required: true 
    },
    activityName: { type: String, required: true },
    score: { type: Number },
    completedAt: { type: Date, default: Date.now }
});

// Create models
const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
const TeamProgress = mongoose.model('TeamProgress', teamHubSchema);
const Activity = mongoose.model('Activity', activitySchema);

module.exports = { 
    User, 
    Helpline, 
    CommunityPost,
    QuizQuestion,
    QuizAttempt,
    TeamProgress,
    Activity
};