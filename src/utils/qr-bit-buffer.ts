
class QrBitBuffer {
  buffer = [] as number[]
  bitLength = 0;


  put(num: number, length: number) {
    let {buffer, bitLength} = this

    const newBitLength = bitLength + length
    let restBits = (buffer.length << 3) - bitLength 
    let bufIndex = bitLength >> 3
    const newBufferLenght = newBitLength >> 3
    while (buffer.length <= newBufferLenght) {
      buffer.push(0);
    }
    let i = 0
    if(restBits == 0){
      bufIndex++
      restBits = Math.min(8, length - i)
    }
    while (i < length){
      buffer[bufIndex] |=  (num >>> (length - i - restBits) ) & ((1 << restBits) - 1);
      i += restBits
      bufIndex++
      restBits = Math.min(8, length - i)
    }
    this.bitLength=newBitLength

  };


  getBitAt(index: number){
    const {buffer, bitLength} = this
    var bufIndex = bitLength >> 3;
    return ( (buffer[bufIndex] >>> (7 - index | 0b111) ) & 1) == 1;

  }

  putBit(bit: boolean){
    const {buffer, bitLength} = this
    const bufIndex = bitLength >> 3
    if (buffer.length <= bufIndex) {
      buffer.push(0);
    }

    if (bit) {
      buffer[bufIndex] |= (0x80 >>> (bitLength | 0b111) );
    }
    this.bitLength+=1
  }


}

