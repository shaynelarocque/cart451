//Eye (Actually face) position tracking code adapted from https://www.youtube.com/watch?v=CVClHLwv-4I
let eyeX = 0, eyeY = 0;

document.addEventListener('DOMContentLoaded', function () {
    //Parsing session storage
    const artData = JSON.parse(sessionStorage.getItem('artData'));
    if (artData) {
        let p5jsCode = artData.p5jsCode;

        //Replace mouseX and mouseY with eyeX and eyeY because OpenAI didn't like eyeX and eyeY
        p5jsCode = p5jsCode.replace(/mouseX/g, 'eyeX');
        p5jsCode = p5jsCode.replace(/mouseY/g, 'eyeY');

        eval(p5jsCode);

        // Check if setup and draw functions are defined and assign them to window (Thank god for ChatGPT for help with this)
        if (typeof setup === 'function') {
            window.setup = setup;
        }
        if (typeof draw === 'function') {
            window.draw = draw;
        }

        new p5();

        //Add art details to page
        document.getElementById('art-details').innerHTML = `
        <p><strong>Art Description:</strong> ${artData.additionalInfo.artDescription}</p>
        <p><strong>AI Analysis Output:</strong></p>
        <ul>
            <li>${artData.userDescriptions.userDesc1}</li>
            <li>${artData.userDescriptions.userDesc2}</li>
            <li>${artData.userDescriptions.userDesc3}</li>
            <li>${artData.userDescriptions.userDesc4}</li>
            <li>${artData.userDescriptions.userDesc5}</li>
            <li>${artData.userDescriptions.userDesc6}</li>
            <li>${artData.userDescriptions.userDesc7}</li>
            <li>${artData.userDescriptions.userDesc8}</li>
        </ul>
        <p><strong>Deductions:</strong></p>
        <p><strong>User Description:</strong> ${artData.description}</p>
        <p><strong>Race:</strong> ${artData.additionalInfo.race}</p>
        <p><strong>Gender:</strong> ${artData.additionalInfo.gender}</p>
        <p><strong>Sexuality:</strong> ${artData.additionalInfo.sexuality}</p>
        <p><strong>Location:</strong> ${artData.additionalInfo.location}</p>
        <p><strong>Interests:</strong> ${artData.additionalInfo.interests}</p>
        <p><strong>Takeaways:</strong> ${artData.additionalInfo.takeaways}</p>
        `;
    } else {
        console.error('No art data found in session storage');
    }

    //Save art data to database
    document.getElementById('saveButton').addEventListener('click', function() {
        const artData = JSON.parse(sessionStorage.getItem('artData'));
        if (artData) {
            fetch('/save-artdata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(artData)
            })
            .then(response => response.text())
            .then(() => window.location.href = 'index.html')
            .catch(error => console.error('Error:', error));
        } else {
            console.error('No art data found in session storage');
        }
    });
});

//Loading face tracker
document.addEventListener('DOMContentLoaded', async () => {
    const video = document.getElementById('video');
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

    function runDetection() {
        model.detect(video).then(predictions => {
            if (predictions.length > 0) {
                let face = predictions[0];
                updateEyePosition(face);
            }
        });
    }
    
    //Lerp so the art isn't jittery
    function updateEyePosition(face) {
        let targetEyeX = map(face.bbox[0] + face.bbox[2] / 2, 0, video.width, 0, windowWidth);
        let targetEyeY = map(face.bbox[1] + face.bbox[3] / 2, 0, video.height, 0, windowHeight);
    
        eyeX = lerp(eyeX, targetEyeX, 0.1);
        eyeY = lerp(eyeY, targetEyeY, 0.1);
    }
});