// 텍스트 문구 배열 생성
const instructions = [
    "두 이미지의 왼쪽 눈의 곱을 구하시오",
    "두 이미지의 오른쪽 눈의 곱을 구하시오",
    "두 이미지의 코의 곱을 구하시오",
    "두 이미지의 왼쪽 입꼬리의 곱을 구하시오",
    "두 이미지의 오른쪽 입꼬리의 곱을 구하시오"
];

// 좌표의 랜덤 값 저장 객체
let randomValues = {
    image1: {},
    image2: {}
};

// 팝업 열기
function openAuthPopup() {
    document.getElementById('authPopup').style.display = 'flex';
    displayRandomInstruction(); // 팝업 열릴 때 랜덤 문구 설정
    loadRandomImages(); // 두 개의 랜덤 이미지 로드 후 각 이미지 좌표 가져오기
}

// 랜덤 문구 표시 함수
function displayRandomInstruction() {
    const randomIndex = Math.floor(Math.random() * instructions.length); // 랜덤 인덱스 생성
    document.getElementById('instructionText').innerText = instructions[randomIndex]; // 랜덤 문구 설정
}

// 팝업 닫기
function closeAuthPopup() {
    document.getElementById('authPopup').style.display = 'none';
}

function handleSubmit() {
    const inputField = document.getElementById('inputField');
    const inputValue = parseInt(inputField.value); // 사용자가 입력한 값을 가져옴
    const instruction = document.getElementById('instructionText').innerText;

    // 곱셈 결과 계산
    const correctAnswer = calculateMultiplication(instruction);

    // 입력값과 정답 비교
    if (inputValue === correctAnswer) {
        alert("인증 성공");
        window.location.href = "../success/success.html";
    } else {
        alert("인증 실패");
    }

    // 입력 필드를 비웁니다
    inputField.value = '';

    // 팝업 닫기
    closeAuthPopup();
}


// 곱셈을 위한 좌표 위치 정의 객체
const coordinateKeys = {
    "두 이미지의 왼쪽 눈의 곱을 구하시오": "lefteye",
    "두 이미지의 오른쪽 눈의 곱을 구하시오": "righteye",
    "두 이미지의 코의 곱을 구하시오": "nose",
    "두 이미지의 왼쪽 입꼬리의 곱을 구하시오": "leftmouth",
    "두 이미지의 오른쪽 입꼬리의 곱을 구하시오": "rightmouth"
};

// 곱셈 연산 수행 함수
function calculateMultiplication(instruction) {
    const key = coordinateKeys[instruction];
    const value1 = randomValues.image1[key];
    const value2 = randomValues.image2[key];
    return value1 * value2;
}

// 사용 가능한 랜덤 값 배열 (1, 2, 3, 4, 5, 6, 7, 8, 9, 11)
const availableValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];
let usedRandomValues = [];

// 중복되지 않는 랜덤 값을 반환하는 함수
function getRandomValue() {
    if (usedRandomValues.length >= availableValues.length) {
        usedRandomValues = [];
    }

    let value;
    do {
        const randomIndex = Math.floor(Math.random() * availableValues.length);
        value = availableValues[randomIndex];
    } while (usedRandomValues.includes(value));

    usedRandomValues.push(value);
    return value;
}

// 두 개의 랜덤 이미지 로드 함수
async function loadRandomImages() {
    const folderRef = firebase.storage().refFromURL('gs://aifront-a7a19.appspot.com');
    const imageList = await folderRef.listAll();
    
    const randomIndices = [];
    while (randomIndices.length < 2) {
        const randomIndex = Math.floor(Math.random() * imageList.items.length);
        if (!randomIndices.includes(randomIndex)) {
            randomIndices.push(randomIndex);
        }
    }

    const randomImageRef1 = imageList.items[randomIndices[0]];
    const url1 = await randomImageRef1.getDownloadURL();
    const imageName1 = randomImageRef1.name;
    document.getElementById('randomImage1').src = url1;
    fetchCoordinates(imageName1, 'image1-values', 'image1');

    const randomImageRef2 = imageList.items[randomIndices[1]];
    const url2 = await randomImageRef2.getDownloadURL();
    const imageName2 = randomImageRef2.name;
    document.getElementById('randomImage2').src = url2;
    fetchCoordinates(imageName2, 'image2-values', 'image2');
}

// Realtime Database에서 특정 이미지의 좌표 데이터를 가져오는 함수
function fetchCoordinates(imageId, targetElementId, imageKey) {
    const dbRef = firebase.database().ref();
    
    dbRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const coordinatesObject = snapshot.val();
            const coordinatesData = Object.values(coordinatesObject).find(data => data.image_id === imageId);
            
            if (coordinatesData) {
                displayRandomValues(coordinatesData, targetElementId, imageKey);
            } else {
                console.error(`Coordinates not found for image ID: ${imageId}`);
            }
        } else {
            console.error('No coordinates data found in database');
        }
    }).catch((error) => {
        console.error(`Error fetching coordinates: ${error}`);
    });
}

// 좌표 데이터를 받아 화면에 랜덤 값을 표시하는 함수
function displayRandomValues(coordinatesData, targetElementId, imageKey) {
    const targetElement = document.getElementById(targetElementId);
    targetElement.innerHTML = '';

    const points = [
        { key: "lefteye", x: coordinatesData.lefteye_x, y: coordinatesData.lefteye_y },
        { key: "righteye", x: coordinatesData.righteye_x, y: coordinatesData.righteye_y },
        { key: "nose", x: coordinatesData.nose_x, y: coordinatesData.nose_y },
        { key: "leftmouth", x: coordinatesData.leftmouth_x, y: coordinatesData.leftmouth_y },
        { key: "rightmouth", x: coordinatesData.rightmouth_x, y: coordinatesData.rightmouth_y }
    ];

    points.forEach(coord => {
        const value = getRandomValue();
        const span = document.createElement('span');
        span.className = 'random-value';
        span.style.position = 'absolute';
        span.style.top = `${coord.y}px`;
        span.style.left = `${coord.x}px`;
        span.textContent = value;
        targetElement.appendChild(span);

        // 랜덤 값을 저장
        randomValues[imageKey][coord.key] = value;
    });
}

// 함수들을 전역 스코프로 내보내기 (HTML 파일에서 호출하기 위해 필요)
window.openAuthPopup = openAuthPopup;
window.closeAuthPopup = closeAuthPopup;
window.handleSubmit = handleSubmit;
