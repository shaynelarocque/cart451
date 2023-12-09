// Importing the HfInference module from the Hugging Face package
import { HfInference } from "https://cdn.jsdelivr.net/npm/@huggingface/inference@1.8.0/+esm";

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("Script loaded and DOM fully loaded");

  // Getting references to the required elements
  const video = document.getElementById('video'); //video for webcam
  const canvas = document.getElementById('canvas');
  const fetchButton = document.getElementById('fetchDescriptions'); //button to fetch descriptions
  const context = canvas.getContext('2d');
  const hfApiKey = document.getElementById('hfApiKey').value; // Hugging Face API key

  // Getting user media (video) permissions and handling errors
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error("Error getting user media:", err));

  // Function to fetch description using Hugging Face API
  const fetchDescription = async (modelEndpoint, descId) => {
    const hf = new HfInference(hfApiKey);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    let file = new File([blob], "webcam-photo.jpg", { type: 'image/jpeg', lastModified: Date.now() });

    try {
      const result = await hf.imageToText({
        model: modelEndpoint,
        data: file
      });

      console.log('Model response:', result);

      const modelName = modelEndpoint.includes('/') ? modelEndpoint.split('/').pop() : modelEndpoint;
      let description = ` Model: ${modelName}\n`;
      if (result.generated_text) {
        description += ` Text: ${result.generated_text}\n`;
      }
      if (result.score) {
        description += ` Confidence Score: ${result.score.toFixed(2)}\n`;
      }
      if (result.label) {
        description += ` Label: ${result.label}`;
      }

      document.getElementById(descId).value = description || "Description not available";

    } catch (error) {
      console.error('Error fetching description:', error);
    }
  };

  // Event listener for fetch button click
  fetchButton.addEventListener('click', async function () {
    analyzeImageWithOpenAI();
    for (let i = 1; i <= 8; i++) {
      const modelEndpoint = document.getElementById(`model${i}`).value;
      await fetchDescription(modelEndpoint, `userDesc${i}`);
    }
  });

  // Function to analyze image using OpenAI Vision
  async function analyzeImageWithOpenAI() {
    console.log('Calling generateArt after 45s');
    setTimeout(generateArt, 45000);
    try {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const response = await fetch('/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: dataUrl })
      });

      const visionData = await response.json();
      console.log('OpenAI Vision response:', visionData);

      const visionDescription = `OpenAI Vision: ${visionData.message.content}` || "OpenAI Vision description not available";
      document.getElementById('userDesc8').value = visionDescription;
      console.log('OpenAI Vision description:', visionDescription);
    } catch (error) {
      console.error('Error fetching OpenAI Vision description:', error);
      document.getElementById('userDesc8').value = "OpenAI Vision description not available";
    }
  }

  // Function to call server side art generator
  function generateArt() {
    console.log('Calling generateArt');
    const userDescs = {
        userDesc1: document.getElementById('userDesc1').value,
        userDesc2: document.getElementById('userDesc2').value,
        userDesc3: document.getElementById('userDesc3').value,
        userDesc4: document.getElementById('userDesc4').value,
        userDesc5: document.getElementById('userDesc5').value,
        userDesc6: document.getElementById('userDesc6').value,
        userDesc7: document.getElementById('userDesc7').value,
        userDesc8: document.getElementById('userDesc8').value,
    };

    fetch('/generate-art', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDescs)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Art generation response:', data);

        if (data && typeof data === 'object') {
            try {
                const artData = {
                    description: data.Description,
                    p5jsCode: data.p5js,
                    userDescriptions: {
                        userDesc1: userDescs.userDesc1,
                        userDesc2: userDescs.userDesc2,
                        userDesc3: userDescs.userDesc3,
                        userDesc4: userDescs.userDesc4,
                        userDesc5: userDescs.userDesc5,
                        userDesc6: userDescs.userDesc6,
                        userDesc7: userDescs.userDesc7,
                        userDesc8: userDescs.userDesc8,
                    },
                    additionalInfo: {
                        race: data.Race,
                        gender: data.Gender,
                        sexuality: data.Sexuality,
                        location: data.Location,
                        interests: data.Interests,
                        takeaways: data.Takeaways,
                        artDescription: data.ArtDescription
                    }
                };
                sessionStorage.setItem('artData', JSON.stringify(artData));
                window.location.href = 'p5_render.html';
            } catch (error) {
                console.error('Error processing art data:', error);
            }
        } else {
            console.error('Invalid response data:', data);
        }
    })
    .catch(error => {
        console.error('Error fetching art description:', error);
    });
  }
});