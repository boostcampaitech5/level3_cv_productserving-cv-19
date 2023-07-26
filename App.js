import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  PermissionsAndroid,
  Dimensions,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import {
  fetch,
  decodeJpeg,
  bundleResourceIO,
} from "@tensorflow/tfjs-react-native";
import * as MediaLibrary from "expo-media-library";
import * as jpeg from "jpeg-js";
import * as FileSystem from "expo-file-system";
import TensorflowLite from "@switt/react-native-tensorflow-lite";
import * as blazeface from "@tensorflow-models/blazeface";
import { Asset } from "expo-asset";
function uriWithoutSchema(uri) {
  return uri.substring("file://".length, uri.length);
}

function imageToTensor(rawImageData) {
  const TO_UINT8ARRAY = true;
  const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
  // Drop the alpha channel info for mobilenet
  const buffer = new Uint8Array(width * height * 3);
  let offset = 0; // offset into original data
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset];
    buffer[i + 1] = data[offset + 1];
    buffer[i + 2] = data[offset + 2];

    offset += 4;
  }

  return tf.tensor3d(buffer, [height, width, 3]);
}

export default function App() {
  const [images, setImages] = useState([]);
  const [ok, setOk] = useState(false);
  async function encodeImage() {
    await tf.ready();
    let allTensor = [];
    console.log(images.length);
    let uris = [];
    let shapes = [];
    for (image of images) {
      if (!(image.uri.endsWith("jpg") || image.uri.endsWith("jpeg"))) {
        continue;
      }
      console.log(image.uri);
      uris.push(uriWithoutSchema(image.uri));
      if (!image.uri) {
        console.log("image.uri null");
      }
      // const imageAssetPath = await Image.resolveAssetSource(image.uri);
      // console.log(imageAssetPath);
      // const example = tf.browser.FromPixels(image);
      // console.log(example);
      // const response = await fetch(image.uri, {}, { isBinary: true });
      // console.log(response);
      // const rawImageData = await response.arrayBuffer();
      // const imageTensor = imageToTensor(rawImageData);
      const imgB64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imgBuffer = tf.util.encodeString(imgB64, "base64").buffer;
      const raw = new Uint8Array(imgBuffer);
      // tf.tidy(() => {
      let imageTensor = decodeJpeg(raw);
      imageTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
      imageTensor = tf.transpose(imageTensor, [2, 0, 1]);
      imageTensor = tf.expandDims(imageTensor, 0);
      allTensor.push(imageTensor);
      console.log(imageTensor.shape);
      shapes.push(imageTensor.shape);
      // });
      console.log(tf.memory());
    }
    const finalTensor = tf.concat(allTensor, 0);
    // tf.dispose(allTensor);
    /*
    console.log(finalTensor.shape);
    const modelAsset = Asset.fromModule(
      "http://101.101.219.90:30003/clip-image-vit-32.tflite"
    );
    await modelAsset.downloadAsync();
    console.log(modelAsset.localUri);
    console.log(uris);
    const results = await TensorflowLite.runModelWithFiles({
      model: modelAsset.localUri,
      files: uris,
      shapes: shapes,
    });
    console.log(`results : ${results} type : ${typeof results}`);
    */
    console.log("[+] Loading custom mask detection model");
    //Replce model.json and group1-shard.bin with your own custom model
    const modelJson = await require("./assets/model/model.json");
    console.log("model");
    console.log(modelJson);
    const modelWeight = await require("./assets/model/group1-shard.bin");
    console.log("weight");
    console.log(modelWeight);
    console.log(bundleResourceIO(modelJson, modelWeight));
    const textEncoder = await tf.loadLayersModel(
      bundleResourceIO(modelJson, modelWeight)
    );
    console.log(textEncoder);
    let result = textEncoder.predict(finalTensor).data();
    console.log(result.shape);
  }
  const getPermissions = async () => {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
    console.log(status);
    console.log(canAskAgain);
    if (status === "undetermined" || status === "denied") {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "undetermined") {
        setOk(true);
        await fetchImages();
        await encodeImage();
      }
    } else if (status !== "undetermined") {
      setOk(true);
      await fetchImages();
      await encodeImage();
    }
  };

  useEffect(() => {
    getPermissions();
    // fetchImages();
  }, []);
  const fetchImages = async () => {
    let imageAssets = [];
    imageAssets = await MediaLibrary.getAssetsAsync({
      mediaType: "photo",
      first: 1,
      after: "0",
    });
    setImages(imageAssets.assets);
    console.log(imageAssets.assets[0].uri);
  };
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
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
