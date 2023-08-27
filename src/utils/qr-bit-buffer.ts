
export class QrBitBuffer {
  byteBuffer = [] as number[]
  bitLength = 0;


  put(num: number, length: number) {
    let {byteBuffer, bitLength} = this

    const newBitLength = bitLength + length
    let restBits = (byteBuffer.length << 3) - bitLength 
    let bufIndex = bitLength >> 3
    const newBufferLenght = newBitLength >> 3
    while (byteBuffer.length <= newBufferLenght) {
      byteBuffer.push(0);
    }
    let i = 0
    if(restBits == 0){
      bufIndex++
      restBits = Math.min(8, length - i)
    }
    while (i < length){
      byteBuffer[bufIndex] |=  (num >>> (length - i - restBits) ) & ((1 << restBits) - 1);
      i += restBits
      bufIndex++
      restBits = Math.min(8, length - i)
    }
    this.bitLength=newBitLength

  };


  getBitAt(index: number){
    const {byteBuffer, bitLength} = this
    var bufIndex = bitLength >> 3;
    return ( (byteBuffer[bufIndex] >>> (7 - index | 0b111) ) & 1) == 1;

  }

  putBit(bit: boolean){
    const {byteBuffer, bitLength} = this
    const bufIndex = bitLength >> 3
    if (byteBuffer.length <= bufIndex) {
      byteBuffer.push(0);
    }

    if (bit) {
      byteBuffer[bufIndex] |= (0x80 >>> (bitLength | 0b111) );
    }
    this.bitLength+=1
  }


}

