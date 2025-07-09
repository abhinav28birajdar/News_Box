

const GEMINI_API_KEY = "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-latest:generateContent?key=" + GEMINI_API_KEY;

export const GeminiAPI = {
  getLatestNews: async (query = "latest news") => {
    const prompt = `Give me the latest news headlines with a short description and a link. Query: ${query}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }]
    };
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log("Gemini API raw response:", data); // Debug log
    // Parse Gemini's response to extract news items (assuming markdown or list)
    // This is a simple parser; you may need to adjust based on Gemini's output
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Example: parse lines like "- [Title](url): Description"
    const news = text.split("\n").map((line: string) => {
      const match = line.match(/\[(.+?)\]\((https?:\/\/[^\s]+)\):?\s*(.*)/);
      if (match) {
        return { title: match[1], url: match[2], description: match[3] };
      }
      return null;
    }).filter(Boolean);
    return news;
  }
};
