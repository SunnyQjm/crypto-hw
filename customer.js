const ioClient = require("socket.io-client");
const forge = require('node-forge');
const pki = forge.pki;
const {
    generateKeysAndCertification,
    verifyCert,
    encryptUseAES,
    negotiatedAESKey,
    pullCertification
} = require('./utils');


const businessSocket = ioClient("http://localhost:8002", {
    autoConnect: false
});
const bankSocket = ioClient("http://localhost:8001", {
    autoConnect: false
});

// 生成客户的公私密钥对和证书
const customerPKI = generateKeysAndCertification();

// /**
//  * 去银行拉取证书，成功则返回证书pem
//  * @type {Promise<{cert: *}>}
//  */
// const bankCertificationPromise = new Promise((resolve, reject) => {
//     // 打开到银行的socket连接
//     bankSocket.open();
//     bankSocket.on('connection', () => {
//         // 连接上银行之后首先获取到证书
//         bankSocket.emit('getBankCertification');
//     });
//
//     // 接收到银行的证书回调
//     bankSocket.on('responseBankCertification', data => {
//         if (verifyCert(data.cert)) {
//             resolve(data);
//         } else {
//             reject();
//         }
//         // 验证银行证书的有效性
//         bankSocket.close();
//     });
// });
//
// /**
//  * 拉取商家的证书并验证
//  * @type {Promise<{cert: *}>}
//  */
// const businessCertificationPromise = new Promise((resolve, reject) => {
//     // 打开商家的socket连接
//     businessSocket.open();
//     businessSocket.on('connection', () => {
//         // 连上商家之后首先获取到证书
//         businessSocket.emit('getBusinessCertification');
//     });
//     businessSocket.on('responseBusinessCertification', data => {
//         if (verifyCert(data.cert)) {
//             resolve(data);
//         } else {
//             reject();
//         }
//         businessSocket.close();
//     })
// });


// 银行卡信息
const bankInfo = {
    bankID: '621745652301254',
    password: '123456',
};


/**
 * 下单购买商品
 * @param bankInfo              银行卡信息
 * @param commodityId           商品id
 * @param count                 购买商品的数量
 * @param businessCert          商家的证书（用于取出证书中的公钥进行加密）
 * @param bankCert              银行的证书（用于取出证书中的公钥进行加密）
 * @param cBuKey                客户与商家用于AES加密的key和iv
 * @param cBaKey                客户与银行用于AES加密额key和iv
 * @returns {Promise<*>}
 */
