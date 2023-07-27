import { torch, MobileModel } from "react-native-pytorch-core";
import * as FileSystem from "expo-file-system";

const MODEL_URL = "http://101.101.219.90:30003/visual_mobile_clip_ori_cpu.ptl";

let model = null;

export async function loadModelAndForward(tensor) {
  if (model == null) {
    console.log(MODEL_URL);
    let filePath = null;
    const modelExist = await FileSystem.getInfoAsync(
      FileSystem.cacheDirectory + "visual_mobile_clip_ori_cpu.ptl"
    );

    if (modelExist.exists) {
      console.log("model exists");
      filePath = "/data/user/0/com.anonymous.gallery/cache/visual_mobile_clip_ori_cpu.ptl";
    } else {
      try {
        let startTime = performance.now();
        filePath = await MobileModel.download(MODEL_URL);
        let endTime = performance.now();
      console.log(`모델 다운로드 하는데 걸린 작업 시간은 총 ${(endTime - startTime)/1000}초 입니다.`);
      } catch (err) {
        console.log(err);
      }
    }
    // console.log(filePath);
    try {
      let ssstartTime = performance.now();
      model = await torch.jit._loadForMobile(filePath);
      console.log("model load 시작");
      let eeendTime = performance.now();
      console.log(`모델 로드 하는데 걸린 작업 시간은 총 ${(eeendTime - ssstartTime)/1000}초입니다.`);
    } catch (err) {
      console.log(err);
    }
    console.log("load model");
  }

  let output = null;
  console.log(tensor.shape);
  // Run the ML inference with the pre-processed image tensor
  try {
    output = await model.forward(tensor);
    output = output["image_embeds"]
  } catch (e) {
    console.log(e);
    console.log("지우는중");
    await AsyncStorage.clear();
    console.log("지우기 완료");
    
  }
  return output;
}