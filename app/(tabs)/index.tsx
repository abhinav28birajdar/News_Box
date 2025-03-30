import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
  SafeAreaView,
  ActivityIndicator, // Import ActivityIndicator
  ImageSourcePropType // Import type for image source
} from "react-native";
import { images } from "@/constants/images"; // Assuming images are correctly typed or imported
import { Ionicons } from '@expo/vector-icons';

// --- Interfaces ---
interface NewsSource {
  id: string | null; // NewsAPI source structure
  name: string;
}

interface NewsItem {
  url: string;
  urlToImage?: string | null; // Can be null or undefined
  title: string;
  description?: string | null; // Can be null or undefined
  publishedAt: string; // Keep as string, format later
  source: NewsSource;
  author?: string | null; // Optional field from NewsAPI
  content?: string | null; // Optional field
}

interface CardProps {
  item: NewsItem;
  onPress: () => void; // Function prop for pressing the card
}

// --- Helper Functions ---
const formatDate = (dateString: string): { formattedDate: string; formattedTime: string } => {
  try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Handle invalid date string
        console.warn(`Invalid date string received: ${dateString}`);
        return { formattedDate: "Invalid Date", formattedTime: "" };
      }

      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return { formattedDate, formattedTime };
  } catch (error) {
      console.error("Error formatting date:", error);
      return { formattedDate: "Error", formattedTime: "" };
  }
};

