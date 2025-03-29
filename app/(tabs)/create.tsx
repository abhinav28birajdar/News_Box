// CreatePostScreen.tsx (Ensure RootStackParamList is accurate)

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, ActivityIndicator, StyleSheet } from 'react-native'; // Added StyleSheet
import { Video, ResizeMode } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
// Import the specific navigation prop type
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

// --- Crucial: Define or Import your Root Stack Param List ---
// This should ideally live in a central navigation types file,
// but defining it here for completeness. Ensure it includes all screens
// involved in this navigation stack.
export type RootStackParamList = {
  CreatePost: undefined; // Screen we are currently in
  CameraScreen: { // Screen we navigate to
    // Define the callback function expected as a parameter
    onMediaCaptured: (uri: string, type: 'image' | 'video') => void;
  };
  // Add other screens in your stack if necessary...
  // Main: undefined; // Example if 'Main' is part of this stack
};

// Type the navigation prop based on the screen it's used IN ('CreatePost')
type CreatePostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePost'>;

const CreatePostScreen = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Use the correctly typed navigation hook
  const navigation = useNavigation<CreatePostNavigationProp>();

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
      allowsEditing: true, // Note: Editing might re-process video, test carefully
      quality: 0.7, // Quality for images, video quality handled differently
      // videoExportPreset: ImagePicker.VideoExportPreset.Passthrough, // Optional: control video quality
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setMedia(asset.uri);
      // Check asset.type or infer from URI if necessary
      setMediaType(asset.type === 'video' ? 'video' : 'image');
    }
  };

  // --- This function initiates navigation to CameraScreen ---
  const openCamera = () => {
    navigation.navigate('CameraScreen', {
      // Pass the callback function as a parameter
      onMediaCaptured: (uri: string, type: 'image' | 'video') => {
        console.log('Media captured from CameraScreen:', uri, type);
        setMedia(uri);
        setMediaType(type);
        // Navigation back happens *within* CameraScreen after calling this
      }
    });
  };

  const uploadPost = async () => {
    // --- Upload logic remains the same ---
    if (!title.trim()) {
      alert('Please add a title');
      return;
    }
    if (!media) {
      alert('Please add an image or video');
      return;
    }
    setIsUploading(true);
    console.log("Uploading:", { title, description, media, mediaType });
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      alert('Post uploaded successfully! (Simulated)');
      // Reset form
      setTitle('');
      setDescription('');
      setMedia(null);
      setMediaType(null);
      // Optional: Navigate back or elsewhere after successful post
      // if (navigation.canGoBack()) navigation.goBack();
    }, 2000);
    // --- Actual backend upload code would go here ---
  };

  const renderMediaPreview = () => {
    if (!media) return null;

    return (
      <View style={styles.mediaPreviewContainer}>
        {mediaType === 'video' ? (
          <Video
            source={{ uri: media }}
            style={styles.mediaPreview}
            resizeMode={ResizeMode.COVER} // Use COVER to fill container
            useNativeControls
            isLooping={false}
          />
        ) : (
          <Image
            source={{ uri: media }}
            style={styles.mediaPreview}
            resizeMode="cover" // Use 'cover' for consistency
          />
        )}
        {/* Optional: Add a remove button */}
        <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => { setMedia(null); setMediaType(null); }}
        >
            <MaterialIcons name="close" size={18} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  // --- JSX Structure ---
  return (
    // Using StyleSheet for cleaner layout than className strings
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Post</Text>
          {isUploading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <TouchableOpacity
              onPress={uploadPost}
              style={styles.postButton}
              disabled={!media || !title.trim()} // Disable if no title/media
            >
              <Text style={styles.postButtonText}>Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Inputs */}
        <TextInput
          style={styles.inputTitle}
          placeholder="Add a title..."
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.inputDescription}
          placeholder="Add description (optional)..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Media Preview */}
        {renderMediaPreview()}

        {/* Action Buttons - Only show if no media selected yet */}
        {!media && (
            <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
                onPress={pickMedia}
                style={styles.actionButton}
            >
                <MaterialIcons name="photo-library" size={22} color="#4b5563" />
                <Text style={styles.actionButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={openCamera}
                style={styles.actionButton}
            >
                <Ionicons name="camera" size={22} color="#4b5563" />
                <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>
            </View>
        )}
      </View>
    </ScrollView>
  );
};

// --- Add StyleSheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // Light gray background
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937', // Darker gray text
    },
    postButton: {
        backgroundColor: '#3b82f6', // Blue
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    postButtonText: {
        color: 'white',
        fontWeight: '600', // Semibold
        fontSize: 16,
    },
    inputTitle: {
        backgroundColor: '#f3f4f6', // Slightly darker input bg
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 18,
        color: '#1f2937',
    },
    inputDescription: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        minHeight: 100, // Set a min height
        color: '#1f2937',
    },
    mediaPreviewContainer: {
        width: '100%',
        aspectRatio: 16 / 9, // Maintain aspect ratio
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden', // Clip children (like Video controls/Image)
        backgroundColor: '#e5e7eb', // Placeholder color
        position: 'relative', // Needed for absolute positioning of remove button
    },
    mediaPreview: {
        width: '100%',
        height: '100%',
    },
    removeMediaButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        padding: 4,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center buttons
        gap: 16, // Space between buttons
        marginTop: 8,
    },
    actionButton: {
        backgroundColor: '#e5e7eb', // Gray button background
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonText: {
        marginLeft: 8,
        color: '#374151', // Dark gray text
        fontWeight: '500', // Medium weight
    },
});

export default CreatePostScreen;