const {
    generateKeysAndCertification,
    verifyCert
} = require('./utils');
const pki = require('node-forge').pki;


//////////////////////////////////////////
/////// 测试使用根证书验证其签发的证书
//////////////////////////////////////////

const testPKI = generateKeysAndCertification();
const result = verifyCert(pki.certificateToPem(testPKI.cert));
console.log(result);
