/**
 * Returns a byte subsitituted buffer, removing illegal bytes.
 * @param {Buffer} buf - Buffer to be transformed
 * @returns {Buffer} Transformed Buffer
 */
exports.byteSubstitute = (buf: Buffer): Buffer => {
    let temp = [];
    for (let i = 0; i < buf.length; i++) {
        switch (buf[i]) {
            case 0x02:
                temp.push(0x1b);
                temp.push(0x82);
                break;
            case 0x03:
                temp.push(0x1b);
                temp.push(0x83);
                break;
            case 0x06:
                temp.push(0x1b);
                temp.push(0x86);
                break;
            case 0x15:
                temp.push(0x1b);
                temp.push(0x95);
                break;
            case 0x1b:
                temp.push(0x1b);
                temp.push(0x9b);
                break;
            default:
                temp.push(buf[i]);
                break;
        }
    }
    return Buffer.from(temp);
}

/**
 * Returns a Buffer in its original form.
 * @param {Buffer} buf - Buffer with illegal bytes subsituted
 * @returns {Buffer} Buffer in original form
 */
exports.byteUnsubstitute = (buf: Buffer): Buffer => {
    let temp = [];
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] == 0x1b) {
            i++;
            switch (buf[i]) {
                case 0x82:
                    temp.push(0x02);
                    break;
                case 0x83:
                    temp.push(0x03);
                    break;
                case 0x86:
                    temp.push(0x06);
                    break;
                case 0x95:
                    temp.push(0x15);
                    break;
                case 0x9b:
                    temp.push(0x1b);
                    break;
            }
        }
        else {
            temp.push(buf[i]);
        }
    }
    return Buffer.from(temp);
}

/**
 * Returns checksum.
 * @param {Buffer} buf - Buffer to be used for calculation
 * @returns {Buffer} Checksum (as a Buffer)
 */
exports.calculateChecksum = (buf: Buffer): Buffer => {
    let chk = 0
    for (let i = 0; i < buf.length; i++) {
        chk = chk ^ buf[i];
    }
    return Buffer.from([chk]);
}

/**
 * Returns an encapsulated command ready to be transmitted to Soundweb device.
 * The following operations are rolled up into this function:
 * - Generate checksum.
 * - Build command string with checksum.
 * - Byte substitute illegal characters.
 * - build command string with STX and ETX bytes.
 * @param {Buffer} buf - Command as a Buffer to be encapsulated
 * @returns {Buffer} Encapsulated command as a Buffer
 */
exports.encapsulateCommand = (buf: Buffer): Buffer => {
    let checksum = this.calculateChecksum(buf);
    let temp = Buffer.concat([buf, checksum]);
    temp = this.byteSubstitute(temp);
    return Buffer.concat([Buffer.from([2]), temp, Buffer.from([3])]);
}

/**
 * Returns a decapsulated command.
 * The following operations are rolled up into this function:
 * - Strip off STX and ETX.
 * - Unsubstitute illegal characters.
 * - Remove command portion
 * - Remove checksum portion.
 * - Calculate the checksum.
 * - Compare checksum in the command and the calculated checksum.
 *   - If checksums match, return command to caller.
 *   - If checksums don't match, return null to caller.
 * @param {Buffer} buf - Encapsulated command as a buffer
 * @returns {Buffer} Decapsulated command
 */
exports.decapsulateCommand = (buf: Buffer): Buffer => {
    let temp = buf.subarray(1, buf.length - 1);
    temp = this.byteUnsubstitute(temp);
    let tempCommand = temp.subarray(0, temp.length - 1);
    let tempChecksum1 = temp.subarray(-1);
    let tempChecksum2 = this.calculateChecksum(tempCommand);
    if (Buffer.compare(tempChecksum1, tempChecksum2) == 0) {
        return tempCommand;
    }
    else {
        return null;
    }
}

/**
 * Returns the command ID of a decapsualted command Buffer.
 * @param {Buffer} buf - Decapsulated command
 * @returns {Buffer} Command ID (1 byte Buffer)
 */
exports.getCommandIdBuffer= (buf: Buffer): Buffer => {
    return buf.subarray(0, 1);
}

/**
 * Returns address portion of a decapsulated command Buffer.
 * @param {Buffer} buf - Decapsulated command
 * @returns {Buffer} Address (8 byte Buffer)
 */
