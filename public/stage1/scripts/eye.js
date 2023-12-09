let currentEyeX = 0;
let currentEyeY = 0;
let targetEyeX = 0;
let targetEyeY = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('video');
    const eye = document.getElementById('eye');
    const model = await handTrack.load();
    handTrack.startVideo(video).then(status => {
        if (status) {
            navigator.getUserMedia({ video: {} }, stream => {
                video.srcObject = stream;
                setInterval(() => {
                    runDetection();
                }, 100);
            }, err => console.log(err));
        }
    });

    function getRandomAudioFilePath() {
        const randomNumber = Math.floor(Math.random() * 5) + 1;
        return `./stage1/assets/greeting_${randomNumber}.wav`;
    }
    let shephardAudio = new Audio('/stage1/assets/shephard.mp3');
    let audio = new Audio();
    audio.addEventListener('ended', function() {
        console.log('Audio ended, triggering button click');
        document.getElementById('fetchDescriptions').click(); // Click the button
        isAudioPlayed = true; // Setting flag to prevent replaying the audio
    });
    document.getElementById('fetchDescriptions').addEventListener('click', function() {
        console.log('Button clicked, playing shephard.mp3 and changing state to idle');
        shephardAudio.play(); // Play shephard.mp3
        toggleState(false); // Change state to idle
    });
    let faceDetectionDuration = 0;
    const faceDetectionThreshold = 10000; // 10,000 = 10s
    let isAudioPlaying = false;
    let isAudioPlayed = false; // Flag to check if audio has already been played
    let isFaceDetected = false;
    let faceDetectionTimeout;
    const detectionDelay = 2000; // 2,000 = 2s (Time in milliseconds to wait before hiding the eye)

    function runDetection() {
        model.detect(video).then(predictions => {
            if (predictions.length > 0) {
                // Face detected
                let face = predictions[0];
                moveEye(face);
                faceDetectionDuration += 100;
    
                if (!isFaceDetected) {
                    isFaceDetected = true;
                    showEyeContainer();
                }
    
                if (faceDetectionDuration >= faceDetectionThreshold && !isAudioPlaying && !isAudioPlayed) {
                    // Set a random audio file and play it
                    audio.src = getRandomAudioFilePath();
                    audio.play();
                    toggleState(true); // Set to talking state
                    isAudioPlaying = true;
                }
    
                // Reset the timeout every time a face is detected
                clearTimeout(faceDetectionTimeout);
            } else {
                // No face detected
                if (isAudioPlaying) {
                    // Stop audio and reset talking state
                    audio.pause();
                    audio.currentTime = 0;
                    toggleState(false); // Set to idle state
                    isAudioPlaying = false;
                }
                faceDetectionDuration = 0; // Reset face detection duration
                isAudioPlayed = false; // Reset the audio played flag
                clearTimeout(faceDetectionTimeout);
                faceDetectionTimeout = setTimeout(hideEyeContainer, detectionDelay);
            }
        });
    }
    function showEyeContainer() {
        const eyeContainer = document.querySelector('.ball-container');
        eyeContainer.style.opacity = '1';
        eyeContainer.style.transform = 'scale(1)';
        eyeContainer.style.animation = 'zoomIn 3.5s';
    }

    function hideEyeContainer() {
        const eyeContainer = document.querySelector('.eye-container');
        eyeContainer.style.opacity = '0';
        eyeContainer.style.transform = 'scale(0)';
        eyeContainer.style.animation = 'zoomOut 3.5s';
    }


    // Global variables to hold the current and target positions
    let currentEyeX = 0;
    let currentEyeY = 0;
    let targetEyeX = 0;
    let targetEyeY = 0;

    function moveEye(face) {
        const scaleFactor = 3.5;
        targetEyeX = (((video.width - face.bbox[0] - face.bbox[2] / 2) / video.width) - 0.5) * scaleFactor;
        targetEyeY = (((face.bbox[1] + face.bbox[3] / 2) / video.height) - 0.5) * scaleFactor;
        targetEyeX = Math.max(Math.min(targetEyeX, 3), -3);
        targetEyeY = Math.max(Math.min(targetEyeY, 3), -3);

        // Apply Lerp
        currentEyeX += (targetEyeX - currentEyeX) * 0.1;
        currentEyeY += (targetEyeY - currentEyeY) * 0.1;

        const skewX = calculateSkew(currentEyeX);
        const skewY = calculateSkew(currentEyeY);

        const distance = Math.sqrt(currentEyeX * currentEyeX + currentEyeY * currentEyeY);
        const maxDistance = Math.sqrt(3 * 3 + 3 * 3);
        const scale = 1 - Math.min(distance / maxDistance, 1) * 0.50;

        const ballContainer = document.querySelector('.ball-container');
        ballContainer.style.transform = `translate(${currentEyeX * 50}px, ${currentEyeY * 50}px)`;

        // Update eye position
        eye.style.transform = `translate(-50%, -50%) translate(${currentEyeX * 50}px, ${currentEyeY * 50}px) skewX(${skewX}deg) skewY(${skewY}deg) scale(${scale})`;
    }

    function calculateSkew(value) {
        return value * -4;
    }
});

const orbitingElement = document.getElementById('orbitingMouth');

// Function to toggle talking state
function toggleState(isTalking) {
    console.log('toggleState called with isTalking:', isTalking);
    if (isTalking) {
        orbitingElement.style.backgroundImage = 'url(https://i.imgur.com/hz8KcKN.gif)'; // Talking state image
    } else {
        orbitingElement.style.backgroundImage = 'url(https://i.imgur.com/YAYYzDe.png)'; // Idle state image
    }
}
