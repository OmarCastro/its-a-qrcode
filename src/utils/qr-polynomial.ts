
import {gexp, glog} from './qr-math.js'


class QRPolynomial {
  private array: Uint32Array;
  constructor(num: ArrayLike<number>, shift = 0){
    let offset = 0;
    while (offset < num.length && num[offset] == 0) {
      offset += 1;
    }
    const lengthAfterOffset = num.length - offset 
    const array = new Uint32Array(lengthAfterOffset + shift)
    for (let i = 0; i < lengthAfterOffset; i += 1) {
      array[i] = num[i + offset];
    }
    this.array = array
  }

  getAt(index: number){ 
    return this.array[index];
  }

  get length(){ 
    return this.array.length;
  }

  multiply(other: QRPolynomial){ 
    const {length, array} = this
    const {length: otherLength, array: otherArray} = this

    var num = new Array(length + otherLength - 1);
    
    for (var i = 0; i < length; i += 1) {
      for (var j = 0; j < otherLength; j += 1) {
        num[i + j] ^= gexp(glog(array[i] ) + glog(otherArray[j] ) );
      }
    }

    return new QRPolynomial(num, 0);
  }

  mod(other: QRPolynomial) {
    const {length, array} = this
    const {length: otherLength, array: otherArray} = this

    
    if (length - otherLength < 0) {
      return this;
    }

    var ratio = glog(array[0] ) - glog(otherArray[0] );

    var num = Uint32Array.from(array);

    for (var i = 0; i < otherLength; i += 1) {
      num[i] ^= gexp(glog(otherArray[i] ) + ratio);
    }

    // recursive call
    return new QRPolynomial(num, 0).mod(other);
  };
}


export function QrPolynomial(num: number[], shift = 0) {
  return new QRPolynomial(num, shift)
};
  
  