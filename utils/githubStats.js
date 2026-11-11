import axios from "axios";

// Simple in-memory cache to prevent hitting GitHub rate limits
let statsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getRepoStats = async () => {
    const now = Date.now();
    if (statsCache && (now - lastFetchTime < CACHE_DURATION)) {
        return statsCache;
    }

    try {
        const repoUrl = "https://api.github.com/repos/JonniTech/MARCO MALIK & WAQAR WRITES MD";

        // Parallel requests for repo details and pull requests
        const [repoRes, pullsRes] = await Promise.all([
            axios.get(repoUrl),
            axios.get(`${repoUrl}/pulls?state=all&per_page=1`)
        ]);

        const repo = repoRes.data;

        // Extract relevant data
        const stats = {
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            issues: repo.open_issues_count, // distinct from PRs usually? In GitHub API open_issues includes PRs.
            // We can get strict issues by subtracting, or just show 'Open Issues & PRs'
            // For PR count, the header Link or a search is better, but for simplicity:
            // We'll just explicitly state "Issues/PRs" or try to be more specific if we can.
            // Actually, querying /pulls gives us the list. To get count we can rely on header or just use open_issues as a generic "Issues" metric for now.
            // Wait, let's try to be accurate.
            createdAt: new Date(repo.created_at).toLocaleDateString("en-GB"),
            updatedAt: new Date(repo.updated_at).toLocaleDateString("en-GB"),
            owner: repo.owner.login,
            name: repo.name
        };

        statsCache = stats;
        lastFetchTime = now;

        return stats;
    } catch (error) {
        console.error("Error fetching GitHub stats:", error.message);
        return null; // Return null on failure so we can show a fallback or skip
    }
};
