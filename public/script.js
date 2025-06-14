// DOM Elements with null checks and error handling
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const navLinks = document.querySelectorAll('.nav-links a') || [];
    const sections = document.querySelectorAll('section') || [];
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinksContainer = document.querySelector('.nav-links');
    const terminalContent = document.querySelector('.terminal-content');
    const notificationContainer = document.getElementById('notification-container');

    // Ensure notification container exists
    if (!notificationContainer) {
        const newNotificationContainer = document.createElement('div');
        newNotificationContainer.id = 'notification-container';
        document.body.appendChild(newNotificationContainer);
    }

    // Mobile Menu Toggle with null check
    if (mobileMenuBtn && navLinksContainer) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksContainer.classList.toggle('active');
        });
    }

    // Navigation System with error handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            try {
                // Update active link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
                
                // Show corresponding section
                const targetId = link.getAttribute('href')?.substring(1);
                if (!targetId) return;

                const targetSection = document.getElementById(targetId);
                if (!targetSection) return;

                sections.forEach(section => {
                    section.classList.remove('active-section');
                    section.classList.add('hidden-section');
                });

                targetSection.classList.remove('hidden-section');
                targetSection.classList.add('active-section');
                
                // Close mobile menu if open
                if (navLinksContainer) {
                    navLinksContainer.classList.remove('active');
                }
            } catch (error) {
                console.error('Navigation error:', error);
            }
        });
    });

    // Improved Notification System
    class NotificationSystem {
        static show(message, type = 'info', duration = 3000) {
            try {
                const container = document.getElementById('notification-container');
                if (!container) return;

                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                
                const text = document.createElement('span');
                text.textContent = message;
                
                notification.appendChild(text);
                container.appendChild(notification);
                
                // Remove notification after duration
                setTimeout(() => {
                    notification.style.animation = 'slideOut 0.3s ease forwards';
                    setTimeout(() => {
                        if (container.contains(notification)) {
                            container.removeChild(notification);
                        }
                    }, 300);
                }, duration);
            } catch (error) {
                console.error('Notification error:', error);
            }
        }
    }

    // Improved Terminal Simulation
    class TerminalSimulation {
        constructor(element) {
            if (!element) return;
            
            this.element = element;
            this.commandHistory = [];
            this.currentIndex = -1;
            this.setupTerminal();
        }
        
        setupTerminal() {
            try {
                this.element.innerHTML = '';
                this.addLine('Welcome to CyberGuard Terminal');
                this.addLine('Type "help" for available commands');
                this.addPrompt();
                
                this.element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const input = this.getCurrentInput();
                        if (input) this.handleCommand(input);
                    }
                });
            } catch (error) {
                console.error('Terminal setup error:', error);
            }
        }
        
        addLine(text) {
            const line = document.createElement('div');
            line.textContent = text;
            this.element.appendChild(line);
        }
        
        addPrompt() {
            const prompt = document.createElement('div');
            prompt.className = 'terminal-prompt';
            prompt.innerHTML = 'root@cyberlab:~# <span contenteditable="true" class="terminal-input"></span>';
            this.element.appendChild(prompt);
            
            const input = prompt.querySelector('.terminal-input');
            if (input) input.focus();
        }
        
        getCurrentInput() {
            return this.element.querySelector('.terminal-input')?.textContent || '';
        }
        
        handleCommand(command) {
            this.commandHistory.push(command);
            this.currentIndex = this.commandHistory.length;
            
            switch(command.toLowerCase()) {
                case 'help':
                    this.addLine('Available commands:');
                    this.addLine('- help: Show this help message');
                    this.addLine('- clear: Clear the terminal');
                    this.addLine('- scan: Perform a security scan');
                    break;
                
                case 'clear':
                    this.setupTerminal();
                    return;
                
                case 'scan':
                    this.performScan();
                    break;
                
                default:
                    this.addLine(`Command not found: ${command}`);
            }
            
            this.addPrompt();
        }
        
        performScan() {
            const steps = [
                'Initializing security scan...',
                'Checking system vulnerabilities...',
                'Analyzing network traffic...',
                'Scanning for malware...',
                'Generating report...'
            ];
            
            let i = 0;
            const interval = setInterval(() => {
                this.addLine(steps[i]);
                i++;
                
                if (i >= steps.length) {
                    clearInterval(interval);
                    this.addLine('Scan complete! No vulnerabilities found.');
                    this.addPrompt();
                }
            }, 1000);
        }
    }

    // Improved Team System
    class TeamSystem {
        constructor() {
            this.currentTeam = localStorage.getItem('userTeam') || null;
            this.initializeTeamSelection();
            this.updateTeamIndicator();
        }

        initializeTeamSelection() {
            const teamButtons = document.querySelectorAll('.btn-team-select') || [];
            teamButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const selectedTeam = e.target.dataset.team;
                    if (selectedTeam) this.selectTeam(selectedTeam);
                });
            });
            
            if (!this.currentTeam) {
                this.showTeamSelection();
            } else {
                this.showTeamHub();
            }
        }

        updateTeamIndicator() {
            const indicator = document.getElementById('userTeamIndicator');
            if (!indicator) return;

            if (this.currentTeam) {
                indicator.textContent = `${this.currentTeam.toUpperCase()} Team`;
                indicator.className = `team-indicator ${this.currentTeam}-team`;
            } else {
                indicator.textContent = '';
                indicator.className = 'team-indicator';
            }
        }

        showTeamSelection() {
            this.hideAllSections();
            const teamSelection = document.getElementById('team-selection');
            if (teamSelection) {
                teamSelection.classList.remove('hidden-section');
            }
        }

        showTeamHub() {
            if (!this.currentTeam) {
                this.showTeamSelection();
                return;
            }

            this.hideAllSections();
            const teamHub = document.getElementById(`${this.currentTeam}-team-hub`);
            if (teamHub) {
                teamHub.classList.remove('hidden-section');
                this.updateTeamHub();
            }
        }

        hideAllSections() {
            const sections = document.querySelectorAll('section') || [];
            sections.forEach(section => section.classList.add('hidden-section'));
        }
    }

    // Initialize components
    if (terminalContent) {
        new TerminalSimulation(terminalContent);
    }

    // Initialize Quest Timers
    document.querySelectorAll('.time-remaining').forEach(element => {
        if (element) new QuestTimer(element);
    });

    // Initialize Team System
    window.teamSystem = new TeamSystem();

    // Show welcome notification
    NotificationSystem.show('Welcome to CyberGuard Training Platform!', 'success');
});


// ----------------team selection----------------


function switchToTeamHub(team) {
    // First hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });

    // Hide the team selection section
    const teamSelection = document.getElementById('team-selection');
    if (teamSelection) {
        teamSelection.classList.add('hidden-section');
        teamSelection.classList.remove('active-section');
    }

    // Show the appropriate team hub
    const teamHub = document.getElementById(`${team}-team-hub`);
    if (teamHub) {
        teamHub.classList.remove('hidden-section');
        teamHub.classList.add('active-section');
        
        // Store the selected team
        localStorage.setItem('userTeam', team);
        
        // Show a notification
        const notification = document.getElementById('notification-container');
        if (notification) {
            notification.innerHTML = `<div class="notification success">Welcome to the ${team.toUpperCase()} Team!</div>`;
            setTimeout(() => {
                notification.innerHTML = '';
            }, 3000);
        }
    }
}

// Check for saved team on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTeam = localStorage.getItem('userTeam');
    if (savedTeam) {
        switchToTeamHub(savedTeam);
    }
});
