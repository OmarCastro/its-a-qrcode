
/**
 * 
 * @param {object} opts 
 * @param {number} [opts.cellSize] 
 * @param {number} opts.margin 
 * @param {import('../qr-code.js').QrCode} opts.qrcode 
 */
_this.createASCII = function({cellSize = 1, margin, qrcode}) {
    cellSize = cellSize || 1;

    if (cellSize < 2) {
      return _createHalfASCII({margin, qrcode});
    }

    cellSize -= 1;
    margin ??= cellSize * 2;

    var size = qrcode.moduleCount * cellSize + margin * 2;
    var min = margin;
    var max = size - margin;

    var y, x, r, p;

    var white = Array(cellSize+1).join('██');
    var black = Array(cellSize+1).join('  ');

    var ascii = '';
    var line = '';
    for (y = 0; y < size; y += 1) {
      r = Math.floor( (y - min) / cellSize);
      line = '';
      for (x = 0; x < size; x += 1) {
        p = 1;

        if (min <= x && x < max && min <= y && y < max && qrcode.isDark(r, Math.floor((x - min) / cellSize))) {
          p = 0;
        }

        // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
        line += p ? white : black;
      }

      for (r = 0; r < cellSize; r += 1) {
        ascii += line + '\n';
      }
    }

    return ascii.substring(0, ascii.length-1);
  };

/**
 * 
 * @param {object} opts 
 * @param {number} opts.margin 
 * @param {import('../qr-code.js').QrCode} opts.qrcode 
 */
var _createHalfASCII = function({margin, qrcode}) {
    var cellSize = 1;
    margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

    var size = qrcode.moduleCount * cellSize + margin * 2;
    var min = margin;
    var max = size - margin;

    var y, x, r1, r2, p;

    /** @type {Record<string, string>} */
    var blocks = {
      '██': '█',
      '█ ': '▀',
      ' █': '▄',
      '  ': ' '
    };

    /** @type {Record<string, string>} */
    var blocksLastLineNoMargin = {
      '██': '▀',
      '█ ': '▀',
      ' █': ' ',
      '  ': ' '
    };

    var ascii = '';
    for (y = 0; y < size; y += 2) {
      r1 = Math.floor((y - min) / cellSize);
      r2 = Math.floor((y + 1 - min) / cellSize);
      for (x = 0; x < size; x += 1) {
        p = '█';

        if (min <= x && x < max && min <= y && y < max && qrcode.isDark(r1, Math.floor((x - min) / cellSize))) {
          p = ' ';
        }

        if (min <= x && x < max && min <= y+1 && y+1 < max && qrcode.isDark(r2, Math.floor((x - min) / cellSize))) {
          p += ' ';
        }
        else {
          p += '█';
        }

        // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
        ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
      }

      ascii += '\n';
    }

    if (size % 2 && margin > 0) {
      return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
    }

    return ascii.substring(0, ascii.length-1);
  };


