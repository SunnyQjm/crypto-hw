const {
    generateKeysAndCertification,
    verifyCert
} = require('./utils');


//////////////////////////////////////////
/////// 测试使用根证书验证其签发的证书
//////////////////////////////////////////

const testPKI = generateKeysAndCertification();
const result = verifyCert(testPKI.cert);
console.log(result);
