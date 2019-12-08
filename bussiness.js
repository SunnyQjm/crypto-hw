const forge = require('node-forge');
const ioClient = require("socket.io-client");
const pki = forge.pki;
const {
    generateKeysAndCertification,
    verifyCert,
    decryptUseAES,
    encryptUseAES,
    negotiatedAESKey,
    pullCertification
} = require('./utils');
const io = require('socket.io')(8002);

const bankSocket = ioClient("http://localhost:8001", {
    autoConnect: false
});

const userInfo = {
    bankID: '621745652301254',
    password: '123456',
    money: 1000,
};

const commodity = [
    {
        id: 1,
        name: '《南方车站的聚会》',
        type: 'book',
        price: 100,
    },
    {
        id: 2,
        name: '《斗破苍穹》',
        type: 'book',
        price: 120
    }
];

const businessPKI = generateKeysAndCertification();
let cBuKey = {};
let cBbKey = {};


// 首先拉取到银行的证书
pullCertification(bankSocket)
    .then(res => {
        // 与银行协商通信秘钥
        return negotiatedAESKey(bankSocket, businessPKI.cert, businessPKI.privateKey, pki.certificateFromPem(res.cert).publicKey, 'c-bb')
    })
    .catch(err => {
        console.log('拉取银行证书失败', err);
    })
    .then(res => {
        // 记录和银行的通信秘钥
        cBbKey = res;
    });

io.on('connection', socket => {
    socket.emit('connection');

    ///////////////////////////////////////////////////////
    //////// 处理证书获取请求
    ///////////////////////////////////////////////////////
    socket.on("getCertification", () => {
        // 将银行的证书返回
        socket.emit("responseCertification", {
            cert: pki.certificateToPem(businessPKI.cert)
        });
    });

    ////////////////////////////////////////////////////////
    //////// 处理秘钥协商
    ////////////////////////////////////////////////////////


    socket.on('setKey', data => {
        const {
            encryptedKey,
            cert,
            identity
        } = data;
        // console.log(data);

        // 验证证书失败发送拒绝消息
        if (!verifyCert(cert)) {
            console.log('fail');
            socket.emit('rejectNegotiatedAESKey');
        }

        // 用秘钥解密获得key
        let key = businessPKI.privateKey.decrypt(encryptedKey);
        let iv = forge.random.getBytesSync(16);
        switch (identity) {
            case 'c-bu':
                cBuKey = {
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

    socket.on('placingOrder', encrypted => {
        // 解密数据
        let data = JSON.parse(decryptUseAES(cBuKey.key, cBuKey.iv, encrypted).data);
        data.doubleSignature = forge.util.hexToBytes(data.doubleSignature);
        ////////////////////////////////////////////////////////////////
        ////// 首先验证双重签名
        ////////////////////////////////////////////////////////////////

        const commodityInfoMD = forge.md.sha256.create()
            .update(JSON.stringify(data.commodityInfo))
            .digest().toHex();

        const doubleMD = forge.md.sha256.create()
            .update(data.bankInfoMD)
            .update(commodityInfoMD);


        const cert = forge.pki.certificateFromPem(data.cert);
        const result = cert.publicKey.verify(doubleMD.digest().bytes(), data.doubleSignature);

        if (result) {
            console.log('验证通过，开始与银行交互');
            ////////////////////////////////////////////////////
            ///////// 验证通过之后与银行交互，处理扣款事宜
            ////////////////////////////////////////////////////
            console.log('银行秘钥', cBbKey);

        } else {
            console.log('验证失败');
            socket.emit('responsePlacingOrder',
                encryptUseAES(cBuKey.key, cBuKey.iv, JSON.stringify({
                    code: -1,
                    errMsg: '下单失败（验证双重签名失败）'
                })).toHex()
            );
        }
    });
    socket.on('disconnect', () => {
    })
});
