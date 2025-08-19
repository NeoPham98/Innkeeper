import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";
import LoginScreen from "./components/loginscreen";
import HomeScreen from "./components/homescreen";
import CreateHomeScreen from "./components/createhomescreen";
import EditHomeScreen from "./components/EditHomeScreen";
import DetailHomeScreen from "./components/DetailHomeScreen";
import CreateRoomScreen from "./components/CreateRoomScreen";
import EditRoomScreen from "./components/EditRoomScreen";
import SettingsScreen from "./components/SettingsScreen";
import CreateInvoiceScreen from "./components/CreateInvoiceScreen";
import InvoiceDetailScreen from "./components/InvoiceDetailScreen";
import BillScreen from "./components/BillScreen";
import ChartScreen from "./components/ChartScreen";
import SplashScreen from "./components/SplashScreen";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#343A40" animated={true} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateHome" component={CreateHomeScreen} />
        <Stack.Screen name="EditHome" component={EditHomeScreen} />
        <Stack.Screen name="DetailHome" component={DetailHomeScreen} />
        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        <Stack.Screen name="EditRoom" component={EditRoomScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
        <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
        <Stack.Screen name="Bill" component={BillScreen} />
        <Stack.Screen name="Chart" component={ChartScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
