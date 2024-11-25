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

// 색상 배열 및 색상-숫자 매핑
const colors = ["노랑", "초록", "빨강", "보라", "파랑"];
const colorMapping = {}; // 색상-숫자 매핑 객체

// 팝업 열기
function openAuthPopup() {
    setupColorMapping(); // 색상-숫자 매핑 설정
    document.getElementById('authPopup').style.display = 'flex';
    displayRandomInstruction(); // 랜덤 문구 표시
    loadRandomImages(); // 이미지 로드
}

// 랜덤 문구 표시 함수
function displayRandomInstruction() {
    const randomIndex = Math.floor(Math.random() * instructions.length); // 랜덤 인덱스 생성
    document.getElementById('instructionText').innerText = instructions[randomIndex]; // 랜덤 문구 설정
}

// 색상-숫자 매칭 및 표시
function setupColorMapping() {
    const colorNumberDisplay = document.getElementById("colorNumberDisplay");
    colorNumberDisplay.innerHTML = ''; // 기존 데이터 초기화

    colors.forEach(color => {
        const randomValue = getRandomValue(); // 랜덤 숫자 생성
        colorMapping[color] = randomValue;

        // 화면에 색상-숫자 매칭 정보 추가
        const span = document.createElement('span');
        span.innerHTML = `
            <div class="color-circle" style="background-color: ${getColorCode(color)};"></div>
            ${color}: ${randomValue}
        `;
        colorNumberDisplay.appendChild(span);
    });
}

// 색상 이름에 따른 실제 색상 코드 반환
function getColorCode(color) {
    const colorCodes = {
        "노랑": "yellow",
        "초록": "green",
        "빨강": "red",
        "보라": "purple",
        "파랑": "blue"
    };
    return colorCodes[color];
}

// 팝업 닫기
function closeAuthPopup() {
    document.getElementById('authPopup').style.display = 'none';
}

// 곱셈 연산 수행 함수
function calculateMultiplication(instruction) {
    const key = coordinateKeys[instruction];
    const value1 = randomValues.image1[key];
    const value2 = randomValues.image2[key];
    return value1 * value2;
}

// 인증 동작
function handleSubmit() {
    const inputField = document.getElementById('inputField');
    const inputValue = parseInt(inputField.value); // 사용자가 입력한 값을 가져옴
    const instruction = document.getElementById('instructionText').innerText;

    // 곱셈 결과 계산
    const correctAnswer = calculateMultiplication(instruction);

    // 입력값과 정답 비교
    if (inputValue === correctAnswer) {
        alert("인증 성공");
        
        // 데이터 업데이트 호출
        updateImage2Counts();

        // 성공 페이지로 이동
        window.location.href = "../success/success.html";
    } else {
        alert("인증 실패");
         // 실패한 경우 데이터 업데이트 호출
         updateImage2IncorrectCounts(image2Name);
    }

    // 입력 필드를 비웁니다
    inputField.value = '';

    // 팝업 닫기
    closeAuthPopup();
}

// Firebase 데이터 업데이트 함수
function updateImage2Counts() {
    const dbRef = firebase.database().ref();
    const image2Name = document.getElementById('randomImage2').src.split('/').pop(); // image2의 이름 가져오기

    dbRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const coordinatesObject = snapshot.val();
            const image2Data = coordinatesObject.gen.find(data => data.image_id === image2Name);

            if (image2Data) {
                // z_correct_count 증가 및 z_all_count 감소
                const updatedData = {
                    z_correct_count: (image2Data.z_correct_count || 0) + 1,
                    z_all_count: Math.max(0, (image2Data.z_all_count || 0) - 1) // 값이 0 이하로 내려가지 않도록
                };

                // 데이터 업데이트
                dbRef.child(`gen/${image2Name}`).update(updatedData)
                    .then(async () => {
                        console.log("데이터 업데이트 성공");

                        // z_correct_count가 3이 되면 데이터 이동
                        if (updatedData.z_correct_count === 3) {
                            console.log(`z_correct_count가 3에 도달했습니다. 데이터를 이동합니다.`);

                            // gen 데이터 가져오기
                            const genRef = dbRef.child(`gen/${image2Name}`);
                            const defRef = dbRef.child(`def/${image2Name}`);
                            const imageData = (await genRef.once('value')).val();

                            // 데이터를 def로 이동시키기
                            await defRef.set(imageData);

                            // gen에서 데이터 삭제
                            await genRef.remove();
                            console.log(`이미지 데이터가 gen에서 def로 이동되었고, gen 데이터가 삭제되었습니다.`);
                        }
                    })
                    .catch((error) => {
                        console.error(`데이터 업데이트 실패: ${error}`);
                    });
            } else {
                console.error("해당 image_id에 대한 데이터를 찾을 수 없습니다.");
            }
        } else {
            console.error("데이터베이스에 데이터가 없습니다.");
        }
    }).catch((error) => {
        console.error(`데이터 가져오기 실패: ${error}`);
    });
}



