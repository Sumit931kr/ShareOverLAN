// const socket = io();
// const socket = io('https://iwebbackend.herokuapp.com/');
const socket = io('/');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const onlineSec = document.querySelector('.onlinesection');
const username = [];


var audio = new Audio('ting.mp3');

const append = (name, message, position) => {

  const messageElement = document.createElement('div');
  if (position == 'center') {
    messageElement.innerHTML = `<span>${name}</span>${message}`;
  }
  else {
    messageElement.innerHTML = `<p>${name}</p>${message}`;

  }
  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
  if (position != 'right') {
    audio.play();
  }
  messageContainer.scrollTop = messageContainer.scrollHeight;
}



const onlineuser = () => {
  
  for (let i = 0; i < username.length; i++) {

  const onlinelight = document.createElement('span');
  const onlinename = document.createElement('span');

  onlinelight.classList.add('dot');
  onlinename.classList.add(username[i]);
    onlinename.innerHTML = username[i]; 
    onlineSec.append(onlinelight);
    onlineSec.append(onlinename);

  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (messageInput.value) {
    const message = messageInput.value
    append('you', `${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ""
  }
})


const name = prompt("Enter Your name to Join");
socket.emit('new-user-joined', name)
if(name){
  append(name,'Joined the chat', 'center')
}


socket.on('user-joined', name => {
  // username.push(name);
  // onlineuser();
  append(`${name}`, '  Joined the chat', 'center');
})

socket.on('receive', data => { 
  append(`${data.name} `, `${data.message}`, 'left');
})

socket.on('left', user => {
  append(`${user.name} `, 'Left the Chat', 'center');
})

const clear = document.getElementById('clear').addEventListener('click',()=>{
  username.splice(0,username.length);
})
