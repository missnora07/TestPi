const express = require('express');
const bodyParser = require('body-parser');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Include the filter and generateSketch functions here

const filter = (ctx, image, filters = "") => {
  ctx.filter = filters;
  ctx.drawImage(image, 0, 0);
};

const generateSketch = (ctx, bnw, blur) => {
  ctx.drawImage(bnw, 0, 0, bnw.width, bnw.height);
  ctx.globalCompositeOperation = 'color-dodge';
  ctx.drawImage(blur, 0, 0, bnw.width, bnw.height);
};

// API endpoint
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
