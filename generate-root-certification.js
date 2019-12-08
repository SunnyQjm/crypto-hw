const {
    generateKeysAndCertification
} = require('./utils');
const forge = require('node-forge');

// 和公私密钥对，和生成自签的根证书
const pki = forge.pki;
const result = generateKeysAndCertification(true);

console.log(pki.publicKeyToPem(result.publicKey));
console.log(pki.privateKeyToPem(result.privateKey));
console.log(pki.certificateToPem(result.cert));
