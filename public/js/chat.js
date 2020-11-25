const socket=io();
//Elements
const $messageForm=document.querySelector('#message-chat');
const $messageFormInput=document.querySelector('#message');
const $messageFormButton=document.querySelector('#sendmessage');
const $locButton=document.querySelector('#sendloc');
const $messages=document.querySelector('#messages');

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locmessage=document.querySelector('#locmessage-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;
//Options
const { username,room } = Qs.parse(location.search,{ ignoreQueryPrefix:true });

const autoscroll=()=>{
    //New message element
    const $newMessage=$messages.lastElementChild;

    //Height of the new message
    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visbleHeight=$messages.offsetHeight;

    //Height of Messages container
    const containerHeight=$messages.scrollHeight;

    //How far i have scrolled
    const scrollOffset=$messages.scrollTop + visbleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight;
    }
}

socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});

socket.on('locmessage',(url)=>{
    console.log(url); 
    const html=Mustache.render(locmessage,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
});

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML=html;
});

document.querySelector('#message-chat').addEventListener('submit',(e)=>{
    e.preventDefault();
    //disable
    $messageFormButton.setAttribute('disabled','disabled');
    const message=e.target.elements.message.value;
    socket.emit('userMessage',message,(error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error)
            console.log(error)
        else
            console.log('Message Delivered');
    });
});

$locButton.addEventListener('click',()=>{
    $locButton.setAttribute('disabled','disabled');
    if(!navigator.geolocation)
        return alert('Geolocation not supported by your browser!!');
    navigator.geolocation.getCurrentPosition((pos)=>{
        socket.emit('sendloc',{lat:pos.coords.latitude, long:pos.coords.longitude},()=>{
            $locButton.removeAttribute('disabled');
            console.log('Location Delivered!!');
        });
        console.log(pos);
    });
});

socket.emit('join',{ username,room },(error)=>{
    if(error){
        alert(error);
        location.href='/'
    }
});