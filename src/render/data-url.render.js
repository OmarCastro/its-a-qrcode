import { gifImage } from "./gif-image.render";
import { ByteArrayOutputStream } from "../utils/bite-array-output-stream.js";
import { bytesToBase64 } from "../utils/text-decode-encode.util.js";

/**
 * 
 * @param {object} opts 
 * @param {number} opts.cellSize 
 * @param {number} opts.margin 
 * @param {import('../qr-code.js').QrCode} opts.qrcode 
 */
export function createDataURL({cellSize, margin, qrcode}) {
  
  cellSize = cellSize || 2;
  margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

  var size = qrcode.moduleCount * cellSize + margin * 2;
  var min = margin;
  var max = size - margin;

  return createDataURLAux(size, size, function(x, y) {
    if (min <= x && x < max && min <= y && y < max) {
      var c = Math.floor( (x - min) / cellSize);
      var r = Math.floor( (y - min) / cellSize);
      return qrcode.isDark(r, c)? 0 : 1;
    } else {
      return 1;
    }
  } );
};


/**
 * 
 * @param {number} width : ;
 * @param {number} height 
 * @param {(x: number, y:number) => number} getPixel 
 * @returns 
 */
function createDataURLAux(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = new ByteArrayOutputStream();
    gif.write(b);
    var base64 = bytesToBase64(b.toByteArray());  
    return 'data:image/gif;base64,' + base64;
  };
