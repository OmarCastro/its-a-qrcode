import { RS_BLOCK_TABLE } from "./qr-rs-block-table.constants.js";
import { QRErrorCorrectionLevel } from "./qr-rs-correction-level.constants.js"; 

const qrRSBlock = (totalCount:number, dataCount:number) => ({ totalCount, dataCount })


const getRsBlockTable = function(typeNumber, errorCorrectionLevel) {
    
  switch(errorCorrectionLevel) {
  case QRErrorCorrectionLevel.L : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
  case QRErrorCorrectionLevel.M : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
  case QRErrorCorrectionLevel.Q : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
  case QRErrorCorrectionLevel.H : return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
  default :
    return undefined;
  }
};

export const getRSBlocks = function(typeNumber, errorCorrectionLevel) {
    
  var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

  if (typeof rsBlock == 'undefined') {
    throw 'bad rs block @ typeNumber:' + typeNumber +
        '/errorCorrectionLevel:' + errorCorrectionLevel;
  }

  var length = rsBlock.length / 3;

  var list = [] as ReturnType<typeof qrRSBlock>[];

  for (var i = 0; i < length; i += 1) {

    var count = rsBlock[i * 3 + 0];
    var totalCount = rsBlock[i * 3 + 1];
    var dataCount = rsBlock[i * 3 + 2];

    for (var j = 0; j < count; j += 1) {
      list.push(qrRSBlock(totalCount, dataCount) );
    }
  }

  return list;
}

