// src/services/tool.service.js

export const toolsConfig = [
  {
    type: "function",
    function: {
      name: "getGithubStats",
      description: "Fetch live public GitHub metrics including repository count and total stars for a given username.",
      parameters: {
        type: "object",
        properties: {
    username: {
        type: "string",
        description: "github username is hassan42772",
    },
    },
        required: [],
      },
    },
  },
];

export const executeTool = async (toolCall) => {
  const { name, arguments: args } = toolCall.function;

  if (name === "getGithubStats") {
    try {
      let parsedArgs = {};
      if (args) {
        parsedArgs = typeof args === "string" ? JSON.parse(args) : args;
      }
      
      const username = parsedArgs.username || "hassan42772"; // Replace with exact target handle if needed

      // Fetch user profile metrics
      const userRes = await fetch(`https://api.github.com/users/${username}`, {
        headers: { "User-Agent": "MERN-RAG-Chatbot" },
      });

      if (!userRes.ok) {
        return JSON.stringify({ error: `Could not fetch stats for user: ${username}` });
      }

      const userData = await userRes.json();

      // Fetch public repos to calculate aggregate stars
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: { "User-Agent": "MERN-RAG-Chatbot" },
      });

      let totalStars = 0;
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        totalStars = reposData.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);
      }

      return JSON.stringify({
        username: userData.login,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        totalStars,
        profileUrl: userData.html_url,
      });
    } catch (error) {
      console.error("Tool execution error (getGithubStats):", error);
      return JSON.stringify({ error: "Failed to retrieve live GitHub stats." });
    }
  }

  return JSON.stringify({ error: `Tool ${name} not found` });
};