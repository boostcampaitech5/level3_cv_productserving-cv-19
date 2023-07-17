// 1. Add import for MobileModel from PlayTorch SDK
import {
  MobileModel,
  torch,
  torchvision,
  media,
} from "react-native-pytorch-core";
// import { SimpleTokenizer } from "./SimpleTokenizer.js";
// import * as RNFS from "react-native-fs";
import * as FileSystem from "expo-file-system";
//import Models from "assets";
// import ImageEncoder from "../assets/models/final_visual.ptl";
// 2. Import the ImageNetClasses JSON file, which is used below to map the
// processed model result to a class label
import axios from "axios";

// Alias for torchvision transforms
const T = torchvision.transforms;

// 3. URL to the image classification model that is used in this example
const MODEL_URL = "http://101.101.219.90:30003/final_visual.ptl";
// const MODEL_URL =
//   "https://github.com/facebookresearch/playtorch/releases/download/v0.1.0/mobilenet_v3_small.ptl";
//const MODEL_URL = RNFS.DocumentDirectoryPath + "/final_visual.ptl";
// 4. Variable to hold a reference to the loaded ML model
let model = null;

const texts = [
  "A photo of a animal",
  "A photo of a food",
  "A photo of a human",
  "A photo of a indoor",
  "A photo of a outdoor",
];

function compareEmbeddings(logitScale, imgEmbs, txtEembs) {
  const imageFeatures = torch.div(imgEmbs, torch.norm(imgEmbs, -1, true));
  const textFeatures = torch.div(txtEembs, torch.norm(txtEembs, -1, true));
  const logitsPerImage = torch.mul(
    logitScale,
    torch.mm(imageFeatures, textFeatures.transposee(0, 1))
  );
  const logitsPerText = torch.mul(
    logitScale,
    torch.mm(textFeatures, imageFeatures.transposee(0, 1))
  );

  return [logitsPerImage, logitsPerText];
}

function preprocess(image, size = 224) {
  const resize = T.resize(size);
  const centerCrop = T.centerCrop(size);
  const normalize = T.normalize(
    [0.48145466, 0.4578275, 0.40821073],
    [0.26862954, 0.26130258, 0.27577711]
  );
  image = resize(image);
  image = centerCrop(image);
  image = normalize(image);
  return image;
}
/*
const _tokenizer = new SimpleTokenizer();

function tokenize(texts, contextLength = 77, truncate = false) {
  const sotToken = _tokenizer.encoder["<|startoftext|>"];
  const eotToken = _tokenizer.encoder["<|endoftext|>"];
  const allToken = texts.map((text) => [
    sotToken,
    ..._tokenizer.encode(text),
    eotToken,
  ]);

  const result = torch.zeros(allTokens.length, contextLength, torch.int);

  for (let i = 0; i < allTokens.length; i++) {
    const tokens = allTokens[i];

    if (tokens.length > contextLength) {
      if (truncate) {
        tokens.splice(
          contextLength - 1,
          tokens.length - contextLength,
          eotToken
        );
      } else {
        throw new Error(
          `Input ${texts[i]} is too long for context length ${contextLength}`
        );
      }
    }

    result[i].narrow(0, 0, tokens.length).copy_(torch.tensor(tokens));
  }

  return result;
}
*/

// The classifyImage function that will process an image and return the top
// class label
export default async function encodeImage(image) {
  // Get image width and height
  const width = image.getWidth();
  const height = image.getHeight();
  let textTensor = null;
  // axios.get("http://101.101.219.90:30003/tokenize/hello").then((response) => {
  //   // response.data => [1,512]
  //   console.log(response.data[0][0]);
  //   console.log(typeof response.data[0][0]);
  //   text_tensor = torch.tensor(response.data);
  //   console.log(text_tensor.shape);
  // });
  const response = await axios.get(
    "http://101.101.219.90:30003/tokenize/hello"
  );
  // response.data => [1,512]
  console.log(response.data[0][0]);
  console.log(typeof response.data[0][0]);
  textTensor = torch.tensor(response.data);
  console.log(textTensor.shape);
  // Convert image to blob, which is a byte representation of the image
  // in the format height (H), width (W), and channels (C), or HWC for short
  const blob = media.toBlob(image);

  // Get a tensor from image the blob and also define in what format
  // the image blob is.
  let tensor = torch.fromBlob(blob, [height, width, 3]);

  // Rearrange the tensor shape to be [CHW]
  tensor = tensor.permute([2, 0, 1]);

  // Divide the tensor values by 255 to get values between [0, 1]
  tensor = tensor.div(255);

  // Crop the image in the center to be a squared image
  const centerCrop = T.centerCrop(Math.min(width, height));
  tensor = centerCrop(tensor);

  // Resize the image tensor to 3 x 224 x 224
  const resize = T.resize(224);
  tensor = resize(tensor);

  // Normalize the tensor image with mean and standard deviation
  const normalize = T.normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]);
  tensor = normalize(tensor);
  // Unsqueeze adds 1 leading dimension to the tensor
  tensor = tensor.unsqueeze(0);
  console.log(tensor.shape);
  tensor = torch.cat([torch.zeros([1, 3, 224, 224]), tensor]);
  console.log(tensor.shape);
  // 5. If the model has not been loaded already, it will be downloaded from
  // the URL and then loaded into memory.
  if (model == null) {
    console.log(MODEL_URL);
    let filePath = null;
    const model_exist = await FileSystem.getInfoAsync(
      "/data/user/0/com.anonymous.gallery/cache/final_visual.ptl"
    );

    if (model_exist) {
      console.log("model exists");
      filePath =
        "/data/user/0/com.anonymous.gallery/cache/final_visual.ptl";
    } else {
    try {
      filePath = await MobileModel.download(MODEL_URL);
    } catch (err) {
      console.log(err);
    }
    // }
    console.log(filePath);
    try {
      model = await torch.jit._loadForMobile(filePath);
      console.log("model load");
    } catch (err) {
      console.log(err);
    }
    console.log("load model");
    // console.log(model);
  }
  let output = null;
  console.log(tensor.shape);
  // 6. Run the ML inference with the pre-processed image tensor
  try {
    console.log("try");
    output = await model.forward(tensor);
  } catch (e) {
    console.log(e);
  }
  console.log(output.shape);
  console.log(textTensor.shape);
  // let similarity = output.matmul(textTensor).item();
  console.log(Array.from(output.matmul(textTensor).data())); // 1차원 배열
  let similarity = Array.from(output.matmul(textTensor).data());
  for (let i = 0; i < similarity.length; i++) {
    similarity[i] = [similarity[i], i]; // <- 두번째에는 이미지 path 넣기
  }

  // similarity 내림차순으로 정렬
  similarity.sort(function (a, b) {
    return a[0] < b[0];
  });

  console.log(similarity);
  console.log(output.matmul(textTensor).shape);

  // 7. Get the index of the value with the highest probability
  // 8. Resolve the most likely class label and return it
  return None;
}