exports.getAddressBuffer = (buf: Buffer): Buffer => {
    return buf.subarray(1, 9);
}

/**
 * Returns data portion of a decapsulated command buffer.
 * @param {Buffer} buf - Decapsulated command
 * @returns {Buffer} Data (4 byte Buffer)
 */
exports.getDataBuffer = function (buf: Buffer): Buffer {
    return buf.subarray(9);
}

/**
 * Returns a 4 byte buffer representation of an number.
 * @param {number} int - Data as an integer
 * @returns {Buffer} integer as a 4 byte Buffer
 */
exports.encDiscrete = (int: number): Buffer => {
    return Buffer.from([(int >> 24) & 0xff,
    (int >> 16) & 0xff,
    (int >> 8) & 0xff,
    int & 0xff]);
}

/**
 * Converts a 4 byte Buffer into a number.
 * @param {Buffer} buf - Data as a 4 byte Buffer
 * @returns {number} Data as a number
 */
exports.decDiscrete = (buf: Buffer): number => {
    return (buf[0] << 24) + (buf[1] << 16) + (buf[2] << 8) + buf[3];
}

/**
 * Returns a 4 byte data Buffer representation of a percentage value
 * @param {number} value - Percentage value
 * @returns {Buffer} Data as a Buffer
 */
exports.encPercent = (value: number): Buffer => {
    return this.encDiscrete(value * 65536);
}

/**
 * Returns a number between 0 and 100
 * @param {Buffer} buf - 4 byte Buffer representation of a percentage value 
 * @returns {number} Number between 0 and 100
 */
exports.decPercent = (buf: Buffer): number => {
    return this.decDiscrete(buf) / 65536;
}

/**
 * Returns a 4 byte Buffer representation of a dB value
 * @param {number} dbValue - dB value
 * @returns {Buffer} 4 byte Buffer representation of a dB value
 */
exports.encGain = (dbValue: number): Buffer => {
    let value;

    if (dbValue >= -10) {
        value = dbValue * 10000;
    }
    else {
        value = (-Math.log10(Math.abs(dbValue / 10)) * 200000) - 100000;
    }

    return this.encDiscrete(value);
}

/**
 * Returns a dB value
 * @param {Buffer} buf - 4 byte Buffer representation of a dB value
 * @returns {number} dB value
 */
exports.decGain = (buf: Buffer): number => {
    let value = this.decDiscrete(buf);
    if (value >= -100000) {
        return value / 10000;
    }
    else {
        return -10 * (Math.pow(10, Math.abs(value + 100000) / 200000));
    }
}

/**
 * Retruns a 4 byte Buffer of a scalar linear scaled number
 * @param {number} val - number
 * @returns {Buffer} 4 byte Buffer representation of a number
 */
exports.encScalarLinear = (val: number): Buffer => {
    return this.encDiscrete(val * 10000);
}

/**
 * Returns a scalar linear scaled number
 * @param {Buffer} buf - 4 byte Buffer representation of a number
 * @returns {number} number
 */
exports.decScalarLinear = (buf: Buffer): number => {
    return this.decDiscrete(buf) / 10000;
}

/**
 * Returns a 4 byte Buffer representation of a ms value
 * @param {number} val - ms delay
 * @returns {Buffer} - 4 byte Buffer representation of a ms number
 */
exports.encDelay = (val: number): Buffer => {
    return this.encDiscrete(val * 96000 / 1000);
}

/**
 * Returns a ms value
 * @param {Buffer} buf - 4 byte Buffer representation of a ms number
 * @returns {number} ms value
 */
exports.decDelay = (buf: Buffer): number => {
    return this.decDiscrete(buf) * 1000 / 96000;
}

/**
 * Returns a 4 byte Buffer representation of a Frequency or Speed scaled value
 * @param {number} val - Hz or ms value
 * @returns {Buffer} 4 byte Buffer representation of a Hz or ms value
 */
exports.encFrequencyOrSpeed = (val: number): Buffer => {
    return this.encDiscrete(Math.log10(val) * 1000000);
}

/**
 * Returns a Frequency or Speed value
 * @param {Buffer} buf - 4 byte Buffer representation of a Hz or ms value
 * @returns {number} Hz or ms value
 */
exports.decFrequencyOrSpeed = (buf: Buffer): number => {
    return Math.pow(10, this.decDiscrete(buf) / 1000000);
}