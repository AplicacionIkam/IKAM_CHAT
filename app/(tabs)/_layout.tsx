import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
      <Stack.Screen name="WelcomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      <Stack.Screen name="RegisterScreen" options={{ headerShown: false }} />
      <Stack.Screen name="menu" options={{ headerShown: false }} />
    </Stack>
  );
}
