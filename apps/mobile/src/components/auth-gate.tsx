import { Redirect, usePathname } from "expo-router";
import { View } from "react-native";
import { useSessionStore } from "@/stores/session-store";

const PUBLIC_PREFIXES = ["/auth"];

export function AuthGate() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const session = useSessionStore((state) => state.session);
  const pathname = usePathname();
  const publicRoute = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || pathname === "/";

  if (!hydrated) {
    return <View />;
  }

  if (!session && !publicRoute) {
    return <Redirect href="/auth/sign-in" />;
  }

  return null;
}
