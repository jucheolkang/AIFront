// 랜덤 이미지 불러오기
async function loadRandomImages() {
    const storageRef = firebase.storage().ref();

    const folderRef1 = storageRef.child('image1');
    const imageList1 = await folderRef1.listAll();
    const randomIndex1 = Math.floor(Math.random() * imageList1.items.length);
    const randomImageRef1 = imageList1.items[randomIndex1];
    const url1 = await randomImageRef1.getDownloadURL();
    imageName1 = randomImageRef1.name;

    document.getElementById('randomImage1').src = url1;
    fetchCoordinates(imageName1, 'image1-values', 'image1');

    const folderRef2 = storageRef.child('image2');
    const imageList2 = await folderRef2.listAll();
    const randomIndex2 = Math.floor(Math.random() * imageList2.items.length);
    const randomImageRef2 = imageList2.items[randomIndex2];
    const url2 = await randomImageRef2.getDownloadURL();
    imageName2 = randomImageRef2.name;

    document.getElementById('randomImage2').src = url2;
    fetchCoordinates(imageName2, 'image2-values', 'image2');
}

// 좌표 불러오기
function fetchCoordinates(imageId, targetElementId, imageKey) {
    const dbRef = firebase.database().ref();

    dbRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const coordinatesObject = snapshot.val();
            let coordinatesData;

            if (imageKey === 'image1') {
                coordinatesData = coordinatesObject.def.find(data => data.image_id === imageId);
            } else if (imageKey === 'image2') {
                coordinatesData = coordinatesObject.gen.find(data => data.image_id === imageId);
            }

            if (coordinatesData) {
                displayRandomValues(coordinatesData, targetElementId, imageKey);
            }
        }
    }).catch((error) => {
        console.error(`Error fetching coordinates: ${error}`);
    });
}

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

    // 이미지 박스와 원본 이미지의 크기 비율 계산
    const imageBox = targetElement.closest('.image-box');
    const imageElement = imageBox.querySelector('img');
    const originalWidth = 128; // 원본 이미지 너비
    const originalHeight = 128; // 원본 이미지 높이
    const currentWidth = imageElement.offsetWidth;
    const currentHeight = imageElement.offsetHeight;

    const widthRatio = currentWidth / originalWidth;
    const heightRatio = currentHeight / originalHeight;

    const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
    points.forEach((coord, index) => {
        const color = shuffledColors[index % shuffledColors.length];
        const value = colorMapping[color];

        const circle = document.createElement('div');
        circle.className = 'random-color-circle';
        circle.style.backgroundColor = getColorCode(color);

        // 좌표 변환
        const adjustedX = coord.x * widthRatio;
        const adjustedY = coord.y * heightRatio;

        circle.style.top = `${adjustedY - 10}px`; // 원 크기의 절반을 빼서 중앙에 위치
        circle.style.left = `${adjustedX - 10}px`;

        targetElement.appendChild(circle);

        randomValues[imageKey][coord.key] = value;
    });
}
