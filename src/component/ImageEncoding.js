// 1. Add import for MobileModel from PlayTorch SDK
import { MobileModel, torch, torchvision, media } from "react-native-pytorch-core";
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

// The classifyImage function that will process an image and return the top
// class label
export default async function encodeImage(image, text) {
  // Get image width and height

  // let textTensor = null;
  // const response = await axios.get(`http://101.101.219.90:30003/tokenize/${text}`);
  // textTensor = torch.tensor(response.data);

  let allTensor = [];
  for (let i = 0; i < image.length; i++) {
    console.log(image[i]);
    const width = image[i].getWidth();
    const height = image[i].getHeight();
    // Convert image to blob, which is a byte representation of the image
    // in the format height (H), width (W), and channels (C), or HWC for short
    const blob = media.toBlob(image[i]);
    // Get a tensor from image the blob and also define in what format
    // the image blob is.
    let tensor = torch.fromBlob(blob, [height, width, 3]);
    console.log(tensor.shape);
    // Rearrange the tensor shape to be [CHW]
    tensor = tensor.permute([2, 0, 1]);
    // Divide the tensor values by 255 to get values between [0, 1]
    tensor = tensor.div(255);
    // Crop the image in the center to be a squared image
    const centerCrop = T.centerCrop(Math.min(width, height));
    console.log(centerCrop);
    tensor = centerCrop(tensor);
    // Resize the image tensor to 3 x 224 x 224
    const resize = T.resize(224);
    tensor = resize(tensor);
    // Normalize the tensor image with mean and standard deviation
    const normalize = T.normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]);
    tensor = normalize(tensor);
    // Unsqueeze adds 1 leading dimension to the tensor
    tensor = tensor.unsqueeze(0);
    allTensor.push(tensor);
  }

  return 0;
}
