import { QrBitBuffer} from './qr-bit-buffer.js'
import { type QrRSBlock, getRSBlocks } from './qr-rs-block.utils.js';
import { getErrorCorrectPolynomial } from './qr-util.js'; 
import { QrPolynomial } from './qr-polynomial.js';
import { getLengthInBits } from './qr-util.js';


const PAD0 = 0xEC;
const PAD1 = 0x11;

export function createData(typeNumber, errorCorrectionLevel, dataList) {
  
  var rsBlocks = getRSBlocks(typeNumber, errorCorrectionLevel);

  var buffer = new QrBitBuffer();

  for (var i = 0; i < dataList.length; i += 1) {
    var data = dataList[i];
    buffer.put(data.getMode(), 4);
    buffer.put(data.getLength(), getLengthInBits(data.getMode(), typeNumber) );
    data.write(buffer);
  }

  // calc num max data.
  var totalDataCount = 0;
  for (var i = 0; i < rsBlocks.length; i += 1) {
    totalDataCount += rsBlocks[i].dataCount;
  }

  if (buffer.bitLength > totalDataCount * 8) {
    throw 'code length overflow. ('
      + buffer.bitLength
      + '>'
      + totalDataCount * 8
      + ')';
  }

  // end code
  if (buffer.bitLength + 4 <= totalDataCount * 8) {
    buffer.put(0, 4);
  }

  // padding
  while (buffer.bitLength % 8 != 0) {
    buffer.putBit(false);
  }

  // padding
  while (true) {

    if (buffer.bitLength >= totalDataCount * 8) {
      break;
    }
    buffer.put(PAD0, 8);

    if (buffer.bitLength >= totalDataCount * 8) {
      break;
    }
    buffer.put(PAD1, 8);
  }

  return createBytes(buffer, rsBlocks);
};


export function createBytes(buffer: QrBitBuffer, rsBlocks: QrRSBlock[]) {
  
  var offset = 0;

  var maxDcCount = 0;
  var maxEcCount = 0;

  var dcdata = new Array(rsBlocks.length) as number[][];
  var ecdata = new Array(rsBlocks.length) as number[][];

  for (var r = 0; r < rsBlocks.length; r += 1) {

    var dcCount = rsBlocks[r].dataCount;
    var ecCount = rsBlocks[r].totalCount - dcCount;

    maxDcCount = Math.max(maxDcCount, dcCount);
    maxEcCount = Math.max(maxEcCount, ecCount);

    dcdata[r] = new Array(dcCount);

    for (var i = 0, e = dcdata[r].length; i < e; i += 1) {
      dcdata[r][i] = 0xff & buffer.byteBuffer[i + offset];
    }
    offset += dcCount;

    var rsPoly = getErrorCorrectPolynomial(ecCount);
    var rawPoly = QrPolynomial(dcdata[r], rsPoly.length - 1);

    var modPoly = rawPoly.mod(rsPoly);
    ecdata[r] = new Array(rsPoly.length - 1);
    for (var i = 0; i < ecdata[r].length; i += 1) {
      var modIndex = i + modPoly.length - ecdata[r].length;
      ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
    }
  }

  var totalCodeCount = 0;
  for (var i = 0; i < rsBlocks.length; i += 1) {
    totalCodeCount += rsBlocks[i].totalCount;
  }

  var data = new Array(totalCodeCount) as number[];
  var index = 0;

  for (var i = 0; i < maxDcCount; i += 1) {
    for (var r = 0; r < rsBlocks.length; r += 1) {
      if (i < dcdata[r].length) {
        data[index] = dcdata[r][i];
        index += 1;
      }
    }
  }

  for (var i = 0; i < maxEcCount; i += 1) {
    for (var r = 0; r < rsBlocks.length; r += 1) {
      if (i < ecdata[r].length) {
        data[index] = ecdata[r][i];
        index += 1;
      }
    }
  }

  return data;
};
