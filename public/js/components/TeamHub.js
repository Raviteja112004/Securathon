class TeamHub {
    constructor() {
        this.userId = null;
        this.currentTeam = null;
        this.progress = null;
        this.points = 0;
        this.achievements = [];
    }

    async init(userId) {
        this.userId = userId;
        await this.loadTeamProgress();
        this.renderTeamHub();
    }

    async loadTeamProgress() {
        try {
            const response = await fetch(`/api/team/progress/${this.userId}`);
            this.progress = await response.json();
            if (this.progress) {
                this.currentTeam = this.progress.teamType;
                this.points = this.progress.totalPoints || 0;
                this.achievements = this.progress.achievements || [];
            }
        } catch (error) {
            console.error('Failed to load team progress:', error);
        }
    }

    async selectTeam(teamType) {
        try {
            const response = await fetch('/api/team/select', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    teamType
                })
            });

            this.progress = await response.json();
            this.currentTeam = teamType;
            this.renderTeamHub();
        } catch (error) {
            console.error('Failed to select team:', error);
        }
    }

    async updatePoints(points, activity) {
        try {
            const response = await fetch('/api/team/update-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    points,
                    activity
                })
            });

            const result = await response.json();
            this.points = result.totalPoints;
            this.achievements = result.achievements;
            this.renderTeamHub();
        } catch (error) {
            console.error('Failed to update points:', error);
        }
    }

    renderTeamHub() {
        const teamHubContainer = document.getElementById('team-hub-container');
        if (!teamHubContainer) return;

        if (!this.currentTeam) {
            teamHubContainer.innerHTML = `
                <div class="team-selection">
                    <h2>Choose Your Path</h2>
                    <p>Select your team to begin your cybersecurity journey:</p>
                    <div class="team-cards">
                        <div class="team-card red-team">
                            <div class="team-header">
                                <h3>Red Team</h3>
                                <span class="team-badge">Offensive Security</span>
                            </div>
                            <div class="team-content">
                                <div class="team-icon">🛡️</div>
                                <ul class="team-features">
                                    <li>Penetration Testing</li>
                                    <li>Exploit Development</li>
                                    <li>Social Engineering</li>
                                </ul>
                                <div class="team-stats">
                                    <div class="stat">
                                        <span class="stat-value">5</span>
                                        <span class="stat-label">Modules</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">10+</span>
                                        <span class="stat-label">Challenges</span>
                                    </div>
                                </div>
                            </div>
                            <button onclick="teamHub.selectTeam('Red')" class="team-select-btn">Join Red Team</button>
                        </div>
                        <div class="team-card white-team">
                            <div class="team-header">
                                <h3>White Team</h3>
                                <span class="team-badge">Defensive Security</span>
                            </div>
                            <div class="team-content">
                                <div class="team-icon">🛡️</div>
                                <ul class="team-features">
                                    <li>System Hardening</li>
                                    <li>Incident Response</li>
                                    <li>Threat Analysis</li>
                                </ul>
                                <div class="team-stats">
                                    <div class="stat">
                                        <span class="stat-value">5</span>
                                        <span class="stat-label">Modules</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value">10+</span>
                                        <span class="stat-label">Challenges</span>
                                    </div>
                                </div>
                            </div>
                            <button onclick="teamHub.selectTeam('White')" class="team-select-btn">Join White Team</button>
                        </div>
                    </div>
                </div>
            `;
        } else {
            const topics = this.currentTeam === 'Red' ? [
                {
                    name: 'Penetration Testing',
                    description: 'Learn to identify and exploit vulnerabilities',
                    points: 100,
                    challenges: 3
                },
                {
                    name: 'Exploit Development',
                    description: 'Create and test security exploits',
                    points: 150,
                    challenges: 4
                },
                {
                    name: 'Social Engineering',
                    description: 'Master the art of human manipulation',
                    points: 200,
                    challenges: 5
                }
            ] : [
                {
                    name: 'System Hardening',
                    description: 'Strengthen system security',
                    points: 100,
                    challenges: 3
                },
                {
                    name: 'Incident Response',
                    description: 'Handle security incidents effectively',
                    points: 150,
                    challenges: 4
                },
                {
                    name: 'Threat Analysis',
                    description: 'Analyze and mitigate security threats',
                    points: 200,
                    challenges: 5
                }
            ];

            teamHubContainer.innerHTML = `
                <div class="team-dashboard">
                    <div class="dashboard-header">
                        <div class="team-info">
                            <h2>${this.currentTeam} Team Dashboard</h2>
                            <span class="team-level">Level ${this.progress.currentLevel}</span>
                        </div>
                        <div class="points-display">
                            <div class="points-icon">🏆</div>
                            <div class="points-value">${this.points}</div>
                            <div class="points-label">Total Points</div>
                        </div>
                    </div>

                    <div class="achievements-section">
                        <h3>Achievements</h3>
                        <div class="achievements-grid">
                            ${this.renderAchievements()}
                        </div>
                    </div>

                    <div class="topics-container">
                        <h3>Learning Path</h3>
                        <div class="topics-grid">
                            ${topics.map(topic => {
                                const completed = this.progress.completedTopics.find(t => t.topicName === topic.name);
                                return `
                                    <div class="topic-card ${completed ? 'completed' : ''}">
                                        <div class="topic-header">
                                            <h4>${topic.name}</h4>
                                            <span class="topic-points">${topic.points} pts</span>
                                        </div>
                                        <p>${topic.description}</p>
                                        <div class="topic-progress">
                                            <div class="progress-bar">
                                                <div class="progress" style="width: ${completed ? '100' : '0'}%"></div>
                                            </div>
                                            <span class="progress-text">${completed ? 'Completed' : 'Not Started'}</span>
                                        </div>
                                        <div class="topic-stats">
                                            <span>${topic.challenges} Challenges</span>
                                            ${completed ? `
                                                <span class="completion-date">Completed: ${new Date(completed.completedAt).toLocaleDateString()}</span>
                                            ` : `
                                                <button onclick="teamHub.startTopic('${topic.name}')" class="start-btn">Start Topic</button>
                                            `}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="leaderboard-section">
                        <h3>Team Leaderboard</h3>
                        <div class="leaderboard">
                            ${this.renderLeaderboard()}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderAchievements() {
        const allAchievements = [
            { id: 'first_win', name: 'First Victory', icon: '🎯', description: 'Complete your first challenge' },
            { id: 'perfect_score', name: 'Perfect Score', icon: '⭐', description: 'Get 100% on any challenge' },
            { id: 'team_player', name: 'Team Player', icon: '🤝', description: 'Complete 5 team challenges' },
            { id: 'security_expert', name: 'Security Expert', icon: '🔒', description: 'Reach level 5' }
        ];

        return allAchievements.map(achievement => {
            const unlocked = this.achievements.includes(achievement.id);
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                    ${unlocked ? '<span class="unlocked-badge">Unlocked</span>' : ''}
                </div>
            `;
        }).join('');
    }

    renderLeaderboard() {
        // This would typically fetch from the backend
        const leaderboard = [
            { rank: 1, username: 'User1', points: 1500 },
            { rank: 2, username: 'User2', points: 1200 },
            { rank: 3, username: 'User3', points: 1000 }
        ];

        return `
            <table class="leaderboard-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>User</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard.map(entry => `
                        <tr>
                            <td>#${entry.rank}</td>
                            <td>${entry.username}</td>
                            <td>${entry.points}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    async startTopic(topicName) {
        // This would typically redirect to the topic's content
        console.log(`Starting topic: ${topicName}`);
        // Implement topic-specific logic here
    }
}

// Initialize TeamHub globally
window.teamHub = new TeamHub(); 