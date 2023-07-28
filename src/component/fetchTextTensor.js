import axios from "axios";
import {torch} from "react-native-pytorch-core";

export async function fetchTextTensor(text) {
    let startTime = performance.now();
    const response = await axios.get(`http://101.101.219.90:30003/tokenize/${text}`);
    // response.data => [1, 512]
    const textTensor = torch.tensor(response.data);
    let endTime = performance.now(); 
    console.log(`텍스트 전처리하는데 걸린 작업 시간: ${endTime - startTime} 밀리초.`);
    return textTensor;
  }