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
import { SearchBar } from "react-native-elements";
import { ImageUtil } from "react-native-pytorch-core";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ImgSearchBar from "./src/ImgSearchBar";
import encodeImage from "./src/ImageEncoder";
import { fetchTextTensor } from "./src/component/fetchTextTensor";
import { computeSimilarity } from "./src/component/computeSimilarity";


function uriWithoutSchema(uri) {
  return uri.substring("file://".length, uri.length);
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [imgUris, setImgUris] = useState([]);
  const [searchResults, setSeartchResults] = useState([]);

  const searchText = async (text) => {

    const imageresult = await encodeImage(imgUris);
    const textresult = await fetchTextTensor(text);
    const result = await computeSimilarity(imageresult, textresult.data(), imgUris);
    setSeartchResults(result);
    console.log(text);
    console.log("검색");
    console.log(result[0]);
  };
  useEffect(() => {
    hasPermission();
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
      first: 51,
      assetType: "Photos",
    })
      .then(async (r) => {
        console.log("이미지 처리중");
        console.log(JSON.stringify(r.edges));
        let images = [];
        console.log("n번만큼 반복문 실행",r.edges.length);
        for (let i = 0; i < r.edges.length; i++) {
          let imageUri = uriWithoutSchema(r.edges[i].node.image.uri);
          // console.log("imageUri",imageUri);

          const imgInfo = await ImageUtil.fromFile(imageUri);

          // console.log("imgInfo",imgInfo);
          imgInfo["uri"] = r.edges[i].node.image.uri;

          images.push(imgInfo);
        }

        setImgUris(images);

        console.log(images);
        setPhotos(r.edges);
        console.log(r.edges[0].node.image.uri);
      })
      .catch((err) => {});
  };
  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <ImgSearchBar searchText={searchText} />
      </View>
      {searchResults && (
        <FlatList
          data={searchResults}
          numColumns={3}
          renderItem={({ item, index }) => {
            return (
              <View
                style={{
                  width: Dimensions.get("window").width / 3 - 6,
                  height: Dimensions.get("window").width / 3 - 6,
                  margin: 2,
                  backgroundColor: "black",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{ uri: item }}
                  style={{ width: "97%", height: "97%" }}
                />
              </View>
            );
          }}
          keyExtractor={(item) => item}
        />
      )}
      
      <TouchableOpacity
        onPress={() => getAllPhotos()}
        style={{
          backgroundColor: "#000",
          bottom: 30,
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
  search: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 5,
    paddingVertical: 4,
  },
});