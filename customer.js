const ioClient = require("socket.io-client");
const forge = require('node-forge');
const {
    generateKeysAndCertification
} = require('./utils');


const businessSocket = ioClient("http://localhost:8002");
const bankSocket = ioClient("http://localhost:8001", {
    autoConnect: false
});


let bankCertificationPromise = new Promise((resolve, reject) => {
    // 打开到银行的socket连接
    bankSocket.open();
    bankSocket.on('connection', () => {
        // 连接上银行之后首先获取到证书
        bankSocket.emit('getBankCertification');
    });

    const pki = forge.pki;
    pki.verifyCertificateChain()
    // 接收到银行的证书回调
    bankSocket.on('responseBankCertification', data => {
        // 验证银行证书的有效性
        bankSocket.close();
    });
});

businessSocket.on('connection', () => {
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

    const bankInfoMD = forge.md.sha256.create()
        .update(JSON.stringify(bankInfo))
        .digest().toHex();

    const commodityInfoMD = forge.md.sha256.create()
        .update(JSON.stringify(commodityInfo))
        .digest().toHex();

    const doubleMD = forge.md.sha256.create()
        .update(bankInfoMD)
        .update(commodityInfoMD);

    // 得到双重签名
    const doubleSignature = pki.privateKey.sign(doubleMD);

    // 传送给银行的信息（传给商家，用用户的私钥加密）
    const dataToBank = {
        bankInfo,
        commodityInfoMD,
        doubleSignature,
        cert: forge.pki.certificateToPem(pki.cert)
    };

    // 传递给商家的信息（包含加密后的传递给银行的信息）
    const dataToBusiness = {
        commodityInfo,
        bankInfoMD,
        doubleSignature,
        cert: forge.pki.certificateToPem(pki.cert)
    };

    socket.emit('placingOrder', dataToBusiness);
});
socket.on('placingOrder', () => {
    console.log('echo test');
});
