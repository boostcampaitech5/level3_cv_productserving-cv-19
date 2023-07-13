import React, { useState, useEffect } from "react";
import { TextInput, StyleSheet, Pressable, View, ScrollView, Image } from "react-native";
import axios from "axios";
import { SearchBar, Button } from "@rneui/themed";
import Icon from "react-native-vector-icons/FontAwesome";

const Search = ({ navigation, route }) => {
  const [images, setImages] = useState([]);
  const [search, setSearch] = useState("");
  const [isExtracted, setIsExtracted] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [pageNumber, setPageNumber] = useState(
    (route && route.params && route.params.collectionIndex) || 0
  );

  useEffect(() => {
    axios.get(`https://picsum.photos/v2/list?page=${pageNumber}&limit=20`).then((response) => {
      const data = response && response.data;
      setImages([...images, ...data]);
    });
  }, [pageNumber]);

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  };

  return (
    <View style={styles.collectionComponent}>
      <View style={styles.header}>
        <SearchBar
          placeholder="검색어를 입력해주세요."
          onChangeText={(text) => {
            setSearch(text);
          }}
          value={search}
          platform="ios"
        />
      </View>

      {isExtracted && (
        <View style={styles.body}>
          <ScrollView
            onScroll={(event) => {
              console.log("scrolling");
              if (isCloseToBottom(event.nativeEvent)) {
                setPageNumber(pageNumber + 1);
              }
            }}
            style={styles.scroll}
            contentContainerStyle={styles.contentContainerStyle}
          >
            {images.map((item, index) => {
              var imageURL = item.download_url;
              imageURL = imageURL.substring(0, imageURL.lastIndexOf("/"));
              imageURL = imageURL.substring(0, imageURL.lastIndexOf("/"));
              imageURL = imageURL + "/200";
              return (
                <Pressable
                  onPress={() => {
                    navigation.navigate("PreviewImage", {
                      previewURL: item.download_url,
                    });
                  }}
                  style={{ ...styles.collection }}
                  android_ripple={{ color: "lightgray", borderless: true }}
                  key={index}
                >
                  <Image source={{ uri: imageURL }} style={styles.image} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
      {isExtracted || (
        <View style={styles.body}>
          {isExtracting || (
            <Button
              buttonStyle={styles.button}
              title="갤러리 이미지 분석"
              onPress={() => {
                setIsExtracting(true);
                setTimeout(() => {
                  alert("이미지 분석 완료");
                  setIsExtracted(true);
                }, 5000);
              }}
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
