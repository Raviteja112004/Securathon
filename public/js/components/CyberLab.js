class CyberLab {
    constructor() {
        this.currentModule = null;
        this.score = 0;
        this.totalQuestions = 0;
    }

    init() {
        this.renderLabSelector();
    }

    renderLabSelector() {
        const labContainer = document.getElementById('cyber-lab-container');
        if (!labContainer) return;

        labContainer.innerHTML = `
            <div class="lab-selector">
                <h2>Cyber Security Lab</h2>
                <p>Choose a module to practice your security skills:</p>
                <div class="module-cards">
                    <div class="module-card" onclick="cyberLab.startModule('phishing')">
                        <h3>Phishing Email Identification</h3>
                        <p>Learn to identify suspicious emails and protect yourself from phishing attacks.</p>
                        <div class="module-icon">📧</div>
                    </div>
                    <div class="module-card" onclick="cyberLab.startModule('malware')">
                        <h3>Malware Infection Simulation</h3>
                        <p>Practice safe file handling and learn about malware prevention.</p>
                        <div class="module-icon">🦠</div>
                    </div>
                    <div class="module-card" onclick="cyberLab.startModule('social')">
                        <h3>Social Engineering Chat</h3>
                        <p>Experience and learn to recognize social engineering attempts.</p>
                        <div class="module-icon">💬</div>
                    </div>
                </div>
            </div>
        `;
    }

    startModule(moduleType) {
        this.currentModule = moduleType;
        this.score = 0;
        this.totalQuestions = 0;

        switch (moduleType) {
            case 'phishing':
                this.startPhishingModule();
                break;
            case 'malware':
                this.startMalwareModule();
                break;
            case 'social':
                this.startSocialModule();
                break;
        }
    }

    startPhishingModule() {
        const labContainer = document.getElementById('cyber-lab-container');
        const emails = [
            {
                subject: "Your Amazon Order #12345",
                sender: "amazon@amazon.com",
                content: "Your recent order has been shipped. Click here to track your package.",
                isPhishing: false
            },
            {
                subject: "Urgent: Verify Your Account",
                sender: "security@paypal-secure.com",
                content: "Your account will be suspended unless you verify your details immediately.",
                isPhishing: true
            },
            {
                subject: "Meeting Tomorrow",
                sender: "boss@company.com",
                content: "Please review the attached agenda for tomorrow's meeting.",
                isPhishing: false
            },
            {
                subject: "You've Won a Prize!",
                sender: "lottery@winprize.com",
                content: "Congratulations! You've won $1,000,000. Click here to claim your prize.",
                isPhishing: true
            }
        ];

        let currentEmailIndex = 0;

        const showEmail = () => {
            if (currentEmailIndex >= emails.length) {
                this.showModuleResults();
                return;
            }

            const email = emails[currentEmailIndex];
            labContainer.innerHTML = `
                <div class="email-simulation">
                    <h3>Email Analysis</h3>
                    <div class="email-content">
                        <p><strong>From:</strong> ${email.sender}</p>
                        <p><strong>Subject:</strong> ${email.subject}</p>
                        <p>${email.content}</p>
                    </div>
                    <div class="email-actions">
                        <button onclick="cyberLab.checkPhishingAnswer(true)">Report Phishing</button>
                        <button onclick="cyberLab.checkPhishingAnswer(false)">Safe</button>
                    </div>
                </div>
            `;
        };

        showEmail();
    }

    checkPhishingAnswer(reportedAsPhishing) {
        const email = this.getCurrentEmail();
        const isCorrect = reportedAsPhishing === email.isPhishing;
        
        if (isCorrect) {
            this.score++;
        }
        this.totalQuestions++;

        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <p>${isCorrect ? 'Correct!' : 'Incorrect!'}</p>
            <p>${this.getPhishingFeedback(email)}</p>
            <button onclick="cyberLab.nextQuestion()">Continue</button>
        `;

        document.querySelector('.email-simulation').appendChild(feedback);
    }

    getPhishingFeedback(email) {
        if (email.isPhishing) {
            return `This was a phishing attempt. Red flags: ${this.getPhishingRedFlags(email)}`;
        }
        return "This was a legitimate email. Good job being cautious!";
    }

    getPhishingRedFlags(email) {
        const flags = [];
        if (email.sender.includes('-secure.com')) flags.push('suspicious domain');
        if (email.content.includes('urgent')) flags.push('urgency tactics');
        if (email.content.includes('click here')) flags.push('suspicious link');
        if (email.content.includes('prize')) flags.push('too good to be true');
        return flags.join(', ');
    }

    startMalwareModule() {
        const labContainer = document.getElementById('cyber-lab-container');
        const scenarios = [
            {
                fileName: "invoice.pdf",
                source: "Unknown Sender",
                isSafe: false
            },
            {
                fileName: "meeting_notes.docx",
                source: "colleague@company.com",
                isSafe: true
            },
            {
                fileName: "free_game.exe",
                source: "downloads@freegames.com",
                isSafe: false
            }
        ];

        let currentScenarioIndex = 0;

        const showScenario = () => {
            if (currentScenarioIndex >= scenarios.length) {
                this.showModuleResults();
                return;
            }

            const scenario = scenarios[currentScenarioIndex];
            labContainer.innerHTML = `
                <div class="malware-simulation">
                    <h3>File Download Alert</h3>
                    <div class="download-prompt">
                        <p><strong>File:</strong> ${scenario.fileName}</p>
                        <p><strong>From:</strong> ${scenario.source}</p>
                        <p>Would you like to run this file?</p>
                    </div>
                    <div class="download-actions">
                        <button onclick="cyberLab.checkMalwareAnswer(true)">Run</button>
                        <button onclick="cyberLab.checkMalwareAnswer(false)">Cancel</button>
                    </div>
                </div>
            `;
        };

        showScenario();
    }

    checkMalwareAnswer(runFile) {
        const scenario = this.getCurrentScenario();
        const isCorrect = runFile === scenario.isSafe;
        
        if (isCorrect) {
            this.score++;
        }
        this.totalQuestions++;

        const feedback = document.createElement('div');
        feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <p>${isCorrect ? 'Correct!' : 'Incorrect!'}</p>
            <p>${this.getMalwareFeedback(scenario, runFile)}</p>
            <button onclick="cyberLab.nextQuestion()">Continue</button>
        `;

        document.querySelector('.malware-simulation').appendChild(feedback);
    }

    getMalwareFeedback(scenario, runFile) {
        if (runFile && !scenario.isSafe) {
            return "Running this file could have infected your system with malware!";
        } else if (!runFile && scenario.isSafe) {
            return "This was a safe file from a trusted source.";
        } else if (runFile && scenario.isSafe) {
            return "Good choice! This was a safe file from a trusted source.";
        } else {
            return "Good choice! It's better to be cautious with unknown files.";
        }
    }

    startSocialModule() {
        const labContainer = document.getElementById('cyber-lab-container');
        const chatScenarios = [
            {
                message: "Hi, I'm from IT Support. We need to verify your account. Can you share your password?",
                options: [
                    { text: "Sure, here's my password: password123", isCorrect: false },
                    { text: "I need to verify your identity first", isCorrect: true },
                    { text: "What's your employee ID?", isCorrect: true }
                ]
            },
            {
                message: "I'm your manager. I need you to transfer $5000 to this account for an urgent project.",
                options: [
                    { text: "I'll do it right away", isCorrect: false },
                    { text: "Let me verify this request through official channels", isCorrect: true },
                    { text: "What's the project code?", isCorrect: true }
                ]
            }
        ];

        let currentScenarioIndex = 0;

        const showScenario = () => {
            if (currentScenarioIndex >= chatScenarios.length) {
                this.showModuleResults();
                return;
            }

            const scenario = chatScenarios[currentScenarioIndex];
            labContainer.innerHTML = `
                <div class="social-simulation">
                    <h3>Social Engineering Chat</h3>
                    <div class="chat-container">
                        <div class="chat-message received">
                            <p>${scenario.message}</p>
                        </div>
                        <div class="chat-options">
                            ${scenario.options.map((option, index) => `
                                <button onclick="cyberLab.checkSocialAnswer(${index})">
                                    ${option.text}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        };

        showScenario();
    }

    checkSocialAnswer(optionIndex) {
        const scenario = this.getCurrentScenario();
        const selectedOption = scenario.options[optionIndex];
        
        if (selectedOption.isCorrect) {
            this.score++;
        }
        this.totalQuestions++;

        const feedback = document.createElement('div');
        feedback.className = `feedback ${selectedOption.isCorrect ? 'correct' : 'incorrect'}`;
        feedback.innerHTML = `
            <p>${selectedOption.isCorrect ? 'Correct!' : 'Incorrect!'}</p>
            <p>${this.getSocialFeedback(selectedOption)}</p>
            <button onclick="cyberLab.nextQuestion()">Continue</button>
        `;

        document.querySelector('.chat-container').appendChild(feedback);
    }

    getSocialFeedback(option) {
        if (option.isCorrect) {
            return "Good job! You're following proper security protocols.";
        } else {
            return "Be careful! Never share sensitive information without proper verification.";
        }
    }

    nextQuestion() {
        switch (this.currentModule) {
            case 'phishing':
                this.startPhishingModule();
                break;
            case 'malware':
                this.startMalwareModule();
                break;
            case 'social':
                this.startSocialModule();
                break;
        }
    }

    showModuleResults() {
        const labContainer = document.getElementById('cyber-lab-container');
        const percentage = (this.score / this.totalQuestions) * 100;

        labContainer.innerHTML = `
            <div class="module-results">
                <h3>Module Complete!</h3>
                <p>Your score: ${this.score} out of ${this.totalQuestions} (${percentage.toFixed(1)}%)</p>
                <div class="result-feedback">
                    ${this.getResultFeedback(percentage)}
                </div>
                <button onclick="cyberLab.renderLabSelector()">Back to Modules</button>
            </div>
        `;
    }

    getResultFeedback(percentage) {
        if (percentage >= 90) {
            return "Excellent! You're a security expert!";
        } else if (percentage >= 70) {
            return "Good job! Keep practicing to improve your skills.";
        } else {
            return "Keep learning! Review the module to improve your security awareness.";
        }
    }
}

// Initialize CyberLab globally
window.cyberLab = new CyberLab(); 