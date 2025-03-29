// Imports remain the same
import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Button, Alert, ImageProps } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Video, ResizeMode, VideoProps } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';

type FacingType = 'front' | 'back';

// Rename the default export function for clarity within Expo Router
export default function CameraScreen() {
  const [facing, setFacing] = useState<FacingType>('back');
  // useCameraPermissions handles BOTH camera and microphone
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Request Media Library permission if needed (e.g., on first load)
    if (!mediaPermission?.granted && mediaPermission?.canAskAgain) {
      // Consider showing a rationale before requesting
      // Alert.alert("Permission Needed", "We need access to your media library to save photos and videos.", [
      //   { text: "Cancel", style: "cancel" },
      //   { text: "OK", onPress: () => requestMediaPermission() }
      // ]);
      // Or request directly:
      // requestMediaPermission();
    }
  }, [mediaPermission]);


  // --- Permission Handling ---
  if (!cameraPermission || !mediaPermission) {
    // Permissions are still loading.
    return <View style={styles.centered}><Text>Loading Permissions...</Text></View>;
  }

  if (!cameraPermission.granted) {
    // Camera and Microphone permissions are not granted yet.
    return (
      <View style={styles.permissionContainer}>
        {/* Updated message */}
        <Text style={styles.message}>We need Camera and Microphone permissions for photos and videos.</Text>
        <Button onPress={requestCameraPermission} title="Grant Permissions" />
        {/* Optional: Add text explaining why if permission was denied previously */}
        {cameraPermission.canAskAgain === false && (
          <Text style={styles.warningText}>
            You've denied permissions. Please enable them in your device settings.
          </Text>
        )}
      </View>
    );
  }

   if (!mediaPermission.granted) {
    // Media Library permissions are not granted yet.
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>We need permission to save photos/videos to your device.</Text>
        <Button onPress={requestMediaPermission} title="Grant Media Library Permission" />
         {mediaPermission.canAskAgain === false && (
          <Text style={styles.warningText}>
            You've denied permission. Please enable it in your device settings to save media.
          </Text>
        )}
      </View>
    );
  }

  // --- Camera Actions --- (Functions remain the same as before)
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  async function takePicture() {
    if (cameraRef.current && !isRecording) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        setPhotoUri(photo.uri);
      } catch (error) {
        console.error("Failed to take picture:", error);
        Alert.alert("Error", "Could not take picture.");
      }
    }
  }

  async function startRecording() {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      console.log('Starting recording...');
      try {
         // recordAsync implicitly uses microphone if permission granted
         const videoRecordPromise = cameraRef.current.recordAsync({}); // No specific audio config needed here

         if (videoRecordPromise) {
            const data = await videoRecordPromise;
            console.log('Video recorded:', data.uri);
            setVideoUri(data.uri);
         } else {
             console.warn("Recording promise was not returned.");
             setIsRecording(false);
         }
      } catch (error) {
        console.error("Failed to start recording:", error);
        Alert.alert("Error", "Could not start recording.");
        setIsRecording(false);
      }
    }
  }

  async function stopRecording() {
    if (cameraRef.current && isRecording) {
      console.log('Stopping recording...');
      await cameraRef.current.stopRecording();
      // setIsRecording(false); // This is often handled implicitly or by the recordAsync promise resolution
      // Let's ensure it's set false reliably
      setIsRecording(false);
    }
  }

  // --- Media Handling --- (Functions remain the same)
  async function saveMedia(uri: string, type: 'photo' | 'video') {
    if (!uri) return;
    try {
        const asset = await MediaLibrary.createAssetAsync(uri); // More robust saving
        await MediaLibrary.createAlbumAsync('YourAppName', asset, false); // Optional: Save to specific album
        Alert.alert("Saved!", `${type === 'photo' ? 'Photo' : 'Video'} saved successfully.`);
        handleRetake();
    } catch (error) {
        console.error("Failed to save media:", error);
        Alert.alert("Error", "Could not save to gallery.");
    }
  }

  async function postMedia(uri: string) {
      if (!uri) return;
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
          try {
              await Sharing.shareAsync(uri);
          } catch (error) {
              console.error("Failed to share media:", error);
              // Avoid alerting on user cancellation
              if (!String(error).includes('cancelled')) {
                 Alert.alert("Error", "Could not share the file.");
              }
          }
      } else {
          Alert.alert("Sharing Not Available", "Sharing is not available on this device.");
      }
  }

  function handleRetake() {
      setPhotoUri(null);
      setVideoUri(null);
      setIsRecording(false);
  }


  // --- Rendering --- (JSX remains the same)

  // Preview Screen
  if (photoUri || videoUri) {
    const isPhoto = !!photoUri;
    const currentUri = isPhoto ? photoUri : videoUri; // Use a single variable for clarity

    // Ensure currentUri is non-null for TS before passing to functions
    if (!currentUri) {
        // This case should theoretically not happen if photoUri or videoUri is true,
        // but it's a safeguard.
        handleRetake(); // Go back to camera
        return null; // Render nothing briefly
    }

    return (
      <View style={styles.previewContainer}>
        {isPhoto ? (
          <Image source={{ uri: currentUri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <Video
            source={{ uri: currentUri }}
            style={styles.preview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={false} // Start paused
          />
        )}
        <View style={styles.previewControls}>
           <TouchableOpacity onPress={handleRetake} style={styles.previewButton}>
               <MaterialIcons name="replay" size={30} color="white" />
               <Text style={styles.previewButtonText}>Retake</Text>
           </TouchableOpacity>
          <TouchableOpacity onPress={() => saveMedia(currentUri, isPhoto ? 'photo' : 'video')} style={styles.previewButton}>
               <MaterialIcons name="save-alt" size={30} color="white" />
               <Text style={styles.previewButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => postMedia(currentUri)} style={styles.previewButton}>
              <MaterialIcons name="share" size={30} color="white" />
              <Text style={styles.previewButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera View
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode={isRecording ? 'video' : 'picture'}
        videoQuality={'720p'}
        // Enable audio recording (default is true if permission granted)
        // audio={true} // This prop might not exist or be needed; relies on permission
      >
        <View style={styles.buttonContainer}>
          {/* Flip Button */}
          <TouchableOpacity
            style={[styles.iconButton, { left: 20 }]} // Position flip left
            onPress={toggleCameraFacing}
            disabled={isRecording} // Disable flip while recording
          >
             <MaterialIcons name="flip-camera-ios" size={30} color={isRecording ? "grey": "white"} />
          </TouchableOpacity>

           {/* Capture/Record Button - Centered */}
          <TouchableOpacity
            style={[styles.captureButton, isRecording ? styles.captureButtonRecording : null]}
            onPress={isRecording ? stopRecording : takePicture}
            onLongPress={startRecording}
            delayLongPress={200}
           >
              <View style={[styles.captureButtonInner, isRecording ? styles.captureButtonInnerRecording : null]}/>
          </TouchableOpacity>

            {/* Placeholder on the right for balance */}
           <View style={[styles.iconButton, { right: 20, width: 30 }]} />

        </View>
      </CameraView>
    </View>
  );
}

// --- Styles --- (Add/modify styles as needed)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // Ensure background is black
  },
  centered: { // For loading/permission messages
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white', // Or your app's theme background
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
   warningText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
    color: 'red',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120, // Increased height for controls
    flexDirection: 'row',
    justifyContent: 'center', // Center the main capture button
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingBottom: 30, // Space from bottom edge
  },
  iconButton: { // Style for side buttons like flip
    position: 'absolute', // Position relative to container edges
    bottom: 45, // Align vertically with center of capture button
    padding: 10,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    alignSelf: 'center', // Ensure it stays centered if container uses space-between/around
  },
   captureButtonRecording: {
     // Optional: visual change for outer ring when recording
     // borderColor: 'red',
   },
  captureButtonInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'white',
   },
   captureButtonInnerRecording: {
      width: 30,
      height: 30,
      borderRadius: 5,
      backgroundColor: 'red',
   },
  // Preview Styles
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  preview: {
    width: '100%',
    flex: 1,
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 20,
    paddingHorizontal: 10,
    position: 'absolute',
    bottom: 0,
  },
   previewButton: {
     alignItems: 'center',
     padding: 10,
   },
   previewButtonText: {
       color: 'white',
       marginTop: 5,
       fontSize: 12,
   }
});