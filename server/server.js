const app = require('express')()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
})

io.on('connection', socket => {
    console.log('connection')
    // добавим модель
    socket.on('addModel', payload => {
        io.emit('addModel', payload)
    });

    socket.on('deleteModel', payload => {
        // console.log(' getAction server: ')
        io.emit('deleteModel', payload)
    });



    socket.on('changeVisible', payload => {
        // console.log(' getAction server: ')
        io.emit('changeVisible', payload)
    });

    socket.on('replaceModel', payload => {
        io.emit('replaceModel', payload)
    });
    socket.on('changeTexture', payload => {
        io.emit('changeTexture', payload)
    });


    socket.on('getNewPosition', payload => {
        io.emit('getNewPosition', payload)
    });
        socket.on('getLock', payload => {
            io.emit('getLock', payload)
    });
})

server.listen(7000, () => {
    console.log('I am listening at port: 3000)');
})

