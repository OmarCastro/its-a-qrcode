    
    import { ByteArrayOutputStream } from '../utils/bite-array-output-stream';
    
    //---------------------------------------------------------------------
    // gifImage (B/W)
    //---------------------------------------------------------------------
  
    /**
     * 
     * @param {number} width : ;
     * @param {number} height 
     * @returns 
     */
    export function gifImage(width, height) {
  
      var _width = width;
      var _height = height;
      var _data = new Array(width * height).fill(1)
  
      var _this = {};
  
      /**
       * 
       * @param {number} x 
       * @param {number} y 
       * @param {number} pixel 
       */
      _this.setPixel = function(x, y, pixel) {
        _data[y * _width + x] = pixel;
      };
  
      /**
       * 
       * @param {import('../utils/bite-array-output-stream').ByteArrayOutputStream} out 
       */
      _this.write = function(out) {
  
        //---------------------------------
        // GIF Signature
  
        out.writeString('GIF87a');
  
        //---------------------------------
        // Screen Descriptor
  
        out.writeShort(_width);
        out.writeShort(_height);
  
        out.writeByte(0x80); // 2bit
        out.writeByte(0);
        out.writeByte(0);
  
        //---------------------------------
        // Global Color Map
  
        // black
        out.writeByte(0x00);
        out.writeByte(0x00);
        out.writeByte(0x00);
  
        // white
        out.writeByte(0xff);
        out.writeByte(0xff);
        out.writeByte(0xff);
  
        //---------------------------------
        // Image Descriptor
  
        out.writeString(',');
        out.writeShort(0);
        out.writeShort(0);
        out.writeShort(_width);
        out.writeShort(_height);
        out.writeByte(0);
  
        //---------------------------------
        // Local Color Map
  
        //---------------------------------
        // Raster Data
  
        var lzwMinCodeSize = 2;
        var raster = getLZWRaster(lzwMinCodeSize);
  
        out.writeByte(lzwMinCodeSize);
  
        var offset = 0;
  
        while (raster.length - offset > 255) {
          out.writeByte(255);
          out.writeBytes(raster, offset, 255);
          offset += 255;
        }
  
        out.writeByte(raster.length - offset);
        out.writeBytes(raster, offset, raster.length - offset);
        out.writeByte(0x00);
  
        //---------------------------------
        // GIF Terminator
        out.writeString(';');
      };
  
      /**
       * 
       * @param {import('../utils/bite-array-output-stream').ByteArrayOutputStream} out 
       */
      var bitOutputStream = function(out) {
  
        var _out = out;
        var _bitLength = 0;
        var _bitBuffer = 0;
  
        var _this = {};
  
        /**
         * 
         * @param {number} data 
         * @param {number} length 
         */
        _this.write = function(data, length) {
  
          if ( (data >>> length) != 0) {
            throw 'length over';
          }
  
          while (_bitLength + length >= 8) {
            _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
            length -= (8 - _bitLength);
            data >>>= (8 - _bitLength);
            _bitBuffer = 0;
            _bitLength = 0;
          }
  
          _bitBuffer = (data << _bitLength) | _bitBuffer;
          _bitLength = _bitLength + length;
        };
  
        _this.flush = function() {
          if (_bitLength > 0) {
            _out.writeByte(_bitBuffer);
          }
        };
  
        return _this;
      };
  
      /**
       * 
       * @param {number} lzwMinCodeSize 
       * @returns 
       */
      var getLZWRaster = function(lzwMinCodeSize) {
  
        var clearCode = 1 << lzwMinCodeSize;
        var endCode = (1 << lzwMinCodeSize) + 1;
        var bitLength = lzwMinCodeSize + 1;
  
        // Setup LZWTable
        var table = lzwTable();
  
        for (var i = 0; i < clearCode; i += 1) {
          table.add(String.fromCharCode(i) );
        }
        table.add(String.fromCharCode(clearCode) );
        table.add(String.fromCharCode(endCode) );
  
        var byteOut = new ByteArrayOutputStream();
        var bitOut = bitOutputStream(byteOut);
  
        // clear code
        bitOut.write(clearCode, bitLength);
  
        var dataIndex = 0;
  
        var s = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;
  
        while (dataIndex < _data.length) {
  
          var c = String.fromCharCode(_data[dataIndex]);
          dataIndex += 1;
  
          if (table.contains(s + c) ) {
  
            s = s + c;
  
          } else {
  
            bitOut.write(table.indexOf(s), bitLength);
  
            if (table.size() < 0xfff) {
  
              if (table.size() == (1 << bitLength) ) {
                bitLength += 1;
              }
  
              table.add(s + c);
            }
  
            s = c;
          }
        }
  
        bitOut.write(table.indexOf(s), bitLength);
  
        // end code
        bitOut.write(endCode, bitLength);
  
        bitOut.flush();
  
        return byteOut.toByteArray();
      };
  
      var lzwTable = function() {
  
        /** @type {Record<string,number>} */
        var _map = {};
        var _size = 0;
  
        var _this = {};
  
        /**
         * 
         * @param {string} key 
         */
        _this.add = function(key) {
          if (_this.contains(key) ) {
            throw 'dup key:' + key;
          }
          _map[key] = _size;
          _size += 1;
        };
  
        _this.size = function() {
          return _size;
        };
  
        /**
         * 
         * @param {string} key 
         * @returns 
         */
        _this.indexOf = function(key) {
          return _map[key];
        };
  
        /**
         * 
         * @param {string} key 
         * @returns 
         */
        _this.contains = function(key) {
          return typeof _map[key] != 'undefined';
        };
  
        return _this;
      };
  
      return _this;
    };