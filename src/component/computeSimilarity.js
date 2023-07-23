import { torch, torchvision } from "react-native-pytorch-core";
export function computeSimilarity(output, textTensor, image) {
    let sisstartTime = performance.now();
    const result = [];

// A 리스트에 있는 각 배열과 b를 곱하여 결과를 계산
    for (let i = 0; i < output.length; i++) {
      const a = output[i];
      let ans=0;

      for (let j = 0; j < a.length; j++) {
        ans+= a[j] * textTensor[j];
      }

      result.push(ans);
    }


    let similarity = result;
    console.log("result",result);
    let sieeendTime = performance.now();


    console.log(`matmul 하는데 걸린 작업 시간은 총 ${sieeendTime - sisstartTime} 밀리초입니다.`);


    for (let i = 0; i < similarity.length; i++) {
      similarity[i] = [similarity[i], image[i]["uri"]]; // <- 두번째에는 이미지 path 넣기
    }
  
    // similarity 내림차순으로 정렬
    similarity.sort(function (a, b) {
      return a[0] < b[0];
    });
  
    for (let i = 0; i < similarity.length; i++) {
      similarity[i] = similarity[i][1]; // <- 두번째에는 이미지 path 넣기
    }
    console.log("similarity",similarity);
    return similarity;
  }