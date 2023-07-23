import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

const PreviewImage = (props) => {
  return (
    <View style={styles.previewImage}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          android_ripple={{ color: "gray", borderless: true }}
          onPress={() => props.navigation.goBack()}
        >
          <Icon name={"angle-left"} size={35} color={"black"} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Image
          source={{
            uri: props.route && props.route.params && props.route.params.imageUri,
          }}
          style={styles.image}
        ></Image>
      </View>
    </View>
  );
};

export default PreviewImage;

const styles = StyleSheet.create({
  previewImage: {
    flex: 1,
  },

  header: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },

  body: {
    flex: 9,
    verticalAlign: "middle",
    backgroundColor: "#F4F4F4",
  },

  headerText: {
    flex: 1,
    color: "white",
    fontSize: 32,
    textAlign: "center",
    textAlignVertical: "center",
  },

  backButton: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "20%",
    padding: 20,
    justifyContent: "center",
  },

  image: {
    height: "80%",
    width: "100%",
    marginTop: "10%",
  },
});