function buyCommodity(bankInfo, commodityId, count, businessCert, bankCert, cBuKey, cBaKey) {
    return new Promise((resolve, reject) => {
        // 商品信息
        const commodityInfo = {
            id: commodityId,            // 购买id为1的数据
            count: count                // 数量为4
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
        const doubleSignature = customerPKI.privateKey.sign(doubleMD);


        const result = customerPKI.cert.publicKey.verify(doubleMD.digest().bytes(), doubleSignature);
        console.log(doubleMD.digest().bytes());
        console.log(typeof doubleSignature);
        console.log(doubleSignature);
        // console.log(customerPKI.cert.publicKey);
        console.log('验证结果', result);

        // // 证书中抽取证书中的公钥
        // const businessPublicKey = pki.certificateFromPem(businessCert).publicKey;
        // const bankPublicKey = pki.certificateFromPem(bankCert).publicKey;


        // 传送给银行的信息（传给商家，用用户的私钥加密）
        const dataToBank = {
            bankInfo,
            commodityInfoMD,
            doubleSignature: forge.util.bytesToHex(doubleSignature),
            cert: forge.pki.certificateToPem(customerPKI.cert)
        };

        // 传递给商家的信息（包含加密后的传递给银行的信息）
        const dataToBusiness = {
            commodityInfo,
            bankInfoMD,
            doubleSignature: forge.util.bytesToHex(doubleSignature),            // 先将签名数据转为hex，用JSON进行转换的时候不会数据丢失
            cert: forge.pki.certificateToPem(customerPKI.cert),
            // 加密后的付款信息
            paymentInformation: encryptUseAES(cBaKey.key, cBaKey.iv, JSON.stringify(dataToBank)).toHex()
        };

        // 打开商家的socket连接
        businessSocket.open();
        // 连上商家之后发起下订单的请求
        businessSocket.emit('placingOrder',
            encryptUseAES(cBuKey.key, cBuKey.iv, JSON.stringify(dataToBusiness))
                .toHex()
        );

        // 等待下订单的结果
        businessSocket.on('responsePlacingOrder', data => {
            console.log('下单结果', data);
        });

    });
}

pullCertification(bankSocket)
//////////////////////////////////////
////// 获取银行证书
//////////////////////////////////////
    .then(bankRes => {
        console.log('获取到银行证书并验证成功 => ');
        return pullCertification(businessSocket)
            .then(res => {
                return {
                    bankCert: bankRes.cert,
                    businessCert: res.cert
                }
            })
    })
    .catch(err => {
        console.log('获取到银行证书但验证失败', err);
    })
    //////////////////////////////////////
    ////// 获取商家证书
    //////////////////////////////////////
    .then(certs => {
        console.log('获取到商家证书并验证成功 => ');
        return negotiatedAESKey(businessSocket, customerPKI.cert, customerPKI.privateKey, pki.certificateFromPem(certs.businessCert).publicKey, 'c-bu')
            .then(res => {
                return {
                    ...certs,
                    cBuKey: res
                }
            });
    })
    //////////////////////////////////////
    ////// 与商家协商秘钥
    //////////////////////////////////////
    .then(lastRes => {
        console.log('与商家协商秘钥成功');
        return negotiatedAESKey(bankSocket, customerPKI.cert, customerPKI.privateKey, pki.certificateFromPem(lastRes.bankCert).publicKey, 'c-ba')
            .then(res => {
                return {
                    ...lastRes,
                    cBaKey: res
                }
            });
    })
    .catch(err => {
        console.log('与商家协商秘钥失败', err);
    })
    //////////////////////////////////////
    ////// 与银行协商秘钥
    //////////////////////////////////////
    .then(res => {
        console.log('与银行协商秘钥成功', res);
        return buyCommodity(bankInfo, 1, 4, res.businessCert, res.bankCert, res.cBuKey, res.cBaKey);
    })
    .catch(err => {
        console.log('与银行协商秘钥失败', err);
    })
    .then(res => {
        console.log('购买成功', res);
        console.log(res);
    })
    .catch(err => {
        console.log('获取到商家证书但验证失败', err);
    });


// businessSocket.on('connection', () => {
//     console.log('connected');
//     const pki = generateKeysAndCertification();
//
//     // 银行卡信息
//     const bankInfo = {
//         bankID: '621745652301254',
//         password: '123456',
//     };
//
//     // 商品信息
//     const commodityInfo = {
//         id: 1,                  // 购买id为1的数据
//         count: 4                // 数量为4
//     };
//
//     const bankInfoMD = forge.md.sha256.create()
//         .update(JSON.stringify(bankInfo))
//         .digest().toHex();
//
//     const commodityInfoMD = forge.md.sha256.create()
//         .update(JSON.stringify(commodityInfo))
//         .digest().toHex();
//
//     const doubleMD = forge.md.sha256.create()
//         .update(bankInfoMD)
//         .update(commodityInfoMD);
//
//     // 得到双重签名
//     const doubleSignature = pki.privateKey.sign(doubleMD);
//
//     // 传送给银行的信息（传给商家，用用户的私钥加密）
//     const dataToBank = {
//         bankInfo,
//         commodityInfoMD,
//         doubleSignature,
//         cert: forge.pki.certificateToPem(pki.cert)
//     };
//
//     // 传递给商家的信息（包含加密后的传递给银行的信息）
//     const dataToBusiness = {
//         commodityInfo,
//         bankInfoMD,
//         doubleSignature,
//         cert: forge.pki.certificateToPem(pki.cert)
//     };
//
//     socket.emit('placingOrder', dataToBusiness);
// });
// socket.on('placingOrder', () => {
//     console.log('echo test');
// });
