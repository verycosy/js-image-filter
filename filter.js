const $fileButton = document.getElementById("fileButton");
const $filterButton = document.getElementById("filterButton");

const $canvas = document.getElementById("canvas");
const ctx = $canvas.getContext("2d");

function drawImage(img) {
  const { width, height } = img;
  $canvas.width = width;
  $canvas.height = height;

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0);
}

function convolution(pixels, weights, opaque) {
  const side = Math.round(Math.sqrt(weights.length));
  const halfSide = Math.floor(side / 2);
  const src = pixels.data;
  const sw = pixels.width;
  const sh = pixels.height;

  const w = sw,
    h = sh;

  const output = ctx.createImageData(w, h);
  const dst = output.data;

  const alphaFac = opaque ? 1 : 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sy = y;
      const sx = x;
      const dstOff = (y * w + x) * 4;

      let r = 0,
        g = 0,
        b = 0,
        a = 0;

      for (let cy = 0; cy < side; cy++) {
        for (let cx = 0; cx < side; cx++) {
          const scy = sy + cy - halfSide;
          const scx = sx + cx - halfSide;

          if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
            const srcOff = (scy * sw + scx) * 4;
            const wt = weights[cy * side + cx];

            r += src[srcOff] * wt;
            g += src[srcOff + 1] * wt;
            b += src[srcOff + 2] * wt;
            a += src[srcOff + 3] * wt;
          }
        }
      }

      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }

  return output;
}

function sobel(pixels) {
  return convolution(pixels, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 1);
}

function blur(pixels, value) {
  const offset = 1 / (value / 10);

  return convolution(
    pixels,
    [offset, offset, offset, offset, offset, offset, offset, offset, offset],
    1
  );
}

function init() {
  $fileButton.addEventListener("change", (evt) => {
    const file = evt.target.files[0];

    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const img = new Image();
        img.onload = () => drawImage(img);
        img.src = e.target.result;
      };

      fileReader.readAsDataURL(file);
    }
  });

  $filterButton.addEventListener("click", (evt) => {
    // Uint8ClampedArray
    // [0] ~ [3] : 첫번째 픽셀 rgba
    const imageData = ctx.getImageData(0, 0, $canvas.width, $canvas.height);
    const { data: pixels } = imageData;
    console.log(imageData);

    // for (let i = 0; i < pixels.length; i += 4) {
    //   // NOTE: += 4
    //   pixels[i] = 255 - pixels[i];
    //   pixels[i + 1] = 255 - pixels[i + 1];
    //   pixels[i + 2] = 255 - pixels[i + 2];
    //   // pixels[i+3] = 255;
    // }

    // const filtered = sobel(imageData);
    const filtered = blur(imageData, 80);

    // ctx.putImageData(imageData, 0, 0);
    ctx.putImageData(filtered, 0, 0);
  });
}

init();
