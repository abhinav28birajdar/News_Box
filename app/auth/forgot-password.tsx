import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/theme-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleReset = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setError("");
    setSuccess("");
    // TODO: Integrate with Firebase Auth sendPasswordResetEmail
    // await sendPasswordResetEmail(auth, email)
    setSuccess("If this email is registered, a password reset link has been sent.");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/images/icon.png")} style={styles.logo} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your email to receive a password reset link.</Text>
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
        {success ? <Text style={[styles.success, { color: colors.success }]}>{success}</Text> : null}
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleReset}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backText, { color: colors.primary }]}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  logoContainer: { alignItems: "center", marginBottom: 32 },
  logo: { width: 100, height: 100, borderRadius: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 16, marginBottom: 32, textAlign: "center" },
  error: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  success: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  input: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  button: { height: 56, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  backLink: { alignItems: "center", marginTop: 8 },
  backText: { fontSize: 14, fontWeight: "600" },
});
