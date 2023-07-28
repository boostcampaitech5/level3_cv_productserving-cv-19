// 1. Add import for MobileModel from PlayTorch SDK
import {torch} from "react-native-pytorch-core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { preprocess } from "./component/preprocess";
import { fetchTextTensor } from "./component/fetchTextTensor";
import { loadModelAndForward } from "./component/modelLoad";
import { computeSimilarity } from "./component/computeSimilarity";
const texts = [
  "A photo of a animal",
  "A photo of a food",
  "A photo of a human",
  "A photo of a indoor",
  "A photo of a outdoor",
];


export default async function encodeImage(image) {
  // Get image width and height

  let allTensor = [];
  let imagePath = [];
  let tensor;
  for (let i = 0; i < image.length; i++) {
    tensor = preprocess(image[i]);
    allTensor.push(tensor);
    imagePath.push(image[i].uri);
  }
  console.log("모든 사진 전처리 완료");

  let outputTensor = [];
  let serializedOutput;
  let output;
  let startTime = performance.now();
  let sumtime = 0;
  let check;
  let initsumtime = 0;
  for (let j = 0; j<allTensor.length; j++){
    
    console.log("image.uri",imagePath[j]);
    serializedOutput = await AsyncStorage.getItem(`image_Value_${imagePath[j]}`);
    if (serializedOutput) {
      let initstarts = performance.now();
      check = JSON.parse(serializedOutput);
      const sortedKeys = Object.keys(check).sort((a, b) => parseInt(a) - parseInt(b));
      const resultArray = sortedKeys.map((key) => check[key]);
      output = resultArray;
      let initends = performance.now();
      initsumtime += initends-initstarts;
      console.log("data exist");
    } else {
      let starts = performance.now();
      const saveoutput = await loadModelAndForward(allTensor[j]);
      let ends = performance.now();
      sumtime += ends-starts;
      serializedOutput = JSON.stringify(saveoutput.data());
      await AsyncStorage.setItem(`image_Value_${imagePath[j]}`, serializedOutput);
      const newserializedOutput = await AsyncStorage.getItem(`image_Value_${imagePath[j]}`);
      output = JSON.parse(newserializedOutput);
      const sortedKeys = Object.keys(output).sort((a, b) => parseInt(a) - parseInt(b));
      const resultArray = sortedKeys.map((key) => output[key]);
      output = resultArray;
      console.log("new data forward ing");
    }
    
    outputTensor.push(output);
  }
  let endTime = performance.now();
  console.log("sumtime:",sumtime/1000,"initsumtime:",initsumtime/1000);
  console.log(`이미지가 이미지 인코더 모델에 forward 하는데 걸린 작업 시간은 총 ${(endTime - startTime)/1000}초입니다.`);
  // console.log(outputTensor.length,"행",outputTensor[0].length,"열");
  return outputTensor;
}