import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Pressable, View, ScrollView, Image } from "react-native";
import * as MediaLibrary from "expo-media-library";

const Images = ({ navigation, route }) => {
  const [endCursor, setEndCursor] = useState("0");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    setEndCursor("0");
    setHasNextPage(true);
    fetchImages();
  }, [route.params]);

  const fetchImages = async () => {
    let imageAssets = [];
    if (typeof route.params == "undefined") {
      imageAssets = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 50,
        after: endCursor,
      });
    } else {
      imageAssets = await MediaLibrary.getAssetsAsync({
        album: route.params.albumsId,
        mediaType: "photo",
        first: 50,
        after: endCursor,
      });
    }
    setEndCursor(imageAssets.endCursor);
    setHasNextPage(imageAssets.hasNextPage);
    setImages((prevImages) => [...prevImages, ...imageAssets.assets]);
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  return (
    <View style={styles.collectionComponent}>
      <View style={styles.header}>
        <Text style={styles.headerText}>모든 사진</Text>
      </View>

      <View style={styles.body}>
        <ScrollView
          onScroll={(event) => {
            if (isCloseToBottom(event.nativeEvent) && hasNextPage) {
              console.log(endCursor);
              fetchImages();
            }
          }}
          style={styles.scroll}
          contentContainerStyle={styles.contentContainerStyle}
        >
          {images.map((item, index) => {
            return (
              <Pressable
                onPress={() => {
                  navigation.navigate("PreviewImage", {
                    imageUri: item.uri,
                  });
                }}
                style={{ ...styles.collection }}
                android_ripple={{ color: "lightgray", borderless: true }}
                key={index}
              >
                <Image source={{ uri: item.uri }} style={styles.image} />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

export default Images;

const styles = StyleSheet.create({
  collectionComponent: {
    flex: 1,
  },

  header: {
    flex: 1,
    backgroundColor: "white",
    alignContent: "center",
  },

  headerText: {
    flex: 1,
    color: "black",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 20,
    textAlignVertical: "center",
  },

  body: {
    flex: 9,
    backgroundColor: "#F4F4F4",
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
    // borderColor: 'red',
    // borderWidth: 1,
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
