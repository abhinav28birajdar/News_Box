import React, { useState, useEffect } from 'react';
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
  SafeAreaView
} from "react-native";
import { images } from "@/constants/images";

// Define a type for the news item from NewsAPI
interface NewsItem {
  url: string;
  urlToImage?: string;
  title: string;
  description?: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

// Add type definition for Card component props
interface CardProps {
  item: NewsItem;
  onPress: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Format date
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format time
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return { formattedDate, formattedTime };
};

const Card: React.FC<CardProps> = ({ item, onPress }) => {
  const { formattedDate, formattedTime } = formatDate(item.publishedAt);

  return (
    <TouchableOpacity 
      onPress={onPress}
      className="rounded-lg overflow-hidden w-full bg-white mb-4 shadow-md"
    >
      {item.urlToImage ? (
        <Image 
          className="w-full h-48 object-cover" 
          source={{ uri: item.urlToImage }} 
          defaultSource={images.newsbox} // Fallback image
        />
      ) : (
        <View className="w-full h-48 bg-gray-200 items-center justify-center">
          <Image 
            source={images.newsbox} 
            className="w-24 h-24 opacity-50" 
            resizeMode="contain"
          />
        </View>
      )}
      <View className="px-4 py-3">
        <Text 
          className="font-bold text-lg text-black mb-2" 
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text 
          className="text-sm text-gray-600 mb-3" 
          numberOfLines={2}
        >
          {item.description || 'No description available'}
        </Text>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs text-gray-500">{formattedDate}</Text>
            <Text className="text-xs text-gray-500">{formattedTime}</Text>
            <Text className="text-xs text-gray-500 mt-1">
              {item.source.name || 'Unknown Source'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onPress} 
            className="bg-indigo-100 px-3 py-2 rounded-full"
          >
            <Text className="text-indigo-700 font-semibold">Read More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function NewsHomePage() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState<string>('');


  const API_KEY = '972829ea0d0347b3896ec675ff7a60cd';

  const fetchNews = async (selectedCategory?: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&category=${selectedCategory || category}&apiKey=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setArticles(data.articles);
      setLoading(false);
      setRefreshing(false);
    } catch (err: unknown) {
      setRefreshing(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [category]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const categories = ["General", "Sports", "Political", "Technology", "Business", "Entertainment"];

  const openArticle = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('Error', 'Could not open the article');
    }
  };

  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1', '#3730a3']}
          />
        }
      >
        <View className="relative">
          <Image
            source={images.bg}
            className="absolute w-full h-48 z-0"
            resizeMode="cover"
          />
          <Image
            source={images.newsbox}
            className="absolute w-full h-48 z-0 opacity-20"
            resizeMode="contain"
          />
        </View>

        {/* Search Bar */}
        <View className="mx-5 mt-36 bg-white rounded-full flex-row items-center shadow-lg p-3">
          <TextInput
            placeholder="Search news..."
            className="flex-1 text-black px-3"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Category Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="my-5 px-5"
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`
                ${category.toLowerCase() === cat.toLowerCase() 
                  ? 'bg-indigo-700' 
                  : 'bg-gray-200'
                } 
                px-6 py-2 rounded-full mb-2 mr-2
              `}
              onPress={() => setCategory(cat.toLowerCase())}
            >
              <Text 
                className={`
                  ${category.toLowerCase() === cat.toLowerCase() 
                    ? 'text-white' 
                    : 'text-black'
                  } 
                  text-sm
                `}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* News Cards */}
        <View className="px-3">
          {loading ? (
            <View className="items-center justify-center">
              <Text className="text-lg text-gray-500">Loading news...</Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center">
              <Text className="text-lg text-red-500">{error}</Text>
              <TouchableOpacity 
                onPress={() => fetchNews()} 
                className="bg-indigo-600 px-4 py-2 rounded-full mt-3"
              >
                <Text className="text-white">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredArticles.length > 0 ? (
            filteredArticles.map((item, index) => (
              <Card 
                key={item.url || index} 
                item={item} 
                onPress={() => openArticle(item.url)} 
              />
            ))
          ) : (
            <View className="items-center justify-center">
              <Text className="text-lg text-gray-500">No articles found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}