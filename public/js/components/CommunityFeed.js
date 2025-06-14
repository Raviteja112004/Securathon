class CommunityFeed {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('communityPosts')) || [];
        this.currentFilter = 'all';
        this.currentTag = null;
    }

    init() {
        this.renderFeed();
    }

    renderFeed() {
        const feedContainer = document.getElementById('community-feed-container');
        if (!feedContainer) return;

        feedContainer.innerHTML = `
            <div class="community-feed">
                <div class="feed-header">
                    <h2>Community Feed</h2>
                    <div class="feed-filters">
                        <select onchange="communityFeed.setFilter(this.value)">
                            <option value="all">All Posts</option>
                            <option value="news">News</option>
                            <option value="discussion">Discussions</option>
                            <option value="report">Attack Reports</option>
                        </select>
                        <div class="tag-filters">
                            <button onclick="communityFeed.setTag(null)" class="${!this.currentTag ? 'active' : ''}">All</button>
                            <button onclick="communityFeed.setTag('security')" class="${this.currentTag === 'security' ? 'active' : ''}">Security</button>
                            <button onclick="communityFeed.setTag('malware')" class="${this.currentTag === 'malware' ? 'active' : ''}">Malware</button>
                            <button onclick="communityFeed.setTag('phishing')" class="${this.currentTag === 'phishing' ? 'active' : ''}">Phishing</button>
                        </div>
                    </div>
                </div>

                <div class="create-post">
                    <h3>Create New Post</h3>
                    <form onsubmit="communityFeed.createPost(event)">
                        <input type="text" id="post-username" placeholder="Your username" required>
                        <textarea id="post-content" placeholder="What's on your mind?" required></textarea>
                        <div class="post-tags">
                            <label>Tags:</label>
                            <input type="text" id="post-tags" placeholder="security, malware, phishing">
                        </div>
                        <button type="submit">Post</button>
                    </form>
                </div>

                <div class="posts-container">
                    ${this.renderPosts()}
                </div>
            </div>
        `;
    }

    renderPosts() {
        const filteredPosts = this.filterPosts();
        
        if (filteredPosts.length === 0) {
            return '<p class="no-posts">No posts found. Be the first to share!</p>';
        }

        return filteredPosts.map(post => `
            <div class="post-card">
                <div class="post-header">
                    <h3>${post.username}</h3>
                    <span class="post-time">${this.formatTime(post.timestamp)}</span>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                </div>
                <div class="post-tags">
                    ${post.tags.map(tag => `
                        <span class="tag" onclick="communityFeed.setTag('${tag}')">#${tag}</span>
                    `).join('')}
                </div>
                <div class="post-actions">
                    <button onclick="communityFeed.likePost(${post.id})">
                        <span class="like-icon">❤️</span>
                        <span class="like-count">${post.likes}</span>
                    </button>
                    <button onclick="communityFeed.toggleComments(${post.id})">
                        <span class="comment-icon">💬</span>
                        <span class="comment-count">${post.comments.length}</span>
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display: none;">
                    <div class="comments-list">
                        ${this.renderComments(post.comments)}
                    </div>
                    <form onsubmit="communityFeed.addComment(event, ${post.id})">
                        <input type="text" placeholder="Add a comment..." required>
                        <button type="submit">Comment</button>
                    </form>
                </div>
            </div>
        `).join('');
    }

    renderComments(comments) {
        return comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-username">${comment.username}</span>
                    <span class="comment-time">${this.formatTime(comment.timestamp)}</span>
                </div>
                <p>${comment.content}</p>
            </div>
        `).join('');
    }

    createPost(event) {
        event.preventDefault();
        
        const username = document.getElementById('post-username').value;
        const content = document.getElementById('post-content').value;
        const tags = document.getElementById('post-tags').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag);

        const newPost = {
            id: Date.now(),
            username,
            content,
            tags,
            timestamp: new Date(),
            likes: 0,
            comments: []
        };

        this.posts.unshift(newPost);
        this.savePosts();
        this.renderFeed();

        // Clear form
        event.target.reset();
    }

    likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.likes++;
            this.savePosts();
            this.renderFeed();
        }
    }

    toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection) {
            commentsSection.style.display = 
                commentsSection.style.display === 'none' ? 'block' : 'none';
        }
    }

    addComment(event, postId) {
        event.preventDefault();
        
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const form = event.target;
        const content = form.querySelector('input').value;
        const username = document.getElementById('post-username').value || 'Anonymous';

        post.comments.push({
            username,
            content,
            timestamp: new Date()
        });

        this.savePosts();
        this.renderFeed();
        form.reset();
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.renderFeed();
    }

    setTag(tag) {
        this.currentTag = tag;
        this.renderFeed();
    }

    filterPosts() {
        return this.posts.filter(post => {
            const matchesFilter = this.currentFilter === 'all' || 
                                post.tags.includes(this.currentFilter);
            const matchesTag = !this.currentTag || 
                             post.tags.includes(this.currentTag);
            return matchesFilter && matchesTag;
        });
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    savePosts() {
        localStorage.setItem('communityPosts', JSON.stringify(this.posts));
    }
}

// Initialize CommunityFeed globally
window.communityFeed = new CommunityFeed(); 