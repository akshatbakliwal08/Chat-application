const users=[];
const addUser=({ id,username,room })=>{
    //Clean the data
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();

    //Validate the data
    if(!username || !room){
        return {
            error:'Username and Room are required!'
        }
    }

    //Check for existing user
    const existingUser=users.find((user)=>{
        return user.room===room && user.username==username;
    });
    
    //Validate username
    if(existingUser){
        return {
            error:'Username in use'
        }
    }
    
    //Store user
    const user={ id,username,room }
    users.push(user);
    return { user }
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id);
    if(index!=-1){
        return users.splice(index,1)[0];
    }
}

const getUser=(id)=>{
    const user=users.find((user)=>user.id===id);
    return user;
}

const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase();
    return users.filter((user)=>user.room==room);
}

addUser({
    id:22,
    username:'Akshat  ',
    room:'1'
});
addUser({
    id:33,
    username:'Bakli',
    room:'1'
});
const user=getUser(22);
const roomusers=getUsersInRoom('1');
console.log(user);
console.log(roomusers);

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}