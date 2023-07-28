import { torch, torchvision, media } from "react-native-pytorch-core";
const T = torchvision.transforms;


export function preprocess(image, size = 224) {
  
  const width = image.getWidth();
  const height = image.getHeight();
  const blob = media.toBlob(image);
  let tensor = torch.fromBlob(blob, [height, width, 3]);
  tensor = tensor.permute([2, 0, 1]);
  tensor = tensor.div(255);
  const centerCrop = T.centerCrop(Math.min(width, height));
  tensor = centerCrop(tensor);
  const resize = T.resize(224);
  tensor = resize(tensor);
  const normalize = T.normalize(
    [0.485, 0.456, 0.406],
    [0.229, 0.224, 0.225]
  );
  tensor = normalize(tensor);
  tensor = tensor.unsqueeze(0);
  

  return tensor;
}