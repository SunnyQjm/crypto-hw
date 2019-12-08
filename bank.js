const forge = require('node-forge');
const io = require('socket.io')(8001);

const userInfo = {
    bankID: '621745652301254',
    password: '123456',
    money: 1000,
};

io.on('connection', socket => {
    socket.emit('test', 111);

    socket.on("")
    socket.on('disconnect', () => {
       console.log('disconnect');
   })
});
