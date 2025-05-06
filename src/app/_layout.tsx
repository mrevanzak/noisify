import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "expo-status-bar";
import { AnimatedSplashScreen } from "@/components/AnimatedSplashScreen";
import { useState } from "react";
import { setup } from "@baronha/ting";
import { Appearance } from "react-native";

setup({
  toast: {
    backgroundColor: "#000000",
  },
});

Appearance.setColorScheme('dark')

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style="dark" />

      {showSplashScreen ? (
        <AnimatedSplashScreen onFinish={() => setShowSplashScreen(false)} />
      ) : (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
        </GestureHandlerRootView>
      )}
    </ThemeProvider>
  );
}
