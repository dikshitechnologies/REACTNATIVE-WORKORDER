import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./Screens/Splash";
import AnimatedLogin from "./Screens/Login";
import ArtisansReport from "./Screens/ArtisansReport";
import PendingReports from "./Screens/PendingReports";
import DeliveredReports from "./Screens/DeliveredReports";
import AdminReports from "./Screens/AdminReports";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={AnimatedLogin} />
          <Stack.Screen name="ArtisansReport" component={ArtisansReport} />
          <Stack.Screen name="PendingReports" component={PendingReports} />
          <Stack.Screen name="DeliveredReports" component={DeliveredReports} />
          <Stack.Screen name="AdminReports" component={AdminReports} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
