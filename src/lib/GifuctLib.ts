import Konva from "konva";
import { parseGIF, decompressFrames, ParsedFrame } from "gifuct-js";
export class GifuctLib {
  tempCanvas: any;
  tempCtx: any;
  c: any;
  ctx: any;
  gifCanvas: any;
  gifCtx: any;
  loadedFrames:any;
  frameIndex:number=1;
   pixelPercent = 100;
  frameImageData: ImageData;
  playing:any=true;
  async loadGIF(gifURL: string) {
    const resp = await fetch(gifURL);
    const arrayBuffer = await resp.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const frames = decompressFrames(gif, true);
    return { gif, frames };
  };

  renderGIF (frames: ParsedFrame[])  {
    this.loadedFrames = frames;
    this.frameIndex = 0;
    this.c = document.createElement("canvas");
    this.ctx = this.c.getContext("2d");
    this.c.width = frames[0].dims.width;
    this.c.height = frames[0].dims.height;
    // full gif canvas
     this.gifCanvas = document.createElement("canvas");
     this.gifCtx = this.gifCanvas.getContext("2d");
    this.gifCanvas.width = this.c.width;
    this.gifCanvas.height = this.c.height;
    this.tempCanvas = document.createElement("canvas")
    this.tempCtx = this.tempCanvas.getContext("2d")
  };

   drawPatch (frame: ParsedFrame)  {

    if (this.gifCtx && this.tempCtx) {
      const dims = frame.dims;
  
      if (
        !this.frameImageData ||
        dims.width != this.frameImageData.width ||
        dims.height != this.frameImageData.height
      ) {
        this.tempCanvas.width = dims.width;
        this.tempCanvas.height = dims.height;
        this.frameImageData = this.tempCtx.createImageData(dims.width, dims.height);
      }
  
      // set the patch data as an override
      this.frameImageData.data.set(frame.patch);
  
      // draw the patch back over the canvas
      this.tempCtx.putImageData(this.frameImageData, 0, 0);
  
      this.gifCtx.drawImage(this.tempCanvas, dims.left, dims.top);
    } else {
      console.error("drawPatch error ctx not defined", this.ctx, this.gifCtx);
    }
  };
  
   manipulate() {
    if (this.ctx && this.gifCtx) {
      const imageData =this.gifCtx.getImageData(
        0,
        0,
        this.gifCanvas.width,
        this.gifCanvas.height
      );
      const other = this.gifCtx.createImageData(this.gifCanvas.width, this.gifCanvas.height);
  
  
      // do pixelation
      const pixelsX = 5 + Math.floor((this.pixelPercent / 100) * (this.c.width - 5));
      const pixelsY = (pixelsX * this.c.height) / this.c.width;
  
      if (this.pixelPercent != 100) {
        // ctx.mozImageSmoothingEnabled = false
        // ctx.webkitImageSmoothingEnabled = false
        this.ctx.imageSmoothingEnabled = false;
      }
  
      this.ctx.putImageData(imageData, 0, 0);
      this.ctx.drawImage(this.c, 0, 0, this.c.width, this.c.height, 0, 0, pixelsX, pixelsY);
      this.ctx.drawImage(this.c, 0, 0, pixelsX, pixelsY, 0, 0, this.c.width, this.c.height);
    } else {
      console.error("manipulate error ctx not defined", this.ctx, this.gifCtx);
    }
  };
  
  renderFrame (layer: Konva.Layer){
    let _this=this;
    // get the frame
    const frame = this.loadedFrames[this.frameIndex];
  
    const start = new Date().getTime();
  
    if (frame.disposalType === 2 && this.gifCtx) {
      // gifCtx.clearRect(0, 0, c.width, c.height)
      // see: https://github.com/matt-way/gifuct-js/issues/35
      const prevFrame = this.loadedFrames[this.frameIndex - 1];
      const { width, height, left, top } = prevFrame.dims;
      this.gifCtx.clearRect(left, top, width, height);
    }
  
    // draw the patch
    this.drawPatch(frame);
  
    // perform manipulation
    this.manipulate();
  
    // update the frame index
    this.frameIndex++;
    if (this.frameIndex >=this.loadedFrames.length) {
      this.frameIndex = 0;
    }
  
    const end = new Date().getTime();
    const diff = end - start;
  
    layer.draw();
  
    if (this.playing) {
      // delay the next gif frame
      setTimeout(function () {
        requestAnimationFrame(() => _this.renderFrame(layer));
      }, Math.max(0, Math.floor(frame.delay - diff)));
    }
  };
  
  async load(gifURL: string, layer: Konva.Layer, callbackFn: any) {
    let _this = this;
    try {
      const { gif, frames } = await _this.loadGIF(gifURL);

      _this.renderGIF(frames);
      _this.renderFrame(layer);
      callbackFn(this.c);
      return this.c;
    } catch (error) {
      console.log("gifuct try/catch", error);
    }
  }
}