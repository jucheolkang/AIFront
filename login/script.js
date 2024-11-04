// 텍스트 문구 배열 생성
const instructions = [
    "두 이미지의 왼쪽 눈의 곱을 구하시오",
    "두 이미지의 오른쪽 눈의 곱을 구하시오",
    "두 이미지의 코의 곱을 구하시오",
    "두 이미지의 왼쪽 입꼬리의 곱을 구하시오",
    "두 이미지의 오른쪽 입꼬리의 곱을 구하시오"
];

// 팝업 열기
function openAuthPopup() {
    document.getElementById('authPopup').style.display = 'flex';
    displayRandomInstruction(); // 팝업 열릴 때 랜덤 문구 설정
    loadRandomImage(); // 랜덤 이미지 로드 후 좌표 가져오기
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

// 입력 처리
function handleSubmit() {
    const inputValue = document.getElementById('inputField').value;
    alert(`입력한 값: ${inputValue}`);
    closeAuthPopup(); // 팝업 닫기
}

// 1에서 9 사이의 랜덤 값을 반환하는 함수
function getRandomValue() {
    return Math.floor(Math.random() * 9) + 1;
}

// 랜덤 이미지 로드 함수
async function loadRandomImage() {
    const folderRef = firebase.storage().refFromURL('gs://aifront-a7a19.appspot.com');  // 'images' 폴더에 대한 전체 경로 참조
    const imageList = await folderRef.listAll();
    const randomIndex = Math.floor(Math.random() * imageList.items.length);
    const randomImageRef = imageList.items[randomIndex];
    const url = await randomImageRef.getDownloadURL();
    const imageName = randomImageRef.name;  // 예: "000001.jpg"

    document.getElementById('randomImage').src = url;  // 이미지 태그의 src에 URL 할당

    // 선택된 이미지의 ID에 맞는 좌표 데이터 가져오기
    fetchCoordinates(imageName);
}

// Realtime Database에서 좌표 데이터를 불러오는 함수
function fetchCoordinates(imageId) {
    const dbRef = firebase.database().ref();
    
    dbRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            // 전체 좌표 데이터(JSON 객체)를 가져온 후 특정 image_id를 검색
            const coordinatesObject = snapshot.val();
            const coordinatesData = Object.values(coordinatesObject).find(data => data.image_id === imageId);
            
            if (coordinatesData) {
                displayRandomValues(coordinatesData);  // 좌표 데이터 표시
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
function displayRandomValues(coordinatesData) {
    const image1Values = document.getElementById('image1-values');

    // 기존 요소 초기화
    image1Values.innerHTML = '';

    // 좌표 데이터에 따라 위치에 랜덤 값 표시
    const points = [
        { x: coordinatesData.lefteye_x, y: coordinatesData.lefteye_y },
        { x: coordinatesData.righteye_x, y: coordinatesData.righteye_y },
        { x: coordinatesData.nose_x, y: coordinatesData.nose_y },
        { x: coordinatesData.leftmouth_x, y: coordinatesData.leftmouth_y },
        { x: coordinatesData.rightmouth_x, y: coordinatesData.rightmouth_y }
    ];

    points.forEach(coord => {
        const value = getRandomValue();
        const span = document.createElement('span');
        span.className = 'random-value';
        span.style.position = 'absolute';  // 위치를 절대 위치로 지정
        span.style.top = `${coord.y}px`;
        span.style.left = `${coord.x}px`;
        span.textContent = value;
        image1Values.appendChild(span);
    });
}

// 함수들을 전역 스코프로 내보내기 (HTML 파일에서 호출하기 위해 필요)
window.openAuthPopup = openAuthPopup;
window.closeAuthPopup = closeAuthPopup;
window.handleSubmit = handleSubmit;
