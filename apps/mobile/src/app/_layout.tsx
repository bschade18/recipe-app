import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
// import AppTabs from "@/components/app-tabs";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack>
          <Stack.Screen name="index" options={{ title: "Recipes" }} />
          <Stack.Screen name="add-recipe" options={{ title: "Add Recipe" }} />
          <Stack.Screen name="recipe/[id]" options={{ title: "Recipe" }} />
          <Stack.Screen
            name="recipe/[id]/edit"
            options={{ title: "Edit Recipe" }}
          />
        </Stack>
        {/* <AppTabs /> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
