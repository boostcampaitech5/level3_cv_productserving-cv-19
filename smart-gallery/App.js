
import React, { useState, useEffect, useRef } from 'react';
import { Pressable, Image, Text, TouchableOpacity, ScrollView, View, Dimensions, StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Camera, ImageUtil } from "react-native-pytorch-core";
import classifyImage from './src/components/imageClassifier';
import ImageGrid from '@baronha/react-native-image-grid';
import { openPicker } from '@baronha/react-native-multiple-image-picker';



const { width } = Dimensions.get('window');
function uriWithoutSchema(path) {
  return path.substring("file://".length, path.length);
}
export default function App() {
  const [images, setImages] = useState([]);
  const [imageClasses, setImageClasses] = useState([]);
  const onPressImage = (item, index) => {
    console.log(item, index);
  };
  const isInitialMount = useRef(true);
  useEffect(() => {
    console.log("images가 업데이트 되었음");
    console.log("images", images)
    if (isInitialMount.current) {
      isInitialMount.current = false;

    } else {
    }
  }, [images]);

  const onPicker = async () => {
    try {
      const singleSelectedMode = false;

      const response = await openPicker({
        selectedAssets: images,
        isExportThumbnail: true,
        maxVideo: 10,
        doneTitle: '추가하기',
        singleSelectedMode,
        isCrop: true,
      });

      const crop = response.crop;

      if (crop) {
        response.path = crop.path;
        response.width = crop.width;
        response.height = crop.height;
      }
      setImages(response);
      console.log(response)
      console.log(response.length)
      console.log("response.data", response.data)
      console.log("response[0].path", response[0].path)

      test = []
      if (response) {
        for (var i = 0; i < response.length; i++) {
          const img = await ImageUtil.fromFile(response[i].path);
          const classifyResult = await classifyImage(img);
          test.push(classifyResult)
          console.log(classifyResult);
          console.log("test", test);
          // img.release();
        }
        setImageClasses(test);
        console.log("test가 저장", test);


      }

    } catch (e) {
    }
  };

  const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = 20;
    return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
  }

  return (
    <View style={style.collectionComponent}>

      <View style={style.header}>
        <StatusBar barStyle={'light-content'} backgroundColor={'#000'} />
        <SafeAreaView />
        <Text style={style.searchbutton}> 안에 낮에 찍은 도시 사진이라고 써있는 서치바</Text>
        <Pressable
          style={style.backButton}
          android_ripple={{ color: 'amber', borderless: true }}
          onPress={() => { navigation.navigate('Collections') }}
        >
        </Pressable>
        <TouchableOpacity style={style.buttonOpen} onPress={onPicker}>
          <Text style={style.textOpen}> Open Picker </Text>
        </TouchableOpacity>
      </View>

      <View style={style.body}>
        <ScrollView
          onScroll={(event) => {
            console.log('scrolling')
            if (isCloseToBottom(event.nativeEvent)) {
              setPageNumber(pageNumber + 1);
            }
          }}
          style={style.scroll}
          contentContainerStyle={style.contentContainerStyle}>
          {images.map((item) => {
            var imageURL = item.realPath;
            return (
              <Pressable
                onPress={() => { navigation.navigate('PreviewImage', { previewURL: item.realPath }) }}
                style={{ ...style.collection }}
                android_ripple={{ color: 'lightgray', borderless: true }}
              >
                <Image source={{ uri: imageURL }} style={style.image} />
              </Pressable>
            )
          })
          }


          <View style={{
            backgroundColor: 'amber'
            // , alignItems: 'center', 
          }}>
            {/* <ImageGrid
              dataImage={Array.isArray(images) ? images : [images]}
              onPressImage={onPressImage}
              containerStyle={{ marginTop: 3 }}
              width={Dimensions.get('window').width - 6}
              sourceKey={'path'}
              videoKey={'type'}
              prefixPath={'file://'}
              conditionCheckVideo={'video'}
              videoURLKey={'thumbnail'}
            /> //사진 갤러리*/}

            {/* <View style={style.labelContainer}>
              <Text style={style.titleText}>  🔻 결과를 확인하세요</Text>
              <Text style={style.titleText}>{imageClasses}</Text>
            </View> //결과 확인창*/}
          </View>


        </ScrollView>
      </View>




    </View>
    // collectionComponent 끝
  );
}

