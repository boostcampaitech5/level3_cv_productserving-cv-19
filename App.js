import { StatusBar } from "expo-status-bar";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
  FlatList,
  Platform,
  PermissionsAndroid,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { ImageUtil } from "react-native-pytorch-core";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

function uriWithoutSchema(uri) {
  return uri.substring("file://".length, uri.length);
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [imgUris, setImgUris] = useState([]);
  useEffect(() => {
    // checkPermission();
    hasPermission();
    // getAllPhotos();
  }, []);
  const hasPermission = async () => {
    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
    const hasPermission_ = await PermissionsAndroid.check(permission);
    if (hasPermission_) {
      return true;
    }
    const status = await PermissionsAndroid.request(permission);
    return status === "granted";
  };
  const getAllPhotos = () => {
    CameraRoll.getPhotos({
      first: 21,
      assetType: "Photos",
    })
      .then((r) => {
        console.log(JSON.stringify(r.edges));
        let images = [];
        for (let i = 0; i < r.edges.length; i++) {
          images.push(uriWithoutSchema(r.edges[i].node.image.uri));
        }
        setImgUris(images);
        console.log(images);
        setPhotos(r.edges);
      })
      .catch((err) => {});
  };
  return (
    <View style={styles.container}>
      {photos && (
        <FlatList
          data={photos}
          numColumns={3}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  width: Dimensions.get("window").width / 3 - 6,
                  height: Dimensions.get("window").width / 3 - 6,
                  margin: 3,
                  backgroundColor: "black",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: item.node.image.uri }}
                  style={{ width: "95%", height: "95%" }}
                />
              </View>
            );
          }}
          keyExtractor={(item) => item.node.image.uri}
        />
      )}
      <TouchableOpacity
        onPress={() => getAllPhotos()}
        style={{
          backgroundColor: "#000",
          bottom: 50,
          height: 50,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#fff" }}>Sync Photos From Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