// --- Card Component ---
const Card: React.FC<CardProps> = ({ item, onPress }) => {
  const { formattedDate, formattedTime } = formatDate(item.publishedAt);
  const imageSource: ImageSourcePropType = item.urlToImage ? { uri: item.urlToImage } : images.newsbox; // Use default image type

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-lg overflow-hidden w-full bg-white mb-4 shadow-md active:opacity-80" // Added active state style
    >
       {/* Image Section */}
      {item.urlToImage ? (
        <Image
          className="w-full h-48 object-cover" // Ensure Tailwind object-cover works as expected in RN NativeWind
          source={imageSource}
          resizeMode="cover" // Explicit resizeMode
          // Optional: Add a placeholder while loading the image
          // defaultSource={images.placeholder} // Use a placeholder image if available
        />
      ) : (
        // Placeholder when no image URL is provided
        <View className="w-full h-48 bg-gray-200 items-center justify-center">
          <Image
            source={images.newsbox} // Ensure newsbox is a valid source
            className="w-24 h-24 opacity-50" // Adjusted opacity
            resizeMode="contain"
          />
        </View>
      )}
       {/* Content Section */}
      <View className="px-4 py-3">
        <Text
          className="font-bold text-lg text-black mb-2"
          numberOfLines={2} // Limit title lines
          ellipsizeMode="tail" // Add ellipsis if too long
        >
          {item.title || 'Untitled Article'}
        </Text>
        <Text
          className="text-sm text-gray-600 mb-3"
          numberOfLines={3} // Limit description lines
          ellipsizeMode="tail"
        >
          {item.description || 'No description available.'}
        </Text>
         {/* Footer Section */}
        <View className="flex-row justify-between items-center mt-2">
          {/* Date, Time, Source */}
          <View className="flex-shrink mr-2">
            <Text className="text-xs text-gray-500">{formattedDate}</Text>
            <Text className="text-xs text-gray-500">{formattedTime}</Text>
            <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
              {item.source?.name || 'Unknown Source'}
            </Text>
          </View>
          {/* Read More Button */}
          <TouchableOpacity
            onPress={onPress}
            className="bg-indigo-100 px-4 py-2 rounded-full active:bg-indigo-200"
          >
            <Text className="text-indigo-700 font-semibold text-sm">Read More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- Main News Home Page Component ---
export default function NewsHomePage(): JSX.Element { // Return type is JSX.Element
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Initial loading state
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('general'); // Default category
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Use environment variable for API Key! ---
  // Example: const API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;
  const API_KEY = '972829ea0d0347b3896ec675ff7a60cd'; // Replace or use env var

  // Memoize fetchNews using useCallback to prevent unnecessary re-renders if passed as prop
  const fetchNews = useCallback(async (selectedCategory: string = category, isRefresh: boolean = false) => {
    if (!isRefresh) setLoading(true); // Show loading indicator only on initial load/category change
    setError(null); // Clear previous errors

    // Validate API Key
    if (!API_KEY) {
        setError("API Key is missing. Please configure it.");
        setLoading(false);
        setRefreshing(false);
        return;
    }

    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory}&apiKey=${API_KEY}`;
    // console.log("Fetching news from:", url); // Debug log

    try {
      const response = await fetch(url);
      // console.log("API Response Status:", response.status); // Debug log

      if (!response.ok) {
          // Try to parse error message from NewsAPI
          let errorMessage = `HTTP error ${response.status}`;
          try {
              const errorBody = await response.json();
              errorMessage = errorBody.message || errorMessage;
          } catch (parseError) {
              // Ignore if response body isn't valid JSON
          }
         throw new Error(errorMessage);
      }

      const data = await response.json();
      // console.log("API Data:", data); // Debug log

      // Validate data structure
      if (data.status !== 'ok' || !Array.isArray(data.articles)) {
          throw new Error(data.message || 'Invalid data format received from API.');
      }

      // Filter out articles with missing essential info (like URL or title) - optional
      const validArticles = data.articles.filter((item: any) => item.url && item.title);

      setArticles(validArticles);

    } catch (err: unknown) { // Catch unknown error type
        let message = 'An unknown error occurred while fetching news.';
        if (err instanceof Error) {
            message = err.message;
        }
        console.error("Fetch News Error:", message, err); // Log the full error too
        setError(message);
        setArticles([]); // Clear articles on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, API_KEY]); // Dependencies for useCallback

  // Initial fetch and fetch on category change
  useEffect(() => {
    fetchNews(category);
  }, [fetchNews, category]); // Depend on memoized fetchNews and category

  // Handler for pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNews(category, true); // Pass true to indicate it's a refresh action
  }, [category, fetchNews]); // Depend on category and memoized fetchNews

  // Categories for buttons
  const categories = ["General", "Sports", "Technology", "Business", "Entertainment", "Health", "Science"]; // Added more

  // Function to open article URL
  const openArticle = async (url: string | null | undefined): Promise<void> => {
    if (!url) {
        Alert.alert("Error", "Article URL is missing.");
        return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open this URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Could not open the article link.');
    }
  };

  // Filter articles based on search query (case-insensitive)
  const filteredArticles = articles.filter(article => {
     const query = searchQuery.toLowerCase();
     const titleMatch = article.title?.toLowerCase().includes(query);
     const descriptionMatch = article.description?.toLowerCase().includes(query);
     const sourceMatch = article.source?.name?.toLowerCase().includes(query);
     return titleMatch || descriptionMatch || sourceMatch;
  });

  // --- Render ---
  return (
    <SafeAreaView className="flex-1 bg-white">
        {/* Header Section with Background */}
        <View className="h-48 w-full">
           {/* Background Image */}
           <Image
             source={images.bg} // Ensure images.bg is valid
             className="absolute top-0 left-0 w-full h-full"
             resizeMode="cover"
           />
            {/* Optional Overlay Image */}
           <Image
             source={images.newsbox} // Ensure images.newsbox is valid
             className="absolute top-0 left-0 w-full h-full opacity-10" // Reduced opacity
             resizeMode="contain"
           />
           {/* Content over background (if any needed here) */}
            {/* Example: Title */}
            {/* <View className="absolute top-16 left-5">
                <Text className="text-white text-3xl font-bold shadow-md">Top Headlines</Text>
            </View> */}
        </View>

         {/* Search Bar - Positioned over the header bottom */}
         <View className="px-5 -mt-8 mb-4 z-10">
             <View className="bg-white rounded-full flex-row items-center shadow-lg p-3">
                <Ionicons name="search-outline" size={20} color="#6b7280" style={{ marginRight: 8 }}/>
                <TextInput
                    placeholder="Search news by title, description, source..."
                    className="flex-1 text-black text-base" // Adjusted text size
                    placeholderTextColor="#9ca3af" // Softer placeholder color
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search" // Adds search button on keyboard
                />
                {searchQuery.length > 0 && ( // Show clear button when text exists
                    <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>
        </View>


      {/* Main Scrollable Content */}
      <ScrollView
        className="flex-1 px-3 pt-2" // Add padding top after search bar
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5', '#3730a3']} // Customize spinner colors
            tintColor={'#4f46e5'} // For iOS
          />
        }
        keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside inputs
      >
        {/* Category Buttons */}
        <View className="mb-5">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 2 }} // Add horizontal padding for scrollview content
            >
            {categories.map((cat) => (
                <TouchableOpacity
                key={cat}
                className={`
                    ${category.toLowerCase() === cat.toLowerCase()
                    ? 'bg-indigo-600 shadow-md' // More prominent selected style
                    : 'bg-gray-200'
                    }
                    px-5 py-2 rounded-full mr-2 mb-2 active:opacity-70
                `}
                onPress={() => setCategory(cat.toLowerCase())} // Set lowercase category
                >
                <Text
                    className={`
                    ${category.toLowerCase() === cat.toLowerCase()
                        ? 'text-white font-semibold'
                        : 'text-gray-700'
                    }
                    text-sm
                    `}
                >
                    {cat}
                </Text>
                </TouchableOpacity>
            ))}
            </ScrollView>
        </View>

        {/* News Cards Section */}
        <View>
          {loading ? (
            // Loading Indicator
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="text-lg text-gray-500 mt-3">Loading news...</Text>
            </View>
          ) : error ? (
            // Error Message and Retry Button
            <View className="items-center justify-center py-10 px-5">
              <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
              <Text className="text-lg text-red-600 mt-3 text-center font-semibold">Error Fetching News</Text>
              <Text className="text-base text-red-500 mt-1 text-center mb-5">{error}</Text>
              <TouchableOpacity
                onPress={() => fetchNews(category)} // Retry current category
                className="bg-indigo-600 px-6 py-2 rounded-full active:bg-indigo-700"
              >
                <Text className="text-white font-semibold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredArticles.length > 0 ? (
            // List of News Cards
            filteredArticles.map((item) => (
              <Card
                key={item.url} // Use URL as key, ensure uniqueness
                item={item}
                onPress={() => openArticle(item.url)}
              />
            ))
          ) : (
            // No Articles Found Message
            <View className="items-center justify-center py-10">
               <Ionicons name="newspaper-outline" size={40} color="#6b7280" />
              <Text className="text-lg text-gray-500 mt-3">
                {searchQuery ? 'No articles match your search.' : 'No articles found for this category.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}