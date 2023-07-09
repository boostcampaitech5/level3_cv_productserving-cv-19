import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, Pressable, View, ScrollView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageUtil } from "react-native-pytorch-core";
import classifyImage from './src/components/imageClassifier';
import { openPicker } from '@baronha/react-native-multiple-image-picker';

const CollectionImages = ({ navigation, route }) => {
  const [images, setImages] = useState([]);
  const [imageClass, setImageClass] = useState(null);
  const isInitialMount = useRef(true);
  const [pageNumber, setPageNumber] = useState((route && route.params && route.params.collectionIndex) || 0);
  useEffect(() => {
    axios.get(`https://picsum.photos/v2/list?page=${pageNumber}&limit=20`).then((response) => {
      const data = response && response.data;
      setImages([...images, ...data]);
    });
  }, [pageNumber]);
};
const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
}

return (
  <View style={styles.collectionComponent}>
    <View style={styles.header}>
      {/* //header 시작 */}
      <Text style={styles.headerText}>
        Collections
        {/* <Icon name={'image'} size={35} color={'white'} /> */}
      </Text>
      <Pressable
        style={styles.backButton}
        android_ripple={{ color: 'amber', borderless: true }}
        onPress={() => { navigation.navigate('Collections') }}
      >
        <Icon name={'caretleft'} size={50} color={'white'} />
      </Pressable>
    </View>
    {/* //header 끝. */}

    <View style={styles.body}>
      {/* //body 시작 */}
      <ScrollView
        onScroll={(event) => {
          console.log('scrolling')
          if (isCloseToBottom(event.nativeEvent)) {
            setPageNumber(pageNumber + 1);
            // setActivityIndicator(true);
          }
        }}
        style={styles.scroll}
        contentContainerStyle={styles.contentContainerStyle}>

        {images.map((item, index) => {
          var imageURL = item.download_url;
          imageURL = imageURL.substring(0, imageURL.lastIndexOf('/'));
          imageURL = imageURL.substring(0, imageURL.lastIndexOf('/'));
          imageURL = imageURL + '/200';
          return (
            <Pressable
              onPress={() => { navigation.navigate('PreviewImage', { previewURL: item.download_url }) }}
              style={{ ...styles.collection }}
              android_ripple={{ color: 'lightgray', borderless: true }}
            >
              <Image source={{ uri: imageURL }} style={styles.image} />
              {/* <Text style = {styles.collectionName}>{itemName}</Text> */}
            </Pressable>
          )
        })
        }


        {/* <Pressable style = {styles.collection} android_ripple = {{color: 'lightgray', borderless: true}}></Pressable> */}
      </ScrollView>
    </View> //body 끝
  </View>
);


export default CollectionImages;

const styles = StyleSheet.create({
  collectionComponent: {
    flex: 1,
  },

  header: {
    flex: 1,
    backgroundColor: 'rgba(0, 140, 170, 0.5)',
  },

  headerText: {
    fontFamily: 'Cochin',
    flex: 1,
    color: 'black',
    fontSize: 32,
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  body: {
    flex: 9,
  },

  scroll: {
    flex: 1,
  },

  contentContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    flexWrap: 'wrap'
  },

  collection: {
    height: 150,
    width: '31.33%',
    borderRadius: 15,
    marginBottom: 15,
  },

  image: {
    width: '100%',
    height: '100%',
    // borderRadius: 20,
  },

  backButton: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '10%',
    padding: 15,
    justifyContent: 'center',
  },

  collectionName: {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    color: 'white',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#09090963',
    fontSize: 18,
  }
});