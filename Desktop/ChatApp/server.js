const path = require('path');
const http = require('http');

const express = require('express');

const socketio = require('socket.io')
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeaves, getRoomUser} = require('./utils/user')
const app = express();

const server = http.createServer(app)
const io = socketio(server)
//set static folder

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatApp Bot'

//run when a client connects

io.on('connection', socket => {

    socket.on('joinRoom', ({username,room})=>{
   const user = userJoin(socket.id, username, room)
     socket.join(user.room)

     //welcome current user
    socket.emit('message', formatMessage(botName, 'welcome to the chatapp platform'));

     //Broadcast when a client connects
        
        
    socket.broadcast
        .to(user.room)
        .emit(
            'message', formatMessage(botName, `${user.username} has joined the chat`));

     //send users and room info
     io.to(user.room).emit('roomusers', {
         room:user.room,
         users:getRoomUser(user.room)
     })
    
    });
    
//listen to chat chatMessage

socket.on('chatMessage',msg=>{
    const user = getCurrentUser(socket.id);
    io.emit('message',formatMessage(user.username, msg))
})
//when a client disconnect

socket.on('disconnect', ()=>{
    const user = userLeaves(socket.id);
 
    if(user){
        io.to(user.room).
        emit('message',formatMessage(botName, `${user.username} has left`))

         //send users and room info
     io.to(user.room).emit('roomusers', {
        room:user.room,
        users:getRoomUser(user.room)
    })

    }

    
});
});

const PORT = 3000||Process.env.PORT;

server.listen(PORT, console.log(`Server running on port ${PORT}`));