import React, { useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Settings from "../screens/Settings";
import AlbumStack from "./AlbumStack";
import PhotoStack from "./PhotoStack";
import SearchStack from "./SearchStack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";

const TabIcon = ({ name, size, color }) => {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
};

const Tab = createBottomTabNavigator();

const MainTab = () => {
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("저장소 접근 권한이 필요합니다");
      return;
    }
  };
  return (
    <Tab.Navigator
      initialRouteName="Settings"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#414BB2",
        tabBarInactiveTintColor: "#cfcfcf",
        tabBarStyle: [
          {
            backgroundColor: "#ffffff",
            borderTopColor: "#ffffff",
            borderTopWidth: 2,
            height: 80,
            paddingTop: 15,
            paddingBottom: 15,
          },
        ],
        tabBarLabelStyle: [
          {
            fontWeight: "bold",
          },
        ],
        tabBarIcon: (props) => {
          let name = "";
          if (route.name === "앨범") name = "image-multiple";
          else if (route.name === "사진") name = "image";
          else if (route.name === "검색") name = "magnify";
          else name = "cog";
          return TabIcon({ ...props, name });
        },
      })}
    >
      <Tab.Screen name="앨범" component={AlbumStack} options={{ headerShown: false }} />
      <Tab.Screen name="사진" component={PhotoStack} options={{ headerShown: false }} />
      <Tab.Screen name="검색" component={SearchStack} options={{ headerShown: false }} />
      <Tab.Screen name="설정" component={Settings} />
    </Tab.Navigator>
  );
};

export default MainTab;
