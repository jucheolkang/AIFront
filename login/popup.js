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




// 인증 성공 시 이미지 이동
async function handleImageMoveOnSuccess() {
    const sourceFolder = 'image2';
    const destinationFolder = 'image1';

    try {
        console.log("이미지 이동 중:", imageName2);
        await moveImageToFolder(imageName2, sourceFolder, destinationFolder);
        console.log("이미지 이동 완료!");
    } catch (error) {
        console.error("이미지 이동 실패:", error);
    }
}


// 인증 성공 후 추가
function handleSubmit() {
    const inputField = document.getElementById('inputField');
    const inputValue = parseInt(inputField.value);
    const instruction = document.getElementById('instructionText').innerText;

    const correctAnswer = calculateMultiplication(instruction);

    if (inputValue === correctAnswer) {
        alert("인증 성공");
        handleImageMoveOnSuccess();

        // 인증 성공 후 페이지 이동
        window.location.href = "../success/success.html";
    } else {
        alert("인증 실패");
        
        // 인증 실패 시 image2의 이미지 삭제
        deleteFailedImageAndUpdateJSON();
    }

    inputField.value = '';
    
    // REST API GET 요청
    fetch('http://localhost:8080/hello')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            //return response.json(); // 응답을 JSON으로 변환
            return response.text();// API가 문자열을 반환하므로 응답을 텍스트로 처리
        })
        .then(data => {
            console.log('API 응답:', data);
        })
        .catch(error => {
            console.error('API 요청 중 오류 발생:', error);
        });

    closeAuthPopup();
}

// JSON 데이터를 기반으로 이미지 삭제 및 수정
async function deleteFailedImageAndUpdateJSON() {
    const storageRef = firebase.storage();
    const databaseRef = firebase.database().ref(); // 올바른 참조 생성
    const folderPath = 'gs://aifront-a7a19.appspot.com/image2';

    try {
        // 1. JSON 데이터 읽기
        const jsonSnapshot = await databaseRef.once('value'); // once() 메서드 호출
        const jsonData = jsonSnapshot.val();

        if (!jsonData || !jsonData.gen) {
            console.error('JSON 데이터(gen)를 찾을 수 없습니다.');
            return;
        }

        // 2. gen 항목에서 이미지 ID에 맞는 데이터 찾기
        const filteredList = jsonData.gen.filter(item => item !== null);
        const matchingData = filteredList.find(item => item.image_id === imageName2);

        if (!matchingData) {
            console.error(`이미지 ${imageName2}에 해당하는 JSON 데이터를 찾을 수 없습니다.`);
            return;
        }

        // 3. z_incorrect_count 증가 및 확인
        
        if (matchingData.z_incorrect_count >= matchingData.z_all_count) {
            // 조건 만족 시 이미지 삭제
            const imageRef = storageRef.refFromURL(`${folderPath}/${imageName2}`);
            await imageRef.delete();
            console.log(`이미지 ${imageName2}가 삭제되었습니다.`);

            // JSON 데이터에서 항목 삭제
            const updatedList = filteredList.filter(item => item.image_id !== imageName2);
            jsonData.gen = updatedList;

            await databaseRef.set(jsonData);
            console.log(`JSON 데이터에서 ${imageName2} 항목이 삭제되었습니다.`);
        } else {
            // 조건 미충족 시 JSON 데이터 업데이트
            matchingData.z_incorrect_count += 1;
            await databaseRef.set(jsonData);
            console.log(`JSON 데이터 업데이트 완료: ${JSON.stringify(jsonData)}`);
        }
    } catch (error) {
        console.error(`작업 중 오류 발생: ${error.message}`);
    }
}




window.openAuthPopup = openAuthPopup;
window.closeAuthPopup = closeAuthPopup;
window.handleSubmit = handleSubmit;
