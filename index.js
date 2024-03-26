const fs = require('fs');
const crypto = require('crypto');


/**
 * Action for return pinblock
 * 
 * @param {*} pin 
 * @param {*} cardNumber 
 */
function generate(pin, cardNumber) {

    try {

        if (pin && pin.length > 0 && pin.length < 12) {
            if (cardNumber && cardNumber.length == 16) {

                // ************* pin digits 
                // ************* pin digits 

                // A 16 digits block is created from the digit 0, followed by the length of the PIN then PIN and remaining characters as F (hexadecimal 'F')
                let _tmpPinDigits = `0${pin.length}${pin}`;
                _tmpPinDigits = `${_tmpPinDigits}${`F`.repeat(16 - _tmpPinDigits.length)}`; // assing new value

                // ************* card digits 
                // ************* card digits 

                // Another 16 digits block is created from 4 zeros (0000) and then the 12 right most digits of the Card/Account number, excluding the check digit.
                let _tmpCardDigits = `0000${cardNumber.substring(3, cardNumber.length - 1)}`;

                // ************* x-ORed
                // ************* x-ORed

                // The two blocks are to be X-ORed. The result of X-OR is the PIN Block

                const _tpmHex1 = Buffer.from(_tmpPinDigits, 'hex');
                const _tpmHex2 = Buffer.from(_tmpCardDigits, 'hex');

                const _tmpXor = Buffer.alloc(_tpmHex1.length);

                for (let i = 0; i < _tpmHex1.length; i++) {
                    _tmpXor[i] = _tpmHex1[i] ^ _tpmHex2[i];
                }

                // ************* RSA encryptation
                // ************* RSA encryptation

                const _tmpPublicKey = fs.readFileSync(`assets/euronet-cert.pem`, 'utf-8');
                const _encrypt = crypto.publicEncrypt({ key: _tmpPublicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, _tmpXor);

                return _encrypt.toString('base64');

            } else
                throw new Error('Invalid cardNumber');
        } else
            throw new Error('Invalid pin');

    } catch (err) {
        throw new Error(`err: ${err}`);
    }

}

console.log(`-------------------------------------------------`);
console.log(`Example 1: `, generate(`1234`, `1234567801022736`));
console.log(`-------------------------------------------------`);
console.log(`Example 2: `, generate(`2580`, `1234567801022736`));
console.log(`-------------------------------------------------`);
console.log(`Example 3: `, generate(`4321`, `1234567801022736`));
console.log(`-------------------------------------------------`);