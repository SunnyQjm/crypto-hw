const ioClient = require("socket.io-client");
const forge = require('node-forge');

socket = ioClient("http://localhost:8002");

const publicKey = "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwpbcNYT4gLO2nLP69/mx\n" +
    "auTDpbyHYpyHUeVKfuZ1qVbMjNS49W1Uqj6hyo3tlVpltzvqDDMM51EQVvQG/Ouy\n" +
    "f/WTsRXcu3+jT0Ta0KPMV/ET/3qKf+ICSHYHsIjnC1b8BeMSclDWOunsx6vXqrAS\n" +
    "PkG8WE+hYPYaWjoJ02Ku8BGJJaPxNfjVrM/bySTqOHXZwTNJBqkoebb3e8HFnfpt\n" +
    "y660wNiWeaTeDr9KC2AGG83Fslfe3gWSIJ7AYs2T8m5FWPy3H2Mv2tbUa/jVY6jy\n" +
    "Za13tQxBu1ZFJlcFXCSNHOBR1CxNyvybsqqKnRGWUEHDAzSjB8n80xxDLilZM4op\n" +
    "2QIDAQAB\n" +
    "-----END PUBLIC KEY-----\n";
const privateKey = "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIIEpQIBAAKCAQEAwpbcNYT4gLO2nLP69/mxauTDpbyHYpyHUeVKfuZ1qVbMjNS4\n" +
    "9W1Uqj6hyo3tlVpltzvqDDMM51EQVvQG/Ouyf/WTsRXcu3+jT0Ta0KPMV/ET/3qK\n" +
    "f+ICSHYHsIjnC1b8BeMSclDWOunsx6vXqrASPkG8WE+hYPYaWjoJ02Ku8BGJJaPx\n" +
    "NfjVrM/bySTqOHXZwTNJBqkoebb3e8HFnfpty660wNiWeaTeDr9KC2AGG83Fslfe\n" +
    "3gWSIJ7AYs2T8m5FWPy3H2Mv2tbUa/jVY6jyZa13tQxBu1ZFJlcFXCSNHOBR1CxN\n" +
    "yvybsqqKnRGWUEHDAzSjB8n80xxDLilZM4op2QIDAQABAoIBABfNvphpcMDFuzQG\n" +
    "LFBDYjmyTGCs5F7iyQbypp9Jb+FMNe+QYiPbwPymdsJBhGu9yC2XDbV6VTzCxN3u\n" +
    "MiCkcIyIrQ1/oCXroj2jLaVSNEAZxJl/Eww7yI22qpAk3yaa+G977JjBXMOONCHk\n" +
    "2pgNu92Tywd+jj4/PNAGw4bxTncdZ2QCNEpcSIadLu5dcKWTqSXLchfJnRwgDi1L\n" +
    "WQeOPe2fIP3pH9EvAE3I2WkYu6Vu2XtoH2wWfeYwQVYd9P6es6QPSQsYJBr+gyIO\n" +
    "k/xtWBF/eh5pZLZALPM8kG77+UEc8j0ji0u/fNBDEYcY0WZ4inYWO2pGBkqtd6x6\n" +
    "3jejogECgYEA6GC1LCpjy1tf/T2s/shSGzG82bOJ8HCweWHGNRhzOK41wN+xffaX\n" +
    "49OjbiWXwhT/jcJnPFSr6E5/S+ARrNXx6ZxxM1gFIv4rdCFtuFBPBce5J+6PJk8Z\n" +
    "qJ0nKCk3Nan08jV8G3c+OUC9Z+1p2CoK0w8FFztsEYrNj3eviC9MAsECgYEA1l7D\n" +
    "RMF7Nfj+hlSpOPgARszhkh+Pl2SZ+j4Ux9TGauzWhrPF/7DY4W0sbO9jp9+DX00p\n" +
    "m3kJIYM+3A4DPFHapUiqY8115a1LWiRcnnbnuBf7SPoz0aOUKboG139cExyBMBol\n" +
    "Fhb71gP0rZ4dC6vaPY+TzAeWQuG/wzOZwh64JRkCgYEAvdmcywuK4q6xmq1T9Ahn\n" +
    "hE47c0VKsgTvOQwXqnNiV3GE+yIG2dmouHrFMA1IkkkjjIbCXzjyBeZz++KBrkpQ\n" +
    "zUKB/aew8qjjiYpyIL6EAT3uWOB/VZYUaXyTbC1YLODA/U2TKsFeNdpdpFYEPpYC\n" +
    "p/LCfvuOTDqxvL/UyheSK0ECgYEAnR/wOGEokjLjPEqpjlwYt8xMOfJwKSNPyR/f\n" +
    "02id1pmp1CnIotVY4kJHIcGFZfJqNFw2dwKMMsgkNt7+eCP3Atb0LRrXo3UVmgi0\n" +
    "6mF1DnZldOQPP0WKv9reUO3E6y0lc8B2Fm7aP8++c9NErt1TpXOrfQzCklstV0Jn\n" +
    "HOWvS2ECgYEAhYCR2QNrd1EsxWxXTa2NHW7QgNsYAgfdfi6fjOrFMWvxcWIcETPg\n" +
    "pCfh8zigpBnu8Mts9hFtalh0O/aYUy3NvnjK15j5TmGH1Uk/EeO9lcg55+ECmi2c\n" +
    "BEA/NMhxBW8pgDKUXiRIc4kaOD9JBnoF4I6LzxG8FW0c/RHiVkOFIHY=\n" +
    "-----END RSA PRIVATE KEY-----\n";

/**
 * 生成公私钥对和证书
 * @returns {{privateKey: *, cert: *, publicKey: *}}
 */
function generateKeysAndCertification() {
    const pki = forge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = 1;      // 标号
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    const attrs = [{
        name: 'commonName',
        value: 'example.org'
    }, {
        name: 'countryName',
        value: 'ZH'
    }, {
        shortName: 'ST',
        value: 'ShenZheng'
    }, {
        name: 'localityName',
        value: 'Test'
    }, {
        name: 'organizationName',
        value: 'Test'
    }, {
        shortName: 'OU',
        value: 'Test'
    }];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);

    // 用CA的根证书给证书签名
    const caRootPrivateKey = pki.privateKeyFromPem(privateKey);
    cert.sign(caRootPrivateKey);

    return {
        privateKey: pki.privateKeyToPem(keys.privateKey),
        publicKey: pki.publicKeyToPem(keys.publicKey),
        cert: pki.certificateToPem(cert)
    };
}

socket.on('connection', () => {
    console.log('connected');
    const pki = generateKeysAndCertification();

    // 银行卡信息
    const bankInfo = {
        bankID: '621745652301254',
        password: '123456',
    };

    // 商品信息
    const commodityInfo = {
        id: 1,                  // 购买id为1的数据
        count: 4                // 数量为4
    };

    forge.md5
    socket.emit('placingOrder', );
});
socket.on('placingOrder', () => {
    console.log('echo test');
});
