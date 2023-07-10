// 1. PlayTorch SDK에서 MobileModel, torch, torchvision, media를 가져옵니다.
import {
    MobileModel,
    torch,
    torchvision,
    media,
} from "react-native-pytorch-core";
// 2. ImageNetClasses JSON 파일을 가져옵니다. 이 파일은 아래에서 처리된 모델 결과를 클래스 레이블에 매핑하는 데 사용됩니다.
import * as ImageNetClasses from "./imageNetClasses.json";

// torchvision 변환 함수를 위한 별칭 설정
const T = torchvision.transforms;

// 이 예제에서 사용되는 이미지 분류 모델의 URL
const MODEL_URL =
    "https://github.com/facebookresearch/playtorch/releases/download/v0.1.0/mobilenet_v3_small.ptl";

// 로드된 ML 모델을 저장하기 위한 변수
let model = null;

// 이미지를 처리하고 가장 확률이 높은 클래스 레이블을 반환하는 classifyImage 함수
export default async function classifyImage(image) {
    // 이미지의 너비와 높이 가져오기
    const width = image.getWidth();
    const height = image.getHeight();

    // 이미지를 바이트 형식인 blob으로 변환하기. blob은 높이(H), 너비(W), 채널(C) 또는 HWC 형식으로 표현됨
    const blob = media.toBlob(image);

    // 이미지 blob에서 텐서 가져오기 및 이미지 blob의 형식 지정하기
    let tensor = torch.fromBlob(blob, [height, width, 3]);

    // 텐서의 모양을 [CHW]로 재배열하기
    tensor = tensor.permute([2, 0, 1]);

    // 텐서의 값들을 255로 나눠 [0, 1] 범위로 정규화하기
    tensor = tensor.div(255);

    // 이미지를 가운데에서 자르는 방식으로 정사각형 이미지로 크롭하기
    const centerCrop = T.centerCrop(Math.min(width, height));
    tensor = centerCrop(tensor);

    // 이미지 텐서의 크기를 3 x 224 x 224로 리사이징하기
    const resize = T.resize(224);
    tensor = resize(tensor);

    // 텐서 이미지를 평균과 표준편차로 정규화하기
    const normalize = T.normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]);
    tensor = normalize(tensor);
    console.log(tensor.shape);
    // console.log("여기 imageClassifier.js 55 찍고감");
    // 텐서에 1개의 차원을 추가하기
    tensor = tensor.unsqueeze(0);

    // 5. 모델이 이미 로드되지 않았으면 URL에서 모델을 다운로드하고 메모리에 로드합니다.
    if (model == null) {
        const filePath = await MobileModel.download(MODEL_URL);
        model = await torch.jit._loadForMobile(filePath);
    }

    // 전처리된 이미지 텐서를 사용하여 ML 추론 실행하기
    const output = await model.forward(tensor);
    const outputData = output.data()

    // 데이터를 일반 JavaScript 배열로 변환하기
    // const outputArray = Array.from(outputData);

    // 출력 배열 출력하기
    // console.log("len(outputData)", outputData.length);
    // console.log("outputData", outputData);

    // 가장 높은 확률을 가진 값의 인덱스 가져오기
    const maxIdx = output.argmax().item();
    console.log(maxIdx);

    // Resolve the most likely class label and return it
    const result = ImageNetClasses[maxIdx];

    // Set result as top class label state
    setTopClass(result);

    // Release the image from memory
    image.release();

    // 가장 가능성이 높은 클래스 레이블 반환하기
    // return ImageNetClasses[maxIdx];
    return result;
}