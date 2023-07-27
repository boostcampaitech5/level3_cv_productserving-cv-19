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
  KeyboardAvoidingView
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SearchBar } from "react-native-elements";
import { ImageUtil } from "react-native-pytorch-core";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ImgSearchBar from "./src/ImgSearchBar";
import encodeImage from "./src/ImageEncoder";
import { fetchTextTensor } from "./src/component/fetchTextTensor";
import { computeSimilarity } from "./src/component/computeSimilarity";
import * as Progress from "react-native-progress";
import ProgressCircle from "react-native-progress/Circle";

function uriWithoutSchema(uri) {
  return uri.substring("file://".length, uri.length);
}

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [imgUris, setImgUris] = useState([]);
  const [imgresults, setimgresults] = useState([]);
  const [searchResults, setSeartchResults] = useState([]);
  const [loading, setLoading] = useState(0);
  const [existsearchbar, setexistsearchbar] = useState(1);

  const searchText = async (text) => {
    setSeartchResults([]);
    setLoading(0.5);
    const textresult = await fetchTextTensor(text);
    setLoading(0.8);
    const result = await computeSimilarity(imgresults, textresult.data(), imgUris);
    setLoading(0);
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
      first: 200,
      assetType: "Photos",
    })
      .then(async (r) => {
        console.log("최신 이미지 Info 처리 시작");
        console.log(JSON.stringify(r.edges));
        let images = [];
        for (let i = 0; i < r.edges.length; i++) {
          let imageUri = uriWithoutSchema(r.edges[i].node.image.uri);
          // console.log("imageUri",imageUri);

          const imgInfo = await ImageUtil.fromFile(imageUri);

          // console.log("imgInfo",imgInfo);
          imgInfo["uri"] = r.edges[i].node.image.uri;

          images.push(imgInfo);
        }

        setImgUris(images);
        setLoading(0.3);
        console.log("최신 이미지 Info 처리 완료");
        setPhotos(r.edges);
        setLoading(0.5);
        console.log("최신 이미지 Info Device Storage 저장 완료");
        setLoading(0.7);
        const imageresult = await encodeImage(imgUris);
        setLoading(0.9);
        setimgresults(imageresult);
        setLoading(0);
      })
      .catch((err) => {});
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : null}
    >
      <View style={styles.search}>
        {existsearchbar == 1 && <ImgSearchBar searchText={searchText} />}
      </View>
      <View style={styles.body}>
        {imgresults.length != 0 && loading > 0 && (
          <Progress.Bar progress={loading} width={200} height={10} style={{position: 'absolute', left: Dimensions.get("window").width/2, height: Dimensions.get("window").height/2,justifyContent:'center',alignItems:'center'}} />
        )}
        {imgresults && (
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
                  <Image source={{ uri: item }} style={{ width: "97%", height: "97%" }} />
                </View>
              );
            }}
            keyExtractor={(item) => item}
          />
        )}
        {imgresults.length == 0 && (
          <TouchableOpacity
            onPress={() => getAllPhotos()}
            style={{
              backgroundColor: "#5bb5d3",
              bottom: 30,
              height: 40,
              borderRadius: 7,
              padding: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "SUITE-Regular",
                backgroundColor: "#5bb5d3",
                fontSize: 16,
              }}
            >
              갤러리 이미지 분석하기
            </Text>
          </TouchableOpacity>
        )}
      </View>
    {/* </View> */}
    </KeyboardAvoidingView>
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
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  body: {
    flex: 9,
  },
});
