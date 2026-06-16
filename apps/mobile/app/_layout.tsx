import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#ffffff" },
            headerTitleStyle: { fontWeight: "700" },
            contentStyle: { backgroundColor: "#f6f7fb" }
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
