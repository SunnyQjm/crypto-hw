const ioClient = require("socket.io-client");
const forge = require('node-forge');
const pki = forge.pki;
const {
    generateKeysAndCertification,
    encryptUseAES,
    decryptUseAES,
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

        // 传送给银行的信息（传给商家）
        const dataToBank = {
            bankInfo,
            commodityInfoMD,
            doubleSignature: forge.util.bytesToHex(doubleSignature),            // 先将签名数据转为hex，用JSON进行转换的时候不会数据丢失
            cert: forge.pki.certificateToPem(customerPKI.cert)
        };

        // 传递给商家的信息（包含加密后传递给银行的信息）
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

        let isResponse = false;
        // 等待下订单的结果
        businessSocket.on('responsePlacingOrder', encrypted => {
            isResponse = true;
            businessSocket.close();
            const data = JSON.parse(decryptUseAES(cBuKey.key, cBuKey.iv, encrypted));
            if(data.code === 0) {
                resolve();
            } else {
                reject(data.errMsg)
            }
            console.log('下单结果', data);
        });

        setTimeout(() => {
            businessSocket.open();
        }, 2000);
    });
}

pullCertification(bankSocket)
//////////////////////////////////////
////// 获取银行证书
//////////////////////////////////////
    .then(bankRes => {
        console.log('获取到银行证书并验证成功');
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
        console.log('获取到商家证书并验证成功');
        return negotiatedAESKey(businessSocket, customerPKI.cert, customerPKI.privateKey, pki.certificateFromPem(certs.businessCert).publicKey, 'c-bu')
            .then(res => {
                return {
                    ...certs,
                    cBuKey: res
                }
            });
    })
    .catch(err => {
        console.log('获取到商家证书但验证失败', err);
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
        console.log('与银行协商秘钥成功');
        return buyCommodity(bankInfo, 1, 4, res.businessCert, res.bankCert, res.cBuKey, res.cBaKey)
            .then(res => {
                return {
                    commodityId: 1,
                    count: 4,
                };
            });
    })
    .catch(err => {
        console.log(err);
    })
    .then(res => {
        console.log(`购买商品 id = ${res.commodityId} x ${res.count} 成功`);
    })
    .catch(err => {
        console.log('购买商品失败: ', err);
    });
