import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// Define navigation types
type RootStackParamList = {
  CameraScreen: {
    onMediaCaptured: (uri: string, type: 'image' | 'video') => void;
  };
  Main: undefined;
};

type CreatePostNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreatePostScreen = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const navigation = useNavigation<CreatePostNavigationProp>();

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  };

  const openCamera = () => {
    navigation.navigate('CameraScreen', {
      onMediaCaptured: (uri: string, type: 'image' | 'video') => {
        setMedia(uri);
        setMediaType(type);
      }
    });
  };

  const uploadPost = async () => {
    if (!title.trim()) {
      alert('Please add a title');
      return;
    }

    if (!media) {
      alert('Please add an image or video');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload with timeout
    setTimeout(() => {
      setIsUploading(false);
      alert('Post uploaded successfully!');
      setTitle('');
      setDescription('');
      setMedia(null);
      setMediaType(null);
    }, 2000);

    // Actual implementation would use fetch or axios to upload to your backend
    /*
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('media', {
        uri: media,
        name: 'media.' + (mediaType === 'video' ? 'mp4' : 'jpg'),
        type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg'
      } as any);

      const response = await fetch('YOUR_API_URL/posts', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Post uploaded successfully!');
        setTitle('');
        setDescription('');
        setMedia(null);
        setMediaType(null);
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      alert('Error uploading post: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
    */
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    if (mediaType === 'video') {
      return (
        <View className="w-full h-56 mb-4 rounded-lg overflow-hidden bg-gray-200">
          <Video
            source={{ uri: media }}
            className="w-full h-full"
            resizeMode={ResizeMode.COVER}
            useNativeControls
          />
        </View>
      );
    } else {
      return (
        <View className="w-full h-56 mb-4 rounded-lg overflow-hidden bg-gray-200">
          <Image
            source={{ uri: media }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-4 py-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-800">Create Post</Text>
          {isUploading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <TouchableOpacity 
              onPress={uploadPost}
              className="bg-blue-500 px-4 py-2 rounded-full"
            >
              <Text className="text-white font-semibold">Post</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          className="bg-gray-100 rounded-lg p-4 mb-4 text-lg"
          placeholder="Add a title..."
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          className="bg-gray-100 rounded-lg p-4 mb-4 text-base h-32"
          placeholder="Add description..."
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {renderMediaPreview()}

        <View className="flex-row justify-center space-x-4 mt-2">
          <TouchableOpacity 
            onPress={pickMedia}
            className="bg-gray-200 p-3 rounded-full flex-row items-center"
          >
            <MaterialIcons name="photo-library" size={22} color="#4b5563" />
            <Text className="ml-2 text-gray-700 font-medium">Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={openCamera}
            className="bg-gray-200 p-3 rounded-full flex-row items-center"
          >
            <Ionicons name="camera" size={22} color="#4b5563" />
            <Text className="ml-2 text-gray-700 font-medium">Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreatePostScreen;