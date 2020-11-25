const path=require('path');
const express=require('express');
const http=require('http');
const socketio=require('socket.io');
const { generateMessage, generateLocationMessage }=require('./utils/messages');
const { addUser,removeUser,getUser,getUsersInRoom }=require('./utils/users');
// const Filter=require('bad-words');

const port=process.env.PORT||3000;

const viewpath=path.join(__dirname,'../public');
const app=express();
const server=http.createServer(app);
const io=socketio(server);

app.set('view engine','hbs');
app.set('views',viewpath);
app.use(express.static(path.join(__dirname,'../public')));

io.on('connection',(socket)=>{
    console.log('New WebSocket Connection!!');
    
    socket.on('join',({username,room},callback)=>{

        const{error,user}=addUser({ id:socket.id,username,room })
        if(error){
            return callback(error);
        }

        socket.join(user.room);
        socket.emit('message',generateMessage('Admin','Welcome'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`));
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        });
        callback();

    });

    socket.on('userMessage',(message,callback)=>{
        const user=getUser(socket.id);
        // const filter=new Filter();
        // if(filter.isProfane(message))
        //     return callback('Profanity is not allowed');
        io.to(user.room).emit('message',generateMessage(user.username,message));
        callback();
    });
    socket.on('sendloc',(loc,callback)=>{
        const user=getUser(socket.id);
        io.to(user.room).emit('locmessage',generateLocationMessage(user.username,`https://google.com/maps?q=${loc.lat},${loc.long}`));
        callback();
    });
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            });
        }
    });

});


app.get('',(req,res)=>{
    res.render('index.html');
});
server.listen(port,()=>{
    console.log('Server is up on port '+port);
});