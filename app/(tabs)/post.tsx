import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { CameraView, CameraType } from "expo-camera";
import { Camera, X, Check, Image as ImageIcon } from "lucide-react-native";
import { useTheme } from "@/context/theme-context";
import { useNewsStore } from "@/store/news-store";
import { categories } from "@/constants/categories";
import { useRouter } from "expo-router";

export default function PostNewsScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { addNews } = useNewsStore();
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>("back");
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();
  const cameraRef = useRef(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!permission?.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Camera permission is required to take pictures");
        return;
      }
    }
    
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        console.error("Error taking picture:", error);
        Alert.alert("Error", "Failed to take picture");
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => (current === "back" ? "front" : "back"));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter content");
      return;
    }

    if (!category) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    if (!image) {
      Alert.alert("Error", "Please add an image");
      return;
    }

    const newArticle = {
      id: Date.now().toString(),
      title,
      description: content,
      content,
      urlToImage: image,
      publishedAt: new Date().toISOString(),
      source: { name: "User Generated" },
      author: "Anonymous User",
      category,
    };

    addNews(newArticle);
    
    Alert.alert(
      "Success",
      "Your news has been posted successfully!",
      [{ text: "OK", onPress: () => {
        setTitle("");
        setContent("");
        setCategory("");
        setImage(null);
        router.push("/");
      }}]
    );
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.error }]}
              onPress={() => setShowCamera(false)}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.primary }]}
              onPress={handleCapture}
            >
              <Check size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.cameraButton, { backgroundColor: colors.card }]}
              onPress={toggleCameraType}
            >
              <Camera size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>Post News</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Share news with the community
          </Text>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="Enter news title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={[styles.label, { color: colors.text }]}>Content</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                }
              ]}
              placeholder="Write your news content here"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />

            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryPill,
                    { 
                      backgroundColor: category === cat.value ? cat.color : colors.card,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat.value ? "#fff" : colors.text }
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.text }]}>Image</Text>
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: image }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={[styles.removeImageButton, { backgroundColor: colors.error }]}
                  onPress={() => setImage(null)}
                >
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imageButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.imageButton,
                    { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                  onPress={takePicture}
                >
                  <Camera size={24} color={colors.primary} />
                  <Text style={[styles.imageButtonText, { color: colors.text }]}>
                    Take Photo
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.imageButton,
                    { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                  onPress={pickImage}
                >
                  <ImageIcon size={24} color={colors.primary} />
                  <Text style={[styles.imageButtonText, { color: colors.text }]}>
                    Choose from Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Post News</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  imageButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    marginBottom: 24,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
  },
});