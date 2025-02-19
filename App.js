import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./components/loginscreen";
import HomeScreen from "./components/homescreen";
import CreateHomeScreen from "./components/createhomescreen";
import EditHomeScreen from "./components/EditHomeScreen";
import DetailHomeScreen from "./components/DetailHomeScreen";
import CreateRoomScreen from "./components/CreateRoomScreen";
import EditRoomScreen from "./components/EditRoomScreen";
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateHome" component={CreateHomeScreen} />
        <Stack.Screen name="EditHome" component={EditHomeScreen} />
        <Stack.Screen name="DetailHome" component={DetailHomeScreen} />
        <Stack.Screen name="CreateRoom" component={CreateRoomScreen} />
        <Stack.Screen name="EditRoom" component={EditRoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
