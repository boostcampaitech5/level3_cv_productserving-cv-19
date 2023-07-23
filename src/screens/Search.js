import React, { useState } from "react";
import { StyleSheet, Pressable, View, FlatList, Image, TextInput } from "react-native";
import { SearchBar, Button } from "@rneui/themed";
// import encodeImage from "../component/ImageEncoder";
import * as MediaLibrary from "expo-media-library";
import { ImageUtil } from "react-native-pytorch-core";

import { MobileModel, torch, torchvision, media } from "react-native-pytorch-core";

function uriWithoutSchema(uri) {
  return uri.substring("file://".length, uri.length);
}

function encodeImage(image, text) {
  let tensor = [];
  for (let i = 0; i < image.length; i++) {
    console.log(image[i]);
    const width = image[i].getWidth();
    const height = image[i].getHeight();
    // Convert image to blob, which is a byte representation of the image
    // in the format height (H), width (W), and channels (C), or HWC for short
    const blob = media.toBlob(image[i]);
    // Get a tensor from image the blob and also define in what format
    // the image blob is.
    tensor = torch.fromBlob(blob, [height, width, 3]);
    console.log(tensor.shape);
    // Rearrange the tensor shape to be [CHW]
    tensor = tensor.permute([2, 0, 1]);
    // Divide the tensor values by 255 to get values between [0, 1]
    tensor = tensor.div(255);
    // Crop the image in the center to be a squared image
    const centerCrop = torchvision.transforms.centerCrop(Math.min(width, height));
    console.log(centerCrop);
    tensor = centerCrop(tensor);
    // Resize the image tensor to 3 x 224 x 224
    const resize = torchvision.transforms.resize(224);
    tensor = resize(tensor);
    // Normalize the tensor image with mean and standard deviation
    const normalize = torchvision.transforms.normalize(
      [0.485, 0.456, 0.406],
      [0.229, 0.224, 0.225]
    );
    tensor = normalize(tensor);
    // Unsqueeze adds 1 leading dimension to the tensor
    tensor = tensor.unsqueeze(0);
    tensor = null;
  }
  return 0;
}

const Search = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState("");
  const [imageInputs, setImageInputs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isExtracted, setIsExtracted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractFeature = async () => {
    setIsExtracting(true);
    let imageAssets = [];
    let images = [];
    imageAssets = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 100,
    });
    imageAssets = imageAssets.assets;

    for (let i = 0; i < imageAssets.length; i++) {
      let imageUri = uriWithoutSchema(imageAssets[i].uri);
      const imgInfo = await ImageUtil.fromFile(imageUri);
      console.log(imgInfo);
      imgInfo["uri"] = imageAssets[i].uri;
      images.push(imgInfo);
    }
    console.log(imageInputs.length);
    setImageInputs(images);
    setIsExtracting(false);

    const result = encodeImage(imageInputs, "text");
    console.log(result);
    setSearchResults(result);
    console.log("완료");
  };

  // const extractFeature = async () => {
  //   setIsExtracting(true);
  //   let imageAssets = [];
  //   let images = [];
  //   imageAssets = await MediaLibrary.getAssetsAsync({
  //     mediaType: "photo",
  //     first: 30,
  //   });
  //   imageAssets = imageAssets.assets;

  //   for (let i = 0; i < imageAssets.length; i++) {
  //     let imageUri = uriWithoutSchema(imageAssets[i].uri);
  //     const imgInfo = await ImageUtil.fromFile(imageUri);
  //     console.log(imgInfo);
  //     imgInfo["uri"] = imageAssets[i].uri;
  //     images.push(imgInfo);
  //   }
  //   setImageInputs(images);
  //   setIsExtracted(true);
  // };

  const searchImage = async (text) => {
    const result = encodeImage(imageInputs, text);
    console.log(result);
    setSearchResults(result);
    console.log("완료");
  };

  const renderItem = ({ item }) => {
    return (
      <Pressable
        onPress={() => {
          navigation.navigate("PreviewImage", {
            imageUri: item.uri,
          });
        }}
        style={{ ...styles.collection }}
        android_ripple={{ color: "lightgray", borderless: true }}
        key={item.id}
      >
        <Image source={{ uri: item }} style={styles.image} />
      </Pressable>
    );
  };

  return (
    <View style={styles.collectionComponent}>
      <View style={styles.header}>
        <SearchBar
          placeholder="검색어를 입력해주세요."
          onChangeText={setSearchText}
          value={searchText}
          onSubmitEditing={searchImage}
          platform="ios"
        />
      </View>

      {isExtracted && (
        <View style={styles.body}>
          {/* <FlatList
            data={searchResults}
            numColumns={3}
            renderItem={renderItem}
            keyExtractor={(item) => item}
          /> */}
          <Button buttonStyle={styles.button} title="이미지 전처리" onPress={searchImage} />
        </View>
      )}
      {isExtracted || (
        <View style={styles.body}>
          {isExtracting || (
            <Button
              buttonStyle={styles.button}
              title="갤러리 이미지 분석"
              onPress={extractFeature}
            />
          )}
          {isExtracting && (
            <Button buttonStyle={styles.button} title="Feature Extraction" loading />
          )}
        </View>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  collectionComponent: {
    flex: 1,
  },

  header: {
    flex: 1,
    backgroundColor: "white",
    alignContent: "center",
  },

  body: {
    flex: 9,
    backgroundColor: "#F4F4F4",
  },

  button: {
    width: "90%",
    marginHorizontal: "5%",
    marginTop: "70%",
    borderRadius: 5,
  },

  scroll: {
    flex: 1,
  },

  contentContainerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  collection: {
    height: 120,
    width: "33.33%",
  },

  image: {
    width: "98%",
    height: "98%",
  },

  backButton: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "20%",
    padding: 15,
    justifyContent: "center",
    color: "black",
  },

  collectionName: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#09090963",
    fontSize: 18,
  },
});