const style = StyleSheet.create({
  collectionComponent: {
    flex: 1,
  },

  body: {
    flex: 9,
    // backgroundColor: 'skyblue',
  },
  scroll: {
    flex: 1,
  },
  container: {
    // backgroundColor: 'white',
    flex: 1,
  },
  title: {
    fontWeight: '900',
    fontSize: 18,
    paddingVertical: 24,
    fontFamily: 'Avenir',
    color: '#cdac81',
    textAlign: 'center',
  },
  buttonOpen: {
    // marginTop: 60,
    left: 12,
    margin: 12,
    backgroundColor: 'pink',
    padding: 12,
    alignItems: 'center',
    width: width - 48,
  },
  searchbutton: {
    left: 12,
    fontWeight: '900',
    fontSize: 16,
    fontFamily: 'Avenir',
    margin: 12,
    // marginBottom: 60,
    backgroundColor: 'white',
    padding: 8,
    alignItems: 'center',
    width: width - 48,
  },
  textOpen: {
    fontWeight: 'bold',
  },
  header: {
    // position: 'absolute', //이거 해제하면 OPEN PICKER 버튼이 눌리지 않음. 
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  baseText: {
    fontFamily: 'Cochin',
  },
  titleText: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  labelContainer: {
    // padding: 10,
    // margin: 10,
    // marginTop: 20,
    // borderRadius: 10,
    backgroundColor: 'hotpink',
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

});



// import React, { useState, useEffect, useRef } from 'react';
// import { Text, StyleSheet, Pressable, View, ScrollView, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import axios from 'axios';
// import * as ImagePicker from "expo-image-picker";
// import { Camera, ImageUtil } from "react-native-pytorch-core";
// import classifyImage from './src/components/imageClassifier';
// import { openPicker } from '@baronha/react-native-multiple-image-picker';

// const CollectionImages = ({ navigation, route }) => {
//   const [images, setImages] = useState([]);
//   const [imageClass, setImageClass] = useState(null);
//   const isInitialMount = useRef(true);
//   const [pageNumber, setPageNumber] = useState((route && route.params && route.params.collectionIndex) || 0);
//   useEffect(() => {
//     axios.get(`https://picsum.photos/v2/list?page=${pageNumber}&limit=20`).then((response) => {
//       const data = response && response.data;
//       console.log("response.data", response.data);
//       setImages([...images, ...data]);
//     });
//   }, [pageNumber]);
//   useEffect(() => {
//     (async () => {
//       const galleryStatus =
//         await ImagePicker.requestMediaLibraryPermissionAsync();
//       setHasGalleryPermission(galleryStatus.status === "granted");
//     })();
//   }, []);
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowEditing: true,
//       aspect: [4, 3],
//       queality: 1,
//     });

//     if (!result.cancelled) {
//       setImage(result.assets[0].uri);
//       const img = await ImageUtil.fromFile(
//         uriWithoutSchema(result.assets[0].uri)
//       );

//       //await handleImage(img);
//       console.log(img);
//       const classifyResult = await classifyImage(img);
//       setImageClass(classifyResult);
//       console.log(classifyResult);
//       img.release();
//     }
//   };
//   const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
//     const paddingToBottom = 20;
//     return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
//   }

//   return (
//     <View style={styles.collectionComponent}>
//       <View style={styles.header}>
//         <Text style={styles.headerText}>
//           Collections
//           <Icon name={'image'} size={35} color={'white'} />
//         </Text>
//         <Pressable
//           style={styles.backButton}
//           android_ripple={{ color: 'amber', borderless: true }}
//           onPress={() => { navigation.navigate('Collections') }}
//         >
//           <Icon name={'caretleft'} size={50} color={'white'} />
//         </Pressable>
//       </View>

//       <View style={styles.body}>
//         <ScrollView
//           onScroll={(event) => {
//             console.log('scrolling')
//             if (isCloseToBottom(event.nativeEvent)) {
//               setPageNumber(pageNumber + 1);
//               // setActivityIndicator(true);
//             }
//           }}
//           style={styles.scroll} contentContainerStyle={styles.contentContainerStyle}>
//           {images.map((item, index) => {
//             var imageURL = item.download_url;
//             imageURL = imageURL.substring(0, imageURL.lastIndexOf('/'));
//             imageURL = imageURL.substring(0, imageURL.lastIndexOf('/'));
//             imageURL = imageURL + '/200';
//             return (
//               <Pressable
//                 onPress={() => { navigation.navigate('PreviewImage', { previewURL: item.download_url }) }}
//                 style={{ ...styles.collection }}
//                 android_ripple={{ color: 'lightgray', borderless: true }}
//               >
//                 <Image source={{ uri: imageURL }} style={styles.image} />
//                 {/* <Text style = {styles.collectionName}>{itemName}</Text> */}
//               </Pressable>
//             )
//           })
//           }
//           {/* <Pressable style = {styles.collection} android_ripple = {{color: 'lightgray', borderless: true}}></Pressable> */}
//         </ScrollView>
//       </View>
//     </View>
//   );
// }

// export default CollectionImages;

// const styles = StyleSheet.create({
//   collectionComponent: {
//     flex: 1,
//   },

//   header: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 140, 170, 0.5)',
//   },

//   headerText: {
//     fontFamily: 'Cochin',
//     flex: 1,
//     color: 'black',
//     fontSize: 32,
//     textAlign: 'center',
//     textAlignVertical: 'center',
//   },

//   body: {
//     flex: 9,
//   },

//   scroll: {
//     flex: 1,
//   },

//   contentContainerStyle: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     flexWrap: 'wrap'
//   },

//   collection: {
//     height: 150,
//     width: '31.33%',
//     borderRadius: 15,
//     marginBottom: 15,
//   },

//   image: {
//     width: '100%',
//     height: '100%',
//     // borderRadius: 20,
//   },

//   backButton: {
//     position: 'absolute',
//     top: 0,
//     height: '100%',
//     width: '10%',
//     padding: 15,
//     justifyContent: 'center',
//   },

//   collectionName: {
//     position: 'absolute',
//     width: '100%',
//     bottom: 0,
//     borderBottomRightRadius: 20,
//     borderBottomLeftRadius: 20,
//     color: 'white',
//     textAlign: 'center',
//     textAlignVertical: 'center',
//     backgroundColor: '#09090963',
//     fontSize: 18,
//   }
// });
// import React, { useState, useEffect, useRef } from 'react';
// import { Text, StyleSheet, Pressable, View, ScrollView, Image } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome';
// import axios from 'axios';
// import * as ImagePicker from "expo-image-picker";
// import { Camera, ImageUtil } from "react-native-pytorch-core";
// import classifyImage from './src/components/imageClassifier';
// import { openPicker } from '@baronha/react-native-multiple-image-picker';

// const CollectionImages = ({ navigation, route }) => {
//   const [images, setImages] = useState([]);
//   const [imageClass, setImageClass] = useState(null);
//   const isInitialMount = useRef(true);
//   const [pageNumber, setPageNumber] = useState((route && route.params && route.params.collectionIndex) || 0);
//   useEffect(() => {
//     axios.get(`https://picsum.photos/v2/list?page=${pageNumber}&limit=20`).then((response) => {
//       const data = response && response.data;
//       setImages([...images, ...data]);
//     });
//   }, [pageNumber]);
//   const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
//     const paddingToBottom = 20;
//     return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
//   }
//   return (
//     <View style={styles.collectionComponent}>
//       <View style={styles.header}>
//         {/* //header 시작 */}
//         <Text style={styles.headerText}>
//           Collections
//           {/* <Icon name={'image'} size={35} color={'white'} /> */}
//         </Text>
//         <Pressable
//           style={styles.backButton}
//           android_ripple={{ color: 'amber', borderless: true }}
//           onPress={() => { navigation.navigate('Collections') }}
//         >
//           <Icon name={'caretleft'} size={50} color={'white'} />
//         </Pressable>
//       </View>
//       {/* //header 끝. */}

//       <View style={styles.body}>
//         {/* //body 시작 */}
//         <ScrollView
//           onScroll={(event) => {
//             console.log('scrolling')
//             if (isCloseToBottom(event.nativeEvent)) {
//               setPageNumber(pageNumber + 1);
//               // setActivityIndicator(true);
//             }
//           }}
//           style={styles.scroll}
//           contentContainerStyle={styles.contentContainerStyle}>

//           {images.map((item, index) => {
//             var imageURL = item.download_url;
//             console.log("0", imageURL)
//             imageURL = imageURL.substring(0, imageURL.lastIndexOf('/'));
//             console.log("1", imageURL)
//             imageURL = imageURL.substring(0, imageURL.lastIndexOf('/'));
//             console.log("2", imageURL)
//             imageURL = imageURL + '/200';
//             //링크를 통해서 사진 크기를 200X200으로 조절하는 과정임
//             console.log("3", imageURL)
//             return (
//               <Pressable
//                 onPress={() => { navigation.navigate('PreviewImage', { previewURL: item.download_url }) }}
//                 style={{ ...styles.collection }}
//                 android_ripple={{ color: 'lightgray', borderless: true }}
//               >
//                 <Image source={{ uri: imageURL }} style={styles.image} />
//                 {/* <Text style = {styles.collectionName}>{itemName}</Text> */}
//               </Pressable>
//             )
//           })
//           }


//           {/* <Pressable style = {styles.collection} android_ripple = {{color: 'lightgray', borderless: true}}></Pressable> */}
//         </ScrollView>
//       </View>
//       {/* //body 끝 */}
//     </View>
//   );
// }

// export default CollectionImages;

// const styles = StyleSheet.create({
//   collectionComponent: {
//     flex: 1,
//   },

//   header: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 140, 170, 0.5)',
//   },

//   headerText: {
//     fontFamily: 'Cochin',
//     flex: 1,
//     color: 'black',
//     fontSize: 32,
//     textAlign: 'center',
//     textAlignVertical: 'center',
//   },

//   body: {
//     flex: 9,
//   },

//   scroll: {
//     flex: 1,
//   },

//   contentContainerStyle: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 10,
//     flexWrap: 'wrap'
//   },

//   collection: {
//     height: 150,
//     width: '31.33%',
//     borderRadius: 15,
//     marginBottom: 15,
//   },

//   image: {
//     width: '100%',
//     height: '100%',
//     // borderRadius: 20,
//   },

//   backButton: {
//     position: 'absolute',
//     top: 0,
//     height: '100%',
//     width: '10%',
//     padding: 15,
//     justifyContent: 'center',
//   },

//   collectionName: {
//     position: 'absolute',
//     width: '100%',
//     bottom: 0,
//     borderBottomRightRadius: 20,
//     borderBottomLeftRadius: 20,
//     color: 'white',
//     textAlign: 'center',
//     textAlignVertical: 'center',
//     backgroundColor: '#09090963',
//     fontSize: 18,
//   }
// });