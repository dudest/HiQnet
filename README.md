# HiQnet
 Parsing library for HiQnet communication protocol


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