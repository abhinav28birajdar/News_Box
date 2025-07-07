import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { LogOut, Moon, Sun, Settings, Edit3 } from "lucide-react-native";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const colors = theme.colors;
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await signOut();
            router.replace("/auth/login");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: colors.card }]}
            onPress={toggleTheme}
          >
            {theme.dark ? (
              <Sun size={20} color={colors.text} />
            ) : (
              <Moon size={20} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user ? (
            <>
              <Image
                source={{ uri: profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop" }}
                style={styles.avatar}
              />
              <Text style={[styles.userName, { color: colors.text }]}>{profile?.username || "User"}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              
              <TouchableOpacity 
                style={[styles.editProfileButton, { borderColor: colors.border }]}
              >
                <Edit3 size={16} color={colors.text} />
                <Text style={[styles.editProfileText, { color: colors.text }]}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={[styles.loginPromptText, { color: colors.text }]}>
                Please login to view your profile
              </Text>
              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: colors.primary }]}
                onPress={handleLogin}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {user && (
          <>
            
            
            
              
                <View 
                  key={post.id} 
                  style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Image
                    source={{ uri: post.urlToImage }}
                    style={styles.postImage}
                    contentFit="cover"
                  />
                  <View style={styles.postContent}>
                    <Text style={[styles.postTitle, { color: colors.text }]}>
                      {post.title}
                    </Text>
                    <Text style={[styles.postDate, { color: colors.textSecondary }]}>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  You haven't posted any news yet
                </Text>
              </View>
            )}

            <View style={styles.settingsSection}>
              <TouchableOpacity 
                style={[styles.settingsButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Settings size={20} color={colors.text} />
                <Text style={[styles.settingsButtonText, { color: colors.text }]}>Settings</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.logoutButton, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}
                onPress={handleLogout}
              >
                <LogOut size={20} color={colors.error} />
                <Text style={[styles.logoutButtonText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: "100%",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  editProfileText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  loginPrompt: {
    alignItems: "center",
    padding: 16,
  },
  loginPromptText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  loginButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  postCard: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  postImage: {
    width: 80,
    height: 80,
  },
  postContent: {
    flex: 1,
    padding: 12,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  postDate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },
  settingsSection: {
    marginTop: 8,
    marginBottom: 40,
  },
  settingsButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  settingsButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});