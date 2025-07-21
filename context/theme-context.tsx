import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme } from "@/constants/theme";

type ThemeType = "light" | "dark" | "system";

interface ThemeContextType {
  themeType: ThemeType;
  theme: (typeof lightTheme | typeof darkTheme) & { dark: boolean };
  setThemeType: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const [themeType, setThemeType] = useState<ThemeType>("system");
  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setThemeType(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error("Failed to load theme", error);
      }
    };
    
    loadTheme();
  }, []);
  
  const saveTheme = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };
  
  const setTheme = (newTheme: ThemeType) => {
    setThemeType(newTheme);
    saveTheme(newTheme);
  };
  
  const toggleTheme = () => {
    const newTheme = themeType === "light" ? "dark" : "light";
    setTheme(newTheme);
  };
  
  const getTheme = () => {
    if (themeType === "system") {
      return colorScheme === "dark" ? darkTheme : lightTheme;
    }
    return themeType === "dark" ? darkTheme : lightTheme;
  };
  
  const theme = getTheme();
  const dark = themeType === "dark" || (themeType === "system" && colorScheme === "dark");
  
  const contextValue: ThemeContextType = {
    themeType,
    theme: { ...theme, dark },
    setThemeType: setTheme,
    toggleTheme,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};