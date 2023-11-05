const express = require('express');
const bodyParser = require('body-parser');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/convertToSketch', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const rawImg = await loadImage(imageUrl);
    const width = rawImg.width;
    const height = rawImg.height;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bnwCanvas = createCanvas(width, height);
    const bnwCtx = bnwCanvas.getContext('2d');
    filter(bnwCtx, rawImg, "grayscale(1)");

    const blurCanvas = createCanvas(width, height);
    const blurCtx = blurCanvas.getContext('2d');
    filter(blurCtx, rawImg, "grayscale(1) invert(1) blur(5px)");

    generateSketch(ctx, bnwCanvas, blurCanvas);

    const resultBuffer = canvas.toBuffer('image/png');
    const fileName = `sketch_${Date.now()}.png`;
    const filePath = `path/to/save/${fileName}`;
    fs.writeFileSync(filePath, resultBuffer);

    res.json({ success: true, sketchUrl: `your_domain/${fileName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
