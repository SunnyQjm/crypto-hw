const forge = require('node-forge');
const pki = forge.pki;
const io = require('socket.io')(8001);
const {
    generateKeysAndCertification,
    decryptUseAES,
    encryptUseAES,
    dealNegotiatedAESKey,
    dealPullCertification,
    verifyDoubleSignature
} = require('./utils');

const userInfo = {
    // 客户的银行账户信息
    '621745652301254': {
        bankID: '621745652301254',
        password: '123456',
        money: 1000,
    },

    // 商家的银行账户信息
    '621745652301255': {
        bankID: '621745652301254',
        password: '123456',
        money: 20000,
    }
};

// 生成银行使用的公私钥对和证书
const bankPKI = generateKeysAndCertification();

let cBaKey = {};
let cBbKey = {};

function dealTransferAccounts(socket, cBaKey, cBbKey) {
    socket.on('transferAccounts', encrypted => {
        let data = JSON.parse(decryptUseAES(cBbKey.key, cBbKey.iv, encrypted).data);
        data.paymentInformation = JSON.parse(decryptUseAES(cBaKey.key, cBaKey.iv, data.paymentInformation));
        data.paymentInformation.doubleSignature = forge.util.hexToBytes(data.paymentInformation.doubleSignature);

        /**
         {
          toCount: { bankID: '621745652301255', password: '123456' },
          money: 400,
          paymentInformation: {
            bankInfo: { bankID: '621745652301254', password: '123456' },
            commodityInfoMD: '65af9f38d0b446434a288a7d8e872ff5b0ee8321e2de35500a4887eb8634845b',
            doubleSignature: '1862240cd3fd29f63e9f4c3617210e05b7a5dc728ea9c08d244e587c0a6b16260e6943657eaa93298a44e292c51c1fabb488c8eee1bf83c901af164f86a070e2394debe1149f0ede5c5b5d64bb93d8537efe301c6c455f3a28a44560d4babfb84f6089bf84c8266ef4c5c53ef342936c2b4b1a93dee33a3c8b4d7174fede56a592e794569b68a96a549a86785ea163cbae8f75004b82c39c637bcfc72d4595b16ab909cf43f118a7c5b9fadfabb2b810b6ce2ddc76508f0febb1b08a672debfbecd65b081baa54af0369c0c389b89426d48ea9b1c2b2376208e8ede3f7d984fc695e16c25667861aedc317c150e6996794a8e1338f2d2cb1a5186da434b9d6be',
            cert: '...'
          }
        }
         */
        const {
            toCount,
            money,
            paymentInformation
        } = data;

        ///////////////////////////////////////////////////////////////
        //////// 首先验证双重签名
        ///////////////////////////////////////////////////////////////

        const result = verifyDoubleSignature(paymentInformation.bankInfo, paymentInformation.commodityInfoMD,
            paymentInformation.cert, paymentInformation.doubleSignature, true);

        if (result) {
            console.log('双重签名验证成功');

            ///////////////////////////////////////////////////////
            ////// 判断金额是否足够抵扣
            ///////////////////////////////////////////////////////
            if(userInfo[paymentInformation.bankInfo.bankID].money < money) {
                socket.emit('responseTransferAccounts',
                    encryptUseAES(cBbKey.key, cBbKey.iv, JSON.stringify({
                        code: -1,
                        errMsg: '余额不足'
                    })).toHex()
                );
                return;
            }

            console.log('扣款前信息：', userInfo);
            userInfo[toCount.bankID].money += money;
            userInfo[paymentInformation.bankInfo.bankID].money -= money;
            console.log('扣款后信息：', userInfo);
            socket.emit('responseTransferAccounts',
                encryptUseAES(cBbKey.key, cBbKey.iv, JSON.stringify({
                        code: 0,
                        errMsg: ''
                    })
                ).toHex()
            );
        } else {
            console.log('双重签名验证失败');
            socket.emit('responseTransferAccounts',
                encryptUseAES(cBbKey.key, cBbKey.iv, JSON.stringify({
                    code: -1,
                    errMsg: '双重签名验证失败'
                }))
            );
        }

    });
}

io.on('connection', socket => {
    socket.emit('connection');

    ///////////////////////////////////////////////////////
    //////// 处理证书获取请求
    ///////////////////////////////////////////////////////

    dealPullCertification(socket, bankPKI.cert);


    ////////////////////////////////////////////////////////
    //////// 处理秘钥协商
    ////////////////////////////////////////////////////////

    dealNegotiatedAESKey(socket, bankPKI.privateKey, data => {
        switch (data.identity) {
            case 'c-ba':
                cBaKey = data.keys;
                break;
            case 'c-bb':
                cBbKey = data.keys;
                break;
        }
    });

    ////////////////////////////////////////////////////////
    /////// 处理转账
    ////////////////////////////////////////////////////////

    dealTransferAccounts(socket, cBaKey, cBbKey);


    socket.on('disconnect', () => {
    })
});
