
import { StatusBar } from "expo-status-bar";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect, useRef } from "react";

import { Camera, ImageUtil } from "react-native-pytorch-core";
import classifyImage from './src/components/imageClassifier';
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
            <Text style={styles.titleText}>  ☑️ 사진을 선택해주세요</Text>
            <Button
                title="Pick Image"
                onPress={() => pickImage()}
                style={{ marginTop: 30 }}
            />
            {image && <Image source={{ uri: image }} style={{ flex: 1 / 2 }} />}
            <View style={styles.labelContainer}>
                <Text style={styles.titleText}>  🔻 결과를 확인하세요</Text>
                {/* 3. Change the text to render the top class label */}
                <Text style={styles.titleText}>{imageClass}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "pink",
        alignItems: "center",
        justifyContent: "center",
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
        padding: 10,
        margin: 10,
        marginTop: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 140, 170, 0.5)',
    },
});