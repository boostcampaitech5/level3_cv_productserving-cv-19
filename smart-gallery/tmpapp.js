import { StatusBar } from 'expo-status-bar';
import { Button, Image, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import React, { useState, useEffect } from 'react';
import classifyImage from './src/components/imageClassifier';
import { Camera } from 'react-native-pytorch-core';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
export default function App() {

    const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
    const [image, setImage] = useState(null);
    const [ok, setOk] = useState(false);
    const insets = useSafeAreaInsets();
    // 1. Create a React state to store the top class returned from the
    // classifyImage function
    const [topClass, setTopClass] = React.useState(
        "Press capture button to classify what's in the camera view!",
    );
    // Function to handle images whenever the user presses the capture button
    async function handleImage(image) {
        // Call the classify image function with the camera image
        console.log("!@#!#@!#!#@#!@#!@#!@#!@#!@#start")
        const result = await classifyImage(image);
        // 2. Set result as top class label state
        setTopClass(result);
        // Release the image from memory
        image.release();
    }

    useEffect(() => {
        (async () => {
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionAsync();
            setHasGalleryPermission(galleryStatus.status === 'granted');
        })();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowEditing: true,
            aspect: [4, 3],
            queality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImage(result.uri);
            setOk(true);
        }
    };
    if (hasGalleryPermission == false) {
        return <Text>No access to Internal Storage</Text>
    }
    return (
        <SafeAreaProvider>
            <View style={StyleSheet.absoluteFill}>
                {/* Render camara and make it parent filling */}
                <Camera
                    style={[StyleSheet.absoluteFill, { bottom: insets.bottom }]}
                    // Add handle image callback on the camera component
                    onCapture={handleImage}
                />
                {/* Label container with custom render style and a text */}
                <View style={styles.labelContainer}>
                    {/* 3. Change the text to render the top class label */}
                    <Text>{topClass}</Text>
                </View>
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // alignItems: 'center',
        justifyContent: 'center',
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
        padding: 20,
        margin: 20,
        marginTop: 40,
        borderRadius: 10,
        backgroundColor: 'white',
    },
});