
import assert from 'node:assert';
import { test } from 'node:test';
import { QrBitBuffer } from "./qr-bit-buffer.js";


test('Bit buffer - Given an empty bit buffer, adding 4 bytes will add them in the correct order', () => {
    const num1 = 0b0000_0110_0000_1111
    const buffer = new QrBitBuffer()
    buffer.put(num1, 16)
    buffer.put(num1, 16)
    assert.deepEqual(Array.from(buffer.byteBuffer), [0b0000_0110,0b0000_1111, 0b0000_0110,0b0000_1111])
    assert.equal(buffer.bitLength, 32)
    buffer.put(1,1)
    assert.deepEqual(Array.from(buffer.byteBuffer), [0b0000_0110,0b0000_1111, 0b0000_0110,0b0000_1111, 0b1000_0000])
    assert.equal(buffer.bitLength, 33)
}); 

test('Bit buffer - Given bit buffer with all byte data filled, adding one bit will add one more entry on the byte array with the byte on the left position', () => {
  const data = 0b0000_0110_0000_1111
  const buffer1 = new QrBitBuffer()
  const buffer2 = new QrBitBuffer()
  buffer1.put(data, 16)
  buffer2.put(data, 16)
  const expectedData = [0b0000_0110,0b0000_1111, 0b1000_0000]
  buffer1.put(1,1)
  buffer2.putBit(true)
  assert.deepEqual(Array.from(buffer1.byteBuffer), expectedData)
  assert.deepEqual(Array.from(buffer2.byteBuffer), expectedData)
  assert.equal(buffer1.bitLength, 17)
  assert.equal(buffer2.bitLength, 17)
}); 



test('Bit buffer - Given bit buffer without all byte data filled, adding bits will add entries correctly while putting the last bytes on the left position', () => {
  const data = 0b1111
  const buffer = new QrBitBuffer()
  buffer.put(data, 4)
  
  const num1 = 0b0110_0110_0010_1110
  buffer.put(num1, 16)
  buffer.put(num1, 16)
  assert.deepEqual(Array.from(buffer.byteBuffer), [0b1111_0110, 0b0110_0010, 0b1110_0110,0b0110_0010, 0b1110_0000])
  assert.equal(buffer.bitLength, 36)
}); 

test('Bit buffer - Given bit buffer with byte data filled, getBtitAt should get the correct bit value', () => {
  const buffer = new QrBitBuffer()
  const num1 = 0b0110_0110_0010_1110
  buffer.put(num1, 16)

  const result = (buffer.getBitAt(0) << 3) + (buffer.getBitAt(1)  << 2) + (buffer.getBitAt(2) << 1) + buffer.getBitAt(3) 
  assert.strictEqual(result, 0b0110)
}); 


test('Bit buffer - Given bit buffer with byte data filled, adding bits that fill to 0 should fill them and apply on the next byte', () => {
  const buffer = new QrBitBuffer()
  buffer.put(0b0100, 4)
  buffer.put(0b0000_1100, 8)

  assert.deepEqual(Array.from(buffer.byteBuffer), [0b0100_0000, 0b1100_0000])
}); 
