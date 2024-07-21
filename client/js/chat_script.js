// const socket = io();
// const socket = io('https://iwebbackend.herokuapp.com/');
const socket = io('/');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const onlineSec = document.querySelector('.onlinesection');
const username = [];

const handleCopyMessage = (e) =>{
  var val = e.target.getAttribute('dataAttributes');

  const textArea = document.createElement("textarea");
  textArea.value = val;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
        e.target.innerHTML = 'Copied !!';

    setTimeout(() => {
      e.target.innerHTML = 'Copy Message'
    }, 3000);
  } catch (err) {
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
 
}

var audio = new Audio('./assets/ting.mp3');

const append = (name, message, position) => {

  const messageElement = document.createElement('div');
  if (position == 'center') {
    messageElement.innerHTML = `<span>${name}</span>${message}`;
  }
  else {
    messageElement.innerHTML = `<div>
                                    <div class="sender_name" style="color: rgb(0, 255, 42);">${name}</div> 
                                    <div class="other_options_container">
                                      <span>^</span>
                                      <div class="other_options">
                                        <div dataAttributes="${message}" onclick="handleCopyMessage(event)">Copy Message</div>
                                       </div>
                                    </div>
                                </div> 
                                <div class="message_content">${message}</div>`;

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


const handleSendBtn = () =>{
  let val = messageInput.value.trim();
  if (val) {
    const message = messageInput.value
    append('you', `${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = ""
  }
}
// (send button)
document.querySelector('.send_btn').addEventListener('click',()=>{
handleSendBtn()
})


// enter key to send message
document.getElementById("messageInp").addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleSendBtn()
  }
});


let name = prompt("Enter Your name to Join");
if(!name) name = Math.floor(Math.random()*1000000)

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

function auto_grow(element) {
  element.style.height = "5px";
  element.style.height = (element.scrollHeight) + "px";
}

