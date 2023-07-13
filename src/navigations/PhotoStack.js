import { StatusBar } from "expo-status-bar";
import React from "react";
import Constants from "expo-constants";
import { StyleSheet, Text, View } from "react-native";

import Images from "../screens/Images";
import PreviewImage from "../screens/PreviewImage";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function PhotoStack() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={"Images"} component={Images} />
          <Stack.Screen name={"PreviewImage"} component={PreviewImage} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Constants.statusBarHeight,
    // alignItems: 'center',
    justifyContent: "center",
  },
});
