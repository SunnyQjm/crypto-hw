const forge = require('node-forge');
const pki = forge.pki;
const io = require('socket.io')(8001);
const {
    generateKeysAndCertification,
    verifyCert,
    decryptUseAES
} = require('./utils');

const userInfo = {
    bankID: '621745652301254',
    password: '123456',
    money: 1000,
};

// 生成银行使用的公私钥对和证书
const bankPKI = generateKeysAndCertification();

io.on('connection', socket => {
    socket.emit('connection');

    ///////////////////////////////////////////////////////
    //////// 处理证书获取请求
    ///////////////////////////////////////////////////////
    // 监听获取证书的请求
    socket.on("getCertification", () => {

        // 将银行的证书返回
        socket.emit("responseCertification", {
            cert: pki.certificateToPem(bankPKI.cert)
        });
    });


    ////////////////////////////////////////////////////////
    //////// 处理秘钥协商
    ////////////////////////////////////////////////////////
    let cBaKey = {};
    let cBbKey = {};

    socket.on('setKey', data => {
        const {
            encryptedKey,
            cert,
            identity
        } = data;

        // 验证证书失败发送拒绝消息
        if (!verifyCert(cert)) {
            console.log('fail');
            socket.emit('rejectNegotiatedAESKey');
        }

        // 用秘钥解密获得key
        let key = bankPKI.privateKey.decrypt(encryptedKey);
        let iv = forge.random.getBytesSync(16);
        switch (identity) {
            case 'c-ba':
                cBaKey = {
                    key,
                    iv
                };
                break;
            case 'c-bb':
                cBbKey = {
                    key,
                    iv
                };
                break;
        }
        const remotePublicKey = pki.certificateFromPem(cert).publicKey;
        const response = {
            encryptedIv: remotePublicKey.encrypt(iv)
        };
        socket.emit('setIv', response);
    });

    socket.on('disconnect', () => {
        console.log('disconnect');
    })
});
