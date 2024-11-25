// 팝업 열기
function openAuthPopup() {
    setupColorMapping(); // 색상-숫자 매핑 설정
    document.getElementById('authPopup').style.display = 'flex';
    displayRandomInstruction(); // 랜덤 문구 표시
    loadRandomImages(); // 이미지 로드
}

// 팝업 닫기
function closeAuthPopup() {
    document.getElementById('authPopup').style.display = 'none';
}

// 성공시 이미지, 좌표 이동
async function moveImageAndCoordinates() {
    const storageRef = firebase.storage();
    const dbRef = firebase.database().ref();
    console.log("moveImageAndCoordinates 동작");

    try {
        const image1FolderPath = 'gs://aifront-a7a19.appspot.com/image1';
        const image2FolderPath = 'gs://aifront-a7a19.appspot.com/image2';

        // 이미지 이동 준비
        console.log("1. 이미지 이동 준비");
        const sourceRef = storageRef.refFromURL(`${image2FolderPath}/${imageName2}`);
        const destinationRef = storageRef.refFromURL(`${image1FolderPath}/${imageName2}`);
        console.log(`imageName2: ${imageName2}`);

        // 다운로드 URL 생성
        console.log("2. 다운로드 URL 요청");
        const downloadURL = await sourceRef.getDownloadURL();
        console.log(`3. 다운로드 URL: ${downloadURL}`);

        // 다운로드 후 업로드
        console.log("4. fetch 시작");
        const response = await fetch(downloadURL);
        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }
        console.log("5. fetch 완료");

        console.log("6. blob 변환 시작");
        const blob = await response.blob();
        console.log("7. blob 변환 완료");

        // 업로드 및 원본 삭제
        await destinationRef.put(blob).then(async () => {
            await sourceRef.delete(); // 업로드 성공 후 삭제
            console.log(`이미지 ${imageName2}가 image2에서 image1으로 이동되었습니다.`);
        });

        // 데이터베이스 좌표 이동
        console.log("8. 좌표 데이터 이동 시작");
        const snapshot = await dbRef.once('value'); // 전체 데이터 가져오기
        const coordinatesObject = snapshot.val(); // 데이터 변환

        if (coordinatesObject && coordinatesObject.gen) {
            // `gen`에서 `image_id`가 `imageName2`인 데이터 찾기
            const coordinatesData = coordinatesObject.gen.find(data => data.image_id === imageName2);

            if (coordinatesData) {
                const defArray = coordinatesObject.def || []; // `def` 배열이 없으면 빈 배열로 초기화
                const updatedGen = coordinatesObject.gen.filter(data => data.image_id !== imageName2);

                // 데이터베이스 업데이트
                await dbRef.update({
                    def: [...defArray, coordinatesData],
                    gen: updatedGen
                });

                console.log(`좌표 데이터가 gen에서 def로 이동되었습니다.`);
            } else {
                console.log(`좌표 데이터가 gen에서 찾을 수 없습니다.`);
            }
        } else {
            console.log(`Firebase 데이터베이스에 gen 데이터가 없습니다.`);
        }
    } catch (error) {
        console.error(`오류 발생: ${error.message}`);
    }

    console.log("moveImageAndCoordinates 동작 종료");
}





// 인증 성공 후 추가
function handleSubmit() {
    const inputField = document.getElementById('inputField');
    const inputValue = parseInt(inputField.value);
    const instruction = document.getElementById('instructionText').innerText;

    const correctAnswer = calculateMultiplication(instruction);

    if (inputValue === correctAnswer) {
        alert("인증 성공");
        
        // 이미지 및 좌표 이동 실행
        moveImageAndCoordinates();

        // 인증 성공 후 페이지 이동
        window.location.href = "../success/success.html";
    } else {
        alert("인증 실패");
        
        // 인증 실패 시 image2의 이미지 삭제
        deleteFailedImage();
    }

    inputField.value = '';
    closeAuthPopup();
}

// 인증 실패 시 image2에서 이미지 삭제
async function deleteFailedImage() {
    const storageRef = firebase.storage();
    const image2FolderPath = 'gs://aifront-a7a19.appspot.com/image2';

    try {
        const sourceRef = storageRef.refFromURL(`${image2FolderPath}/${imageName2}`);
        await sourceRef.delete();
        console.log(`이미지 ${imageName2}가 인증 실패로 인해 삭제되었습니다.`);
    } catch (error) {
        console.error(`이미지 삭제 중 오류 발생: ${error.message}`);
    }
}


window.openAuthPopup = openAuthPopup;
window.closeAuthPopup = closeAuthPopup;
window.handleSubmit = handleSubmit;
