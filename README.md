# 📰 News App - Your AI-Powered News Companion

A modern React Native news application built with Expo, featuring real-time news delivery, AI-powered assistance, and Firebase authentication. Stay informed with the latest news from around the world!

![News App Banner](assets/images/newsboxlogo1.png)

## ✨ Features

### 📱 Core Features
- **🔥 Real-time News**: Latest headlines from trusted news sources
- **🤖 AI News Assistant**: Powered by Google's Gemini AI for intelligent news queries
- **🔍 Smart Search**: Find specific news articles with advanced search
- **📂 Category Browsing**: Organized news by categories (Business, Tech, Sports, etc.)
- **🔐 Secure Authentication**: Firebase-powered user authentication
- **🎨 Beautiful UI**: Modern, responsive design with dark/light theme support

### 🚀 Advanced Features
- **📊 Personalized Feed**: Customized news based on your interests
- **💾 Offline Reading**: Save articles for offline access
- **📱 Cross-Platform**: Runs on iOS, Android, and Web
- **⚡ Fast Performance**: Optimized for speed and smooth navigation
- **🌙 Theme Support**: Dark and light mode support

---

## 🛠 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React Native** | Cross-platform mobile framework | ~0.75.4 |
| **Expo** | Development platform and tools | ~52.0.40 |
| **TypeScript** | Type-safe JavaScript | ~5.3.3 |
| **Firebase** | Authentication & Backend | v9+ |
| **Google Gemini AI** | AI-powered news assistance | Latest |
| **Expo Router** | File-based navigation | Latest |
| **React Native Safe Area Context** | Safe area handling | Latest |

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🚀 Installation Guide

### 1. Clone the Repository
```bash
git clone https://github.com/abhinav28birajdar/News_Morning.git
cd News_Morning
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
# News API (Get from newsapi.org)
EXPO_PUBLIC_NEWS_API_KEY=your_news_api_key_here

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Gemini AI (Optional - app has built-in key for demo)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication** with Email/Password
4. Add your app's configuration to `firebaseConfig.js`

### 5. Start Development Server
```bash
npx expo start
```

### 6. Run on Device/Emulator
- **iOS**: Press `i` in terminal or scan QR code with Expo Go
- **Android**: Press `a` in terminal or scan QR code with Expo Go
- **Web**: Press `w` in terminal

---

## 📱 App Screens & Features

### 🏠 Home Screen
- Latest news headlines with images
- Search functionality with real-time results
- Category filtering (Business, Technology, Sports, etc.)
- Pull-to-refresh for latest updates
- Smooth scrolling with loading states

### 🤖 AI News Assistant
- **Powered by Google Gemini AI**
- Ask natural language questions about news
- Get summaries and explanations
- Real-time AI responses
- Smart error handling and loading states

### 🔐 Authentication System
- **Sign Up**: Create new account with email/password
- **Sign In**: Secure login with Firebase Auth
- **Forgot Password**: Password reset functionality
- **Profile Management**: User profile and settings

### 📂 Categories
- Business & Finance
- Technology & Innovation
- Sports & Entertainment
- Health & Science
- Politics & World News
- And more...

### 📰 News Posting (Future)
- Create and share news stories
- Upload images and media
- Community-driven content
- User attribution and credibility

---

## 🎯 Usage Examples

### Search for News
```typescript
// Example: Search for technology news
"latest technology news"
"artificial intelligence developments"
"smartphone releases 2024"
```

### AI Assistant Queries
```typescript
// Ask the AI assistant:
"Summarize today's top tech news"
"What's happening in the stock market?"
"Tell me about recent sports events"
```

---

## 🏗 Project Structure

```
News_app/
├── app/                    # Main app screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── chat-ai.tsx    # AI Assistant
│   │   ├── categories.tsx # Categories screen
│   │   ├── post.tsx       # News posting
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx      # Login screen
│   │   └── signup.tsx     # Registration screen
│   └── article/           # Article detail screens
│       └── [id].tsx       # Dynamic article page
├── components/            # Reusable UI components
│   ├── NewsCard.tsx       # News article card
│   └── CategoryPills.tsx  # Category filter pills
├── services/              # API services
│   ├── newsApi.ts         # News API integration
│   ├── geminiApi.ts       # Gemini AI service
│   └── supabase.ts        # Database service
├── context/               # React context providers
│   ├── AuthContext.tsx    # Authentication context
│   └── theme-context.tsx  # Theme management
├── constants/             # App constants
│   ├── colors.ts          # Color scheme
│   ├── categories.ts      # News categories
│   └── theme.ts           # Theme configuration
├── assets/                # Static assets
│   ├── images/            # App images and logos
│   └── fonts/             # Custom fonts
└── package.json           # Dependencies and scripts
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server |
| `npm run android` | Run on Android emulator/device |
| `npm run ios` | Run on iOS simulator/device |
| `npm run web` | Run in web browser |
| `npm run build` | Build for production |
| `npm run test` | Run test suite |

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### 📝 Contribution Guidelines
- Follow TypeScript best practices
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure code passes linting

---

## 🐛 Troubleshooting

### Common Issues

**Metro bundler errors:**
```bash
npx expo start --clear
```

**Android build issues:**
```bash
cd android && ./gradlew clean && cd ..
npx expo run:android
```

**iOS build issues:**
```bash
npx expo run:ios --clear
```

**API not working:**
- Check your `.env` file configuration
- Verify API keys are valid
- Check internet connection

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abhinav Birajdar**
- GitHub: [@abhinav28birajdar](https://github.com/abhinav28birajdar)
- Repository: [News_Morning](https://github.com/abhinav28birajdar/News_Morning)

---

## 🙏 Acknowledgments

- **News API** for providing reliable news data
- **Google Gemini AI** for intelligent news assistance
- **Firebase** for authentication and backend services
- **Expo** for the amazing development platform
- **React Native** community for continuous innovation

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/abhinav28birajdar/News_Morning/issues) page
2. Create a new issue with detailed description
3. Join our community discussions

---

**⭐ Star this repository if you found it helpful!**

---

*Built with ❤️ using React Native and Expo*
