import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts
} from "@expo-google-fonts/poppins";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthBootstrap } from "@/components/auth-bootstrap";
import { AuthGate } from "@/components/auth-gate";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        <AuthGate />
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: "#ffffff" },
            headerTitleStyle: { fontFamily: "Poppins_600SemiBold" },
            contentStyle: { backgroundColor: "#FFFFFF" }
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
