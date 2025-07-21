
const GEMINI_API_KEY = "";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

export const GeminiAPI = {
  getLatestNews: async (query = "latest news") => {
    try {
      const prompt = `You are a news assistant. Please provide 8 current news headlines related to "${query}". 

Format each news item EXACTLY like this:
[News Headline Here](https://www.example.com/news-url): Brief description of the news story.

Requirements:
- Use real, current news headlines
- Include actual news website URLs (BBC, CNN, Reuters, etc.)
- Each line must start with [
- Each line must contain a URL in parentheses
- Add a colon and description after the URL
- Make sure the format is consistent
- Provide exactly 8 news items

Example:
[Global Climate Summit Begins](https://www.bbc.com/news): World leaders gather to discuss climate action.`;
      
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      };
      
      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        console.error("Gemini API HTTP Error:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Gemini API raw response:", JSON.stringify(data, null, 2));
      
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        throw new Error(data.error.message || "Gemini API Error");
      }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!text) {
        console.log("No text content in Gemini response");
        throw new Error("No content received from Gemini API");
      }
      
      console.log("Gemini response text:", text);
      
      // Parse the response to extract news items with improved regex
      const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
      const news = lines
        .map((line: string) => {
          console.log("Parsing line:", line);
          
          // Primary pattern: [Title](URL): Description
          let match = line.match(/\[(.+?)\]\((https?:\/\/[^\s\)]+)\)[:\-]?\s*(.*)/);
          
          if (match) {
            console.log("Match found with primary pattern:", match);
            return { 
              title: match[1].trim(), 
              url: match[2].trim(), 
              description: match[3].trim() || "No description available"
            };
          }
          
          // Secondary pattern: Title - URL - Description
          match = line.match(/(.+?)\s*[-–]\s*(https?:\/\/[^\s]+)\s*[-–]?\s*(.*)/);
          if (match && match[1].length > 5) {
            console.log("Match found with secondary pattern:", match);
            return { 
              title: match[1].trim(), 
              url: match[2].trim(), 
              description: match[3].trim() || "No description available"
            };
          }
          
          // Tertiary pattern: Title URL Description (space separated)
          match = line.match(/^(.{10,}?)\s+(https?:\/\/[^\s]+)\s+(.+)$/);
          if (match) {
            console.log("Match found with tertiary pattern:", match);
            return { 
              title: match[1].trim(), 
              url: match[2].trim(), 
              description: match[3].trim() || "No description available"
            };
          }
          
          // Quaternary pattern: Just look for any line with a URL and extract parts
          match = line.match(/(.*?)(https?:\/\/[^\s]+)(.*)/);
          if (match && match[1].trim().length > 5) {
            console.log("Match found with quaternary pattern:", match);
            return { 
              title: match[1].trim().replace(/^[\[\-\*\d\.\)]+\s*/, ''), // Remove bullets/numbers
              url: match[2].trim(), 
              description: match[3].trim().replace(/^[:\-]\s*/, '') || "No description available"
            };
          }
          
          console.log("No match found for line:", line);
          return null;
        })
        .filter(Boolean);
        
      console.log("Parsed news items:", news);
      
      if (news.length === 0) {
        // If no news parsed, create some fallback news with the query
        console.log("No news parsed, creating fallback response");
        return [
          {
            title: `Latest ${query} Updates`,
            url: "https://news.google.com/search?q=" + encodeURIComponent(query),
            description: "Search for the latest news updates on this topic."
          },
          {
            title: `${query} News Summary`,
            url: "https://www.bbc.com/news",
            description: "Check BBC News for comprehensive coverage."
          },
          {
            title: `Breaking: ${query}`,
            url: "https://www.cnn.com",
            description: "Visit CNN for breaking news and updates."
          },
          {
            title: `${query} Analysis`,
            url: "https://www.reuters.com",
            description: "Read in-depth analysis from Reuters."
          },
          {
            title: `${query} Headlines`,
            url: "https://www.theguardian.com",
            description: "Latest headlines from The Guardian."
          },
          {
            title: `${query} Reports`,
            url: "https://www.washingtonpost.com",
            description: "Detailed reports from Washington Post."
          },
          {
            title: `${query} Reports`,
            url: "https://www.washingtonpost.com",
            description: "Detailed reports from Washington Post."
          },
        ];
      }
      
      return news;
    } catch (error) {
      console.error("Error fetching news from Gemini:", error);
      throw error; // Re-throw to let the UI handle the error properly
    }
  }
};
