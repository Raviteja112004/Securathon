class Dashboard {
    constructor() {
        this.userId = null;
        this.dashboardData = null;
    }

    async init(userId) {
        this.userId = userId;
        await this.loadDashboardData();
        this.renderDashboard();
    }

    async loadDashboardData() {
        try {
            const response = await fetch(`/api/dashboard/${this.userId}`);
            this.dashboardData = await response.json();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    renderDashboard() {
        const dashboardContainer = document.getElementById('dashboard-container');
        if (!dashboardContainer || !this.dashboardData) return;

        const { username, quizHistory, teamProgress, recentActivities, totalScore } = this.dashboardData;

        dashboardContainer.innerHTML = `
            <div class="dashboard">
                <div class="profile-card">
                    <h2>Welcome, ${username}!</h2>
                    <div class="stats">
                        <div class="stat-item">
                            <h3>Total Score</h3>
                            <p>${totalScore}</p>
                        </div>
                        <div class="stat-item">
                            <h3>Team</h3>
                            <p>${teamProgress ? teamProgress.teamType : 'Not Selected'}</p>
                        </div>
                        <div class="stat-item">
                            <h3>Level</h3>
                            <p>${teamProgress ? teamProgress.currentLevel : 0}</p>
                        </div>
                    </div>
                </div>

                <div class="quiz-progress">
                    <h3>Recent Quiz Performance</h3>
                    <div class="quiz-history">
                        ${quizHistory.map(attempt => `
                            <div class="quiz-attempt">
                                <p>${attempt.difficultyLevel} Level</p>
                                <p>Score: ${attempt.score}</p>
                                <p>Date: ${new Date(attempt.completedAt).toLocaleDateString()}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="recent-activities">
                    <h3>Recent Activities</h3>
                    <div class="activity-list">
                        ${recentActivities.map(activity => `
                            <div class="activity-item">
                                <p>${activity.activityType}: ${activity.activityName}</p>
                                <p>Score: ${activity.score}</p>
                                <p>Date: ${new Date(activity.completedAt).toLocaleDateString()}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="completion-status">
                    <h3>Completion Status</h3>
                    <div class="progress-bars">
                        <div class="progress-item">
                            <h4>Beginner Level</h4>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${this.calculateCompletion('Beginner')}%"></div>
                            </div>
                        </div>
                        <div class="progress-item">
                            <h4>Intermediate Level</h4>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${this.calculateCompletion('Intermediate')}%"></div>
                            </div>
                        </div>
                        <div class="progress-item">
                            <h4>Hard Level</h4>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${this.calculateCompletion('Hard')}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    calculateCompletion(difficulty) {
        if (!this.dashboardData.quizHistory) return 0;
        
        const attempts = this.dashboardData.quizHistory.filter(
            attempt => attempt.difficultyLevel === difficulty
        );
        
        if (attempts.length === 0) return 0;
        
        const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
        const maxPossibleScore = attempts.length * 5; // Assuming 5 questions per quiz
        return (totalScore / maxPossibleScore) * 100;
    }
}

// Initialize Dashboard globally
window.dashboard = new Dashboard(); 