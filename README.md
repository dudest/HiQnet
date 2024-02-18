[![platform](https://img.shields.io/badge/platform-node.js-green)](https://nodejs.org/en)
[![npm package version](https://img.shields.io/npm/v/HiQnet)](https://www.npmjs.com/package/HiQnet)
![license](https://img.shields.io/npm/l/HiQnet)
[![Npm package weekly downloads](https://badgen.net/npm/dw/HiQnet)](https://www.npmjs.com/package/HiQnet)
[![Npm package monthly downloads](https://badgen.net/npm/dm/HiQnet)](https://www.npmjs.com/package/HiQnet)
[![Npm package total downloads](https://badgen.net/npm/dt/HiQnet)](https://www.npmjs.com/package/HiQnet)
[![github-issues](https://img.shields.io/github/issues/dudest/HiQnet)](https://github.com/dudest/HiQnet/issues)

# HiQnet
Parsing library for HiQnet communication protocol

## Installation

```
npm install hiqnet
```

## Version History

| Version | Release Notes        |
| :-----: | -------------------- |
| 0.0.1   | Initial beta release |

## Usage

### Sending Commands

Before sending a command to a Blu device, use `hiqnet.encapsulatCommand(buf: Buffer)`. This function will byte substitute, add checksum, and prepend/append STX/ETX respectively.

```
const hiqnet = require('hiqnet');

let cmd_id = Buffer.from([0x88]);
let address = Buffer.from([0x00, 0x09, 0x03, 0x00, 0x01, 0x00, 0x4e, 0x20]);
let data = hiqnet.encDiscrete(10);

let cmd = hiqnet.encapsulateCommand(Buffer.concat([cmd_id, address, data]));

// send encapsulated command to Blu device via TCP or Serial.
```

There are several functions to facilitate encoding data types:

- `encDiscrete(v: number)`
- `encPercent(v: number)`
- `encGain(v: number)`
- `encScalerLinear(v: number)`
- `encDelay(v: number)`
- `encFrequencyOrSpeed(v: number)`

### Parsing Responses

To parse incomming messages, use `hiqnet.decapsulateCommand(buf: Buffer)`. This function will strip STX/ETX, verify and remove checksum, and byte unsubstitute.

```
const hiqnet = require('hiqnet');

let cmd = hiqnet.decapsulateCommand(rx$);

let cmd_id = hiqnet.getCommandIdBuffer(cmd);
let address = hiqnet.getAddressBuffer(cmd);
let data = hiqnet.getDateBuffer(cmd);

// decode data buffer
let dataValue = hiqnet.decDiscrete(data);
```

There are several functions to facilitate decoding data types:

- `decDiscrete(b: Buffer)`
- `decPercent(b: Buffer)`
- `decGain(b: Buffer)`
- `decScalerLinear(b: Buffer)`
- `decDelay(b: Buffer)`
- `decFrequencyOrSpeed(b: Buffer)`

## Resources

- [Soundweb London DI Kit](https://bssaudio.com/en/site_elements/soundweb-london-di-kit)
- [Soundweb London 3rd Party Control](https://help.harmanpro.com/Documents/135/Soundweb%20London%203rd%20Party%20Control.pdf)

### Address Property

The address property is a buffer of exactly 8 bytes. it is comprised of:

- Node Address (2 bytes)
- Virtual Device (1 byte)
- Object ID (3 bytes)
- Parameter ID (2 bytes)

The following bytes have special meanings. The node suite will automatically handle replacement when commands are encapsulated and decapsulated. Be mindfull on nodes requiring an address property that the **non replaced** character is needed in decimal format. 

| TYPE   | HEX  | HEX replacement | DEC  | DEC replacement |
| ------ |:----:| :-------------: | :---:| :-------------: |
| STX    | 0x02 | 0x1B, 0x82      | 2    | 27, 130         |
| ETX    | 0x03 | 0x1B, 0x83      | 3    | 27, 131         |
| ACK    | 0x06 | 0x1B, 0x86      | 6    | 27, 134         |
| NAK    | 0x15 | 0x1B, 0x95      | 21   | 27, 149         |
| Escape | 0x1B | 0x1B, 0x9B      | 27   | 27, 155         |

---

## Testing

```
  HiQnet.ts
    checkSum
      ✔ <buffer 01 02 03 04 05 06> should return <buffer 07>
    byteSubstitute
      ✔ <buffer 02 03 06 15 1b> should return <buffer 1b 82 1b 83 1b 86 1b 95 1b 9b>
    byteUnubstitute
      ✔ <buffer 1b 82 1b 83 1b 86 1b 95 1b 9b> should return <buffer 02 03 06 15 1b>
    encapsulateCommand
      ✔ <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 02 8d 10 1b 82 1b 83 00 01 0f 00 60 00 34 e8 ff d1 03>
    decapsulateCommand
      ✔ <buffer 02 8d 10 1b 82 1b 83 00 01 0f 00 60 00 34 e8 ff d1 03> should return <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff>
    getCommandIdBuffer
      ✔ <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 8d>
    getAddressBuffer
      ✔ <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 10 02 03 00 01 0f 00 60>
    getDataBuffer
      ✔ <buffer 8d 10 02 03 00 01 0f 00 60 00 34 e8 ff> should return <buffer 00 34 e8 ff>
    encDiscrete
      ✔ 10 should return <buffer 00 00 00 0a>
    decDiscrete
      ✔ <buffer 00 00 00 0b> should return 11
    encPercent
      ✔ 12.5 should return <buffer 00 0c 80 00>
    decPercent
      ✔ <buffer 00 0c 80 00> should return 12.5
    encGain
      ✔ -15dB should return <buffer ff fd ef ce>
    decGain
      ✔ <buffer ff fd ef ce> should return roughly -15dB (-14.999956513820392)
    encScalarLinear
      ✔ 5 should return <buffer 00 00 c3 50>
    decScalarLinear
      ✔ <buffer 00 00 c3 50> should return 5
    encDelay
      ✔ 5 should return <buffer 00 00 01 e0>
    decDelay
      ✔ <buffer 00 00 01 e0> should return 5
    encFrequencyOrSpeed
      ✔ 5 should return <buffer 00 0a aa 5a>
    decFrequencyOrSpeed
      ✔ <buffer 00 0a aa 5a> should return roughly 5 (4.999999950079738)


  20 passing (7ms)
```

## Feature Requests / Bug Reporting

Please report any bugs or issues to the repository [here](https://github.com/dudest/HiQnet/issues).