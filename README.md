[![platform](https://img.shields.io/badge/platform-node.js-green)](https://nodejs.org/en)
[![npm package version](https://img.shields.io/npm/v/hiqnet)](https://www.npmjs.com/package/hiqnet)
![license](https://img.shields.io/npm/l/hiqnet)
[![Npm package total downloads](https://badgen.net/npm/dt/hiqnet)](https://www.npmjs.com/package/hiqnet)
[![github-issues](https://img.shields.io/github/issues/dudest/hiqnet)](https://github.com/dudest/hiqnet/issues)

# HiQnet
Parsing library for HiQnet communication protocol

## Installation

```
npm install hiqnet
```

## Version History

| Version | Release Notes                                      |
| :-----: | -------------------------------------------------- |
| 0.0.5   | Fixed: github actions not publishing .js and .d.ts |
| 0.0.4   | Package publishing automation                      |
| 0.0.3   | Fixed missing .js and .d.ts files                  |
| 0.0.2   | Fixed broken links in readme                       |
| 0.0.1   | Initial beta release                               |

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

- `encDiscrete(v: number): Buffer`
- `encPercent(v: number): Buffer`
- `encGain(v: number): Buffer`
- `encScalarLinear(v: number): Buffer`
- `encDelay(v: number): Buffer`
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

- `decDiscrete(b: Buffer): number`
- `decPercent(b: Buffer): number`
- `decGain(b: Buffer): number`
- `decScalarLinear(b: Buffer): number`
- `decDelay(b: Buffer): number`
- `decFrequencyOrSpeed(b: Buffer): number`

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

## Feature Requests / Bug Reporting

Please report any bugs or issues to the repository [here](https://github.com/dudest/HiQnet/issues).