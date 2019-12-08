const forge = require('node-forge');
const io = require('socket.io')(8002);

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

io.on('connection', socket => {
    socket.emit('connection', 111);

    socket.on('placingOrder', data => {

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

        if(result) {
            console.log('验证通过');
        } else {
            console.log('验证失败');
        }
    });
    socket.on('disconnect', () => {
        console.log('disconnect');
    })
});
