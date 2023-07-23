import { torch, MobileModel } from "react-native-pytorch-core";
import * as FileSystem from "expo-file-system";

const MODEL_URL = "http://101.101.219.90:30003/final_visual.ptl";

let model = null;

export async function loadModelAndForward(tensor) {
  if (model == null) {
    console.log(MODEL_URL);
    let filePath = null;
    const model_exist = await FileSystem.getInfoAsync(
      "/data/user/0/com.anonymous.gallery/cache/final_visual.ptl"
    );

    if (model_exist) {
      console.log("model exists");
      filePath = "/data/user/0/com.anonymous.gallery/cache/final_visual.ptl";
    } else {
      try {
        filePath = await MobileModel.download(MODEL_URL);
      } catch (err) {
        console.log(err);
      }
    }
    console.log(filePath);
    try {
      let ssstartTime = performance.now();
      model = await torch.jit._loadForMobile(filePath);
      console.log("model load");
      let eeendTime = performance.now();
      console.log(`모델 로드 하는데 걸린 작업 시간은 총 ${eeendTime - ssstartTime} 밀리초입니다.`);
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
  } catch (e) {
    console.log(e);
  }
  return output;
}