// 인증 실패 시 Firebase 데이터 업데이트
function updateImage2IncorrectCounts(image2Name) {
    const dbRef = firebase.database().ref();

    dbRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const coordinatesObject = snapshot.val();
            const image2Data = coordinatesObject.gen.find(data => data.image_id === image2Name);

            if (image2Data) {
                // z_incorrect_count 증가, z_all_count 감소
                const updatedData = {
                    z_incorrect_count: (image2Data.z_incorrect_count || 0) + 1,
                    z_all_count: Math.max(0, (image2Data.z_all_count || 0) - 1) // 값이 0 이하로 내려가지 않도록
                };

                // 데이터 업데이트
                dbRef.child(`gen/${image2Name}`).update(updatedData)
                    .then(() => {
                        console.log("실패 데이터 업데이트 성공");
                    })
                    .catch((error) => {
                        console.error(`실패 데이터 업데이트 실패: ${error}`);
                    });
            } else {
                console.error("해당 image_id에 대한 데이터를 찾을 수 없습니다.");
            }
        } else {
            console.error("데이터베이스에 데이터가 없습니다.");
        }
    }).catch((error) => {
        console.error(`데이터 가져오기 실패: ${error}`);
    });
}


// 곱셈을 위한 좌표 위치 정의 객체
const coordinateKeys = {
    "두 이미지의 왼쪽 눈의 곱을 구하시오": "lefteye",
    "두 이미지의 오른쪽 눈의 곱을 구하시오": "righteye",
    "두 이미지의 코의 곱을 구하시오": "nose",
    "두 이미지의 왼쪽 입꼬리의 곱을 구하시오": "leftmouth",
    "두 이미지의 오른쪽 입꼬리의 곱을 구하시오": "rightmouth"
};

// 사용 가능한 랜덤 값 배열
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
    // image1 경로에서 랜덤 이미지 로드
    const folderRef1 = firebase.storage().refFromURL('gs://aifront-a7a19.appspot.com/image1');
    const imageList1 = await folderRef1.listAll();

    const randomIndex1 = Math.floor(Math.random() * imageList1.items.length);
    const randomImageRef1 = imageList1.items[randomIndex1];
    const url1 = await randomImageRef1.getDownloadURL();
    const imageName1 = randomImageRef1.name;

    const image1 = document.getElementById('randomImage1');
    image1.src = url1;

    // 이미지 크기 출력
    image1.onload = () => {
        console.log(`Image 1 Loaded: ${image1.src}`);
        console.log(`Width: ${image1.naturalWidth}, Height: ${image1.naturalHeight}`);
    };

    fetchCoordinates(imageName1, 'image1-values', 'image1');

    // image2 경로에서 랜덤 이미지 로드
    const folderRef2 = firebase.storage().refFromURL('gs://aifront-a7a19.appspot.com/image2');
    const imageList2 = await folderRef2.listAll();

    const randomIndex2 = Math.floor(Math.random() * imageList2.items.length);
    const randomImageRef2 = imageList2.items[randomIndex2];
    const url2 = await randomImageRef2.getDownloadURL();
    const imageName2 = randomImageRef2.name;

    const image2 = document.getElementById('randomImage2');
    image2.src = url2;

    // 이미지 크기 출력
    image2.onload = () => {
        console.log(`Image 2 Loaded: ${image2.src}`);
        console.log(`Width: ${image2.naturalWidth}, Height: ${image2.naturalHeight}`);
    };

    fetchCoordinates(imageName2, 'image2-values', 'image2');
}



// Realtime Database에서 특정 이미지의 좌표 데이터를 가져오는 함수
function fetchCoordinates(imageId, targetElementId, imageKey) {
    const dbRef = firebase.database().ref();

    dbRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const coordinatesObject = snapshot.val();
            let coordinatesData;

            // 데이터 소스 선택
            if (imageKey === 'image1') {
                // "def" 배열에서 해당 imageId를 가진 데이터를 찾음
                coordinatesData = coordinatesObject.def.find(data => data.image_id === imageId);
            } else if (imageKey === 'image2') {
                // "gen" 배열에서 해당 imageId를 가진 데이터를 찾음
                coordinatesData = coordinatesObject.gen.find(data => data.image_id === imageId);
            }

            if (coordinatesData) {
                displayRandomValues(coordinatesData, targetElementId, imageKey);
            } else {
                console.error(`Coordinates not found for image ID: ${imageId} in ${imageKey === 'image1' ? 'def' : 'gen'}`);
            }
        } else {
            console.error('No coordinates data found in database');
        }
    }).catch((error) => {
        console.error(`Error fetching coordinates: ${error}`);
    });
}



// 좌표 데이터를 화면에 랜덤 색상으로 표시하는 함수
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

    // 각 이미지에 대해 독립적인 색상 배열을 셔플
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    points.forEach((coord, index) => {
        const color = shuffledColors[index % shuffledColors.length];
        const value = colorMapping[color];

        // 반투명 원 추가
        const circle = document.createElement('div');
        circle.className = 'random-color-circle';
        circle.style.backgroundColor = getColorCode(color);
        circle.style.top = `${coord.y - 10}px`; // 원의 중심을 맞추기 위해 보정
        circle.style.left = `${coord.x - 10}px`;

        targetElement.appendChild(circle);

        // 랜덤 값을 저장
        randomValues[imageKey][coord.key] = value;
    });
}


// 함수들을 전역 스코프로 내보내기 (HTML 파일에서 호출하기 위해 필요)
window.openAuthPopup = openAuthPopup;
window.closeAuthPopup = closeAuthPopup;
window.handleSubmit = handleSubmit;
