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
    displayRandomValues(); // 팝업이 열릴 때 랜덤 값 표시
    displayRandomInstruction(); // 팝업 열릴 때 랜덤 문구 설정
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

function displayRandomValues() {
    const image1Values = document.getElementById('image1-values');
    const image2Values = document.getElementById('image2-values');

    const coordinates1 = [
        { x: 69, y: 112 },
        { x: 108, y: 112 },
        { x: 89, y: 136 },
        { x: 68, y: 150 },
        { x: 109, y: 152 }
    ];

    const coordinates2 = [
        { x: 68, y: 112 },
        { x: 109, y: 111 },
        { x: 90, y: 138 },
        { x: 67, y: 151 },
        { x: 109, y: 150 }
    ];

    image1Values.innerHTML = ''; 
    coordinates1.forEach(coord => {
        const value = getRandomValue();
        const span = document.createElement('span');
        span.className = 'random-value';
        span.style.top = coord.y + 'px';
        span.style.left = coord.x + 'px';
        span.textContent = value;
        image1Values.appendChild(span);
    });

    image2Values.innerHTML = '';
    coordinates2.forEach(coord => {
        const value = getRandomValue();
        const span = document.createElement('span');
        span.className = 'random-value';
        span.style.top = coord.y + 'px';
        span.style.left = coord.x + 'px';
        span.textContent = value;
        image2Values.appendChild(span);
    });
}
