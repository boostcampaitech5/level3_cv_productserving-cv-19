import { StatusBar } from "expo-status-bar";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect, useRef } from "react";

import { Camera, ImageUtil } from "react-native-pytorch-core";
import classifyImage from "./src/ImageClassifier";
function uriWithoutSchema(uri) {
  return uri.substring("file://".length, uri.length);
}

export default function App() {
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [imageClass, setImageClass] = useState(null);
  const isInitialMount = useRef(true);
  useEffect(() => {
    (async () => {
      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionAsync();
      setHasGalleryPermission(galleryStatus.status === "granted");
    })();
  }, []);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      /*
      let img = new Image();
      img.src = image;
      img.onload = function () {
        context.drawImage(img, 0, 0);
        var imgData = context.getImageData(x, y, width, height).data;
      };
      */
    }
  }, [image]);
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowEditing: true,
      aspect: [4, 3],
      queality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
      const img = await ImageUtil.fromFile(
        uriWithoutSchema(result.assets[0].uri)
      );
      //await handleImage(img);
      console.log(img);
      const classifyResult = await classifyImage(img);
      setImageClass(classifyResult);
      console.log(classifyResult);
      img.release();
    }
  };
  if (hasGalleryPermission == false) {
    return <Text>No access to Internal Storage</Text>;
  }
  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      <Button
        title="Pick Image"
        onPress={() => pickImage()}
        style={{ marginTop: 30 }}
      />
      {image && <Image source={{ uri: image }} style={{ flex: 1 / 2 }} />}
      <View style={styles.labelContainer}>
        {/* 3. Change the text to render the top class label */}
        <Text>{imageClass}</Text>
      </View>
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
