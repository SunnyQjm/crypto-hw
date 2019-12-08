const forge = require('node-forge');
const io = require('socket.io')(8001);
const {
    generateKeysAndCertification,
    publicKey
} = require('./utils');

const userInfo = {
    bankID: '621745652301254',
    password: '123456',
    money: 1000,
};

// 生成银行使用的公私钥对和证书
const bankPKI = generateKeysAndCertification();

io.on('connection', socket => {
    socket.emit('test', 111);

    // 监听获取证书的请求
    socket.on("getBankCertification", () => {

        // 将银行的证书返回
        socket.emit("responseBankCertification", {
            cert: bankPKI.cert
        });
    });


    socket.on('disconnect', () => {
       console.log('disconnect');
   })
});
