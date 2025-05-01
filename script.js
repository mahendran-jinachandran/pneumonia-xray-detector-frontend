
// This function displays the user uploaded image
async function displayReceivedImage(imageFile) {
    const previewContainer = document.getElementById('preview');
    const previewImage = document.createElement('img');
    previewImage.src = URL.createObjectURL(imageFile);
    previewImage.style.width = "224px";
    previewImage.style.height = "224px";
    previewContainer.innerHTML = ""; 
    previewContainer.appendChild(previewImage);
}

// This function is referenced from the following GitHub repository:
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
function createCanvasImage(img) {
    const canvas = document.createElement('canvas');
    const width = 224;
    const height = 224;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height).data;
    const pixels = [];

    // Normalize pixel values so that it is range of [0, 1]
    for (let i = 0; i < imageData.length; i += 4) {
      pixels.push(imageData[i] / 255);     // red
      pixels.push(imageData[i + 1] / 255); // green
      pixels.push(imageData[i + 2] / 255); // blue
    }

    const finalImage = [];
    for (let y = 0; y < width; y++) {
      const row = [];
      for (let x = 0; x < height; x++) {
        const i = (y * 224 + x) * 3;
        row.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
      }
      finalImage.push(row);
    }

    const body = JSON.stringify({ image: [finalImage] });
    return body;
}

async function uploadImage() {
    
    const userImage = document.getElementById('imageInput');
    const imgFile = userImage.files[0];

    if (!imgFile) {
      alert("Please upload an image first.");
      return;
    }

    document.getElementById('result').innerText = "Processing...";
    displayReceivedImage(imgFile);

    const img = new Image();
    img.src = URL.createObjectURL(imgFile);

    console.log("Starting Prediction")
    img.onload = async () => {
        
        const body = createCanvasImage(img);
        const api = 'https://4b5mtwg9bk.execute-api.eu-north-1.amazonaws.com/predict'

        responseEntity = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        }

        const response = await fetch(api, responseEntity);

        if (!response.ok) {
          const text = await response.text();
          alert("Error: " + text);
          return;
        }

        const result = await response.json();
        document.getElementById('result').innerText = "Prediction: " + JSON.stringify(result);
    };    
}
