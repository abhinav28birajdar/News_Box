// app/(tabs)/camera.tsx (or wherever your CameraScreen lives)

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Button, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
// Remove Sharing if it's only used for the original "Post" button
// import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';

// --- Navigation Imports ---
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// --- Import or define the SAME RootStackParamList used in CreatePostScreen ---
import { RootStackParamList } from '../path/to/your/CreatePostScreen'; // Adjust path

// Define Types for this specific screen's route and navigation
type CameraScreenRouteProp = RouteProp<RootStackParamList, 'CameraScreen'>;
type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CameraScreen'>;


type FacingType = 'front' | 'back';

export default function CameraScreen() { // Renamed from App if it was previously App
  const [facing, setFacing] = useState<FacingType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // --- Navigation Hooks ---
  const route = useRoute<CameraScreenRouteProp>();
  const navigation = useNavigation<CameraScreenNavigationProp>();

  // --- Get the callback from route params ---
  const onMediaCapturedCallback = route.params?.onMediaCaptured;

  useEffect(() => {
    // You might not need media library permission if ONLY passing back to CreatePost
    // Keep it if you still want a "Save" option sometimes, or remove if not.
    if (!mediaPermission?.granted && mediaPermission?.canAskAgain) {
       // Optionally request: requestMediaPermission();
    }
  }, [mediaPermission]);

  // --- Permission Handling (remains similar) ---
   if (!cameraPermission) {
      return <View style={styles.centered}><Text>Loading Permissions...</Text></View>;
   }
   if (!cameraPermission.granted) {
       return (
           <View style={styles.permissionContainer}>
               <Text style={styles.message}>Camera & Microphone access needed.</Text>
               <Button onPress={requestCameraPermission} title="Grant Permissions" />
           </View>
       );
   }
   // Decide if MediaLibrary permission is strictly needed for the CreatePost flow
   // If not, you can conditionally render this or remove it when onMediaCapturedCallback exists
    if (!onMediaCapturedCallback && !mediaPermission?.granted) {
     return (
       <View style={styles.permissionContainer}>
         <Text style={styles.message}>Media Library permission needed to save.</Text>
         <Button onPress={requestMediaPermission} title="Grant Media Permission" />
       </View>
     );
   }

  // --- Camera Actions (takePicture, start/stopRecording - remain the same) ---
  function toggleCameraFacing() { /* ... */ }
  async function takePicture() { /* ... */ }
  async function startRecording() { /* ... */ }
  async function stopRecording() { /* ... */ }

  // --- Media Handling ---
  // Keep saveMedia ONLY if you still want a Save button in some cases
   async function saveMedia(uri: string, type: 'photo' | 'video') {
     if (!mediaPermission?.granted) {
         Alert.alert("Permission Denied", "Cannot save without Media Library permission.");
         return;
     }
     try {
         await MediaLibrary.saveToLibraryAsync(uri);
         Alert.alert("Saved!", `${type === 'photo' ? 'Photo' : 'Video'} saved to gallery.`);
         // Decide if you want to retake or go back after saving
         handleRetake(); // Example: Go back to camera view after saving
     } catch (error) {
         Alert.alert("Error", "Could not save to gallery.");
     }
   }

  // This function is now used to go back to the camera view (discard preview)
  function handleRetake() {
    setPhotoUri(null);
    setVideoUri(null);
    setIsRecording(false);
  }

  // --- Rendering ---

  // Preview Screen
  if (photoUri || videoUri) {
    const isPhoto = !!photoUri;
    const currentUri = isPhoto ? photoUri! : videoUri!; // Assert non-null as we are inside the check

    return (
      <View style={styles.previewContainer}>
        {/* Image or Video Preview */}
        {isPhoto ? (
          <Image source={{ uri: currentUri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <Video
            source={{ uri: currentUri }}
            style={styles.preview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        )}

        {/* --- Modified Preview Controls --- */}
        <View style={styles.previewControls}>
          {/* Retake Button (Always useful) */}
          <TouchableOpacity onPress={handleRetake} style={styles.previewButton}>
            <MaterialIcons name="replay" size={30} color="white" />
            <Text style={styles.previewButtonText}>Retake</Text>
          </TouchableOpacity>

          {/* Conditional Button: "Use Media" OR "Save" */}
          {onMediaCapturedCallback ? (
            // If opened from CreatePost, show "Use Media" button
            <TouchableOpacity
              onPress={() => {
                console.log("Calling onMediaCapturedCallback...");
                onMediaCapturedCallback(currentUri, isPhoto ? 'photo' : 'video');
                // Go back to the previous screen (CreatePostScreen)
                if (navigation.canGoBack()) {
                    navigation.goBack();
                }
              }}
              style={styles.previewButton}
            >
              <MaterialIcons name="check-circle" size={30} color="lightgreen" />
              <Text style={styles.previewButtonText}>Use {isPhoto ? 'Photo' : 'Video'}</Text>
            </TouchableOpacity>
          ) : (
            // If opened directly (no callback), show "Save" button (optional)
            <TouchableOpacity onPress={() => saveMedia(currentUri, isPhoto ? 'photo' : 'video')} style={styles.previewButton}>
              <MaterialIcons name="save-alt" size={30} color="white" />
              <Text style={styles.previewButtonText}>Save</Text>
            </TouchableOpacity>
          )}
           {/* Remove the original "Post" (expo-sharing) button, or make it conditional too */}
           {/*
            {!onMediaCapturedCallback && ( // Only show if not using the callback flow
                 <TouchableOpacity onPress={() => postMedia(currentUri)} style={styles.previewButton}>
                    <MaterialIcons name="share" size={30} color="white" />
                    <Text style={styles.previewButtonText}>Share</Text>
                 </TouchableOpacity>
            )}
           */}
        </View>
      </View>
    );
  }

  // Camera View (remains largely the same)
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode={isRecording ? 'video' : 'picture'} videoQuality={'720p'}>
        <View style={styles.buttonContainer}>
           {/* Flip Button */}
          <TouchableOpacity style={[styles.iconButton, { left: 20 }]} onPress={toggleCameraFacing} disabled={isRecording}>
             <MaterialIcons name="flip-camera-ios" size={30} color={isRecording ? "grey": "white"} />
          </TouchableOpacity>

           {/* Capture/Record Button */}
          <TouchableOpacity
            style={[styles.captureButton, isRecording ? styles.captureButtonRecording : null]}
            onPress={isRecording ? stopRecording : takePicture}
            onLongPress={startRecording}
            delayLongPress={200}
           >
              <View style={[styles.captureButtonInner, isRecording ? styles.captureButtonInnerRecording : null]}/>
          </TouchableOpacity>

            {/* Placeholder */}
           <View style={[styles.iconButton, { right: 20, width: 30 }]} />
        </View>
      </CameraView>
    </View>
  );
}

// --- Styles (Use the same StyleSheet from the previous CameraScreen example) ---
const styles = StyleSheet.create({
    // ... (Include all the styles: container, centered, permissionContainer, camera, buttonContainer, iconButton, captureButton, previewContainer, preview, previewControls, etc.)
    // Add any missing styles from the previous CameraScreen version
 container: { flex: 1, backgroundColor: 'black', },
 centered: { flex: 1, justifyContent: 'center', alignItems: 'center', },
 permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white', },
 message: { textAlign: 'center', marginBottom: 20, fontSize: 16, },
 warningText: { textAlign: 'center', marginTop: 15, fontSize: 14, color: 'red', },
 camera: { flex: 1, },
 buttonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', paddingBottom: 30, },
 iconButton: { position: 'absolute', bottom: 45, padding: 10, },
 captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(200, 200, 200, 0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'white', alignSelf: 'center', },
 captureButtonRecording: { /* borderColor: 'red', */ },
 captureButtonInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white', },
 captureButtonInnerRecording: { width: 30, height: 30, borderRadius: 5, backgroundColor: 'red', },
 previewContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', },
 preview: { width: '100%', flex: 1, },
 previewControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 20, paddingHorizontal: 10, position: 'absolute', bottom: 0, },
 previewButton: { alignItems: 'center', padding: 10, },
 previewButtonText: { color: 'white', marginTop: 5, fontSize: 12, }
});