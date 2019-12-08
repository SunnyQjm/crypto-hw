const {
    encryptUseAES,
    decryptUseAES,
    generateKeysAndCertification,
} = require('./utils');
const forge = require('node-forge');

// const key = forge.random.getBytesSync(16);
const key = forge.random.getBytesSync(16);
const iv = forge.random.getBytesSync(16);





const output = encryptUseAES(key, iv, 'lalalalalalaal');

const hex = output.toHex();

const result = decryptUseAES(key, iv, hex);

console.log(result.data);
