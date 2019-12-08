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
        console.log(data);
    });
    socket.on('disconnect', () => {
        console.log('disconnect');
    })
});
