const forge = require('node-forge');
const ioClient = require("socket.io-client");
const pki = forge.pki;
const {
    generateKeysAndCertification,
    decryptUseAES,
    encryptUseAES,
    negotiatedAESKey,
    pullCertification,
    dealNegotiatedAESKey,
    dealPullCertification,
    verifyDoubleSignature
} = require('./utils');
const io = require('socket.io')(8002);

const bankSocket = ioClient("http://localhost:8001", {
    autoConnect: false
});

const bankInfo = {
    bankID: '621745652301255',
    password: '123456',
};

const commoditys = {
    1: {
        id: 1,
        name: '《南方车站的聚会》',
        type: 'book',
        price: 100,
    },
    2: {
        id: 2,
        name: '《斗破苍穹》',
        type: 'book',
        price: 120
    }
};

const businessPKI = generateKeysAndCertification();
let cBuKey = {};
let cBbKey = {};

/**
 * 与银行处理转账事宜
 */
function transferAccounts(socket, cBbKey, dataToBank) {
    return new Promise((resolve, reject) => {
        socket.open();
        socket.emit('transferAccounts',
            encryptUseAES(cBbKey.key, cBbKey.iv, JSON.stringify(dataToBank)).toHex()
        );

        // 等待银行返回数据
        socket.on('responseTransferAccounts', encrypted => {
            const data = JSON.parse(decryptUseAES(cBbKey.key, cBbKey.iv, encrypted));
            console.log(data);
            if(data.code === 0) {
                resolve();
            } else {
                reject(data.errMsg);
            }
        });
    });
}


/**
 * 处理下单
 */
function dealPlacingOrder(socket, cBuKey) {
    socket.on('placingOrder', encrypted => {
        // 解密数据
        let data = JSON.parse(decryptUseAES(cBuKey.key, cBuKey.iv, encrypted).data);
        data.doubleSignature = forge.util.hexToBytes(data.doubleSignature);
        const {
            commodityInfo,
            bankInfoMD,
            paymentInformation
        } = data;
        ////////////////////////////////////////////////////////////////
        ////// 首先验证双重签名
        ////////////////////////////////////////////////////////////////

        const result = verifyDoubleSignature(commodityInfo, bankInfoMD, data.cert, data.doubleSignature);

        if (result) {
            const commodity = commoditys[commodityInfo.id];

            // 无此商品
            if (!commodity)
                socket.emit('responsePlacingOrder',
                    encryptUseAES(cBuKey.key, cBuKey.iv, JSON.stringify({
                        code: -1,
                        errMsg: '下单失败（商品无效）'
                    })).toHex()
                );

            console.log('验证通过，开始与银行交互');
            ////////////////////////////////////////////////////
            ///////// 验证通过之后与银行交互，处理扣款事宜
            ////////////////////////////////////////////////////

            const dataToBank = {
                toCount: bankInfo,
                money: commodity.price * commodityInfo.count,
                paymentInformation
            };

            transferAccounts(bankSocket, cBbKey, dataToBank)
                .then(() => {
                    console.log('转账成功');
                    let need = true;
                    io.on('connection', _socket => {
                        if(need) {
                            need = false;
                            _socket.emit('responsePlacingOrder',
                                encryptUseAES(cBuKey.key, cBuKey.iv, JSON.stringify({
                                    code: 0,
                                    errMsg: ''
                                })).toHex()
                            );
                        }
                    });

                })
                .catch(err => {
                    let need = true;
                    io.on('connection', _socket => {
                        if(need) {
                            need = false;
                            _socket.emit('responsePlacingOrder',
                                encryptUseAES(cBuKey.key, cBuKey.iv, JSON.stringify({
                                    code: -1,
                                    errMsg: err
                                })).toHex()
                            );
                        }
                    });
                    console.log('reject', err);
                });

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
    socket.on('disconnect', reason => {
        // console.log('disconnect', reason);
    })
}


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

    dealPullCertification(socket, businessPKI.cert);

    ////////////////////////////////////////////////////////
    //////// 处理秘钥协商
    ////////////////////////////////////////////////////////

    dealNegotiatedAESKey(socket, businessPKI.privateKey, data => {
        switch (data.identity) {
            case 'c-bu':
                cBuKey = data.keys;
                break;
            case 'c-bb':
                cBbKey = data.keys;
                break;
        }
    });

    //////////////////////////////////////////////////////
    /////// 处理订单请求
    //////////////////////////////////////////////////////

    dealPlacingOrder(socket, cBuKey);

    socket.on('disconnect', () => {
    })
});
