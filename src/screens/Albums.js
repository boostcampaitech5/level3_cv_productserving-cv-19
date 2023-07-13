import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Pressable, View, ScrollView, Image } from "react-native";
import * as MediaLibrary from "expo-media-library";

const Albums = ({ navigation }) => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const albumAssets = await MediaLibrary.getAlbumsAsync();

    // 이미지만 있는 앨범 필터링
    const imageAlbums = [];
    for (const albumAsset of albumAssets) {
      const imageAssets = await MediaLibrary.getAssetsAsync({
        album: albumAsset.id,
        mediaType: "photo",
        first: 1,
      });
      if (imageAssets.totalCount > 0) {
        imageAlbums.push({
          id: albumAsset.id,
          assetCount: imageAssets.totalCount,
          title: albumAsset.title,
          thumbnailUri: imageAssets.assets[0].uri,
        });
      }
    }
    setAlbums(imageAlbums);
  };

  return (
    <View style={styles.albumComponent}>
      <View style={styles.header}>
        <Text style={styles.headerText}>앨범</Text>
      </View>

      <View style={styles.body}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainerStyle}>
          {albums.map((items, index) => (
            <Pressable
              style={styles.album}
              android_ripple={{ color: "lightgray", borderless: true }}
              onPress={() => {
                navigation.navigate("Images", {
                  albumsId: items.id,
                });
              }}
              key={index}
            >
              <Image source={{ uri: items.thumbnailUri }} style={styles.image} />
              <Text style={styles.albumTitle}>{items.title}</Text>
              <Text style={styles.count}>{items.assetCount}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Albums;

const styles = StyleSheet.create({
  albumComponent: {
    flex: 1,
  },

  header: {
    flex: 1,
    backgroundColor: "white",
  },

  headerText: {
    flex: 1,
    color: "black",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
    textAlignVertical: "center",
    paddingLeft: 20,
  },

  body: {
    flex: 9,
  },

  scroll: {
    backgroundColor: "#F4F4F4",
    flex: 1,
  },

  contentContainerStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    flexWrap: "wrap",
  },

  album: {
    marginVertical: "4%",
    marginHorizontal: "2%",
    height: 170,
    width: "46%",
    borderRadius: 15,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },

  albumTitle: {
    position: "absolute",
    width: "100%",
    bottom: 0,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    color: "white",
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: "#09090963",
    fontSize: 18,
  },
  count: {
    paddingLeft: "3%",
  },
});
