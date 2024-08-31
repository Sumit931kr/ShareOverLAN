
const socket = io('/');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector(".container");
const onlineSec = document.querySelector('.onlinesection');
const pinMessage = document.getElementById('pin_message');
const username = [];
var audio = new Audio('./assets/ting.mp3');

// message Counter
var messageCounter = 1;

// handle copy message funxtion
const handleCopyMessage = (e) => {
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

// take to the pinmessage 
const takeMeToMessage = () => {
  let messageId = pinMessage.getAttribute('messid')
  console.log(messageId);
  
  const link = document.createElement('a');

  // Set the href attribute
  link.href = messageId;
  
  // Make the link invisible
  link.style.display = 'none';
  
  console.log(link)
  // Add the link to the document body
  document.body.appendChild(link);
  
  // Programmatically click the link
  link.click();
  
  // Remove the link from the document
  document.body.removeChild(link);

  const targetElement = document.getElementById(messageId);
      
  if (targetElement) {
    // Get the element's position relative to the viewport
    const rect = targetElement.getBoundingClientRect();
    
    // Calculate the scroll position
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Scroll to the element with an offset (e.g., 20px from the top)
    const offset = 240;
    const targetPosition = rect.top + scrollTop - offset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }

}

const handleCancelPinMessage = (event) => {
console.log(event.target)
event.target.parentElement.innerHTML = ""
}

// handle pin message function
const handlePinMessage = (e, messageCounter) => {
  let element = e.target.parentElement.parentElement.parentElement.nextElementSibling 
  console.log(element.innerText);
  pinMessage.innerHTML = `<b>Pin:</b> ${element.innerText}`;
  pinMessage.setAttribute('messId', `#messageCount-${messageCounter}`)
  let div = document.createElement('div');
  div.classList.add('pin_message_cancel');
  div.innerHTML = "X";
  div.setAttribute('onclick',"handleCancelPinMessage(event)");
pinMessage.append(div);
 


}





// append the messgae in UI
const append = (name, message, position) => {

  const messageElement = document.createElement('div');
  if (position == 'center') {
    messageElement.innerHTML = `<span>${name}</span>${message}`;
  }
  else {
    messageElement.innerHTML = `<div>
                                    <div class="sender_name">${name}</div> 
                                    <div class="other_options_container">
                                      <span>^</span>
                                      <div class="other_options">
                                        <div dataAttributes="${message}" onclick="handleCopyMessage(event)">Copy Message</div>
                                        <div onclick="handlePinMessage(event,${messageCounter})">Pin Message</div>
                                       </div>
                                    </div>
                                </div> 
                                <div class="message_content">${message}</div>`;

  }

  messageElement.classList.add('message');
  messageElement.classList.add(position);
  messageElement.setAttribute('id', `messageCount-${messageCounter}`)
  messageContainer.append(messageElement);
  if (position != 'right') {
    audio.play();
  }
  messageContainer.scrollTop = messageContainer.scrollHeight;

  messageCounter++;
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

// handle send button
const handleSendBtn = () => {
  let val = messageInput.value.trim();
  if (val) {
    const message = val
    append('you', `${message}`, 'right');
    socket.emit('send', message);


    messageInput.value = "";
    setTimeout(() => {
      
      const value = messageInput.value;
      messageInput.value = value.slice(0, -1);
    }, 100);
  }
  
}
// (send button)
document.querySelector('.send_btn').addEventListener('click', () => {
  handleSendBtn();
})


// enter key to send message
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleSendBtn();
  }
});


let name = prompt("Enter Your name to Join");
// let name = "sumit"
if (!name) name = "random"+ Math.floor(Math.random() * 1000000);
messageInput.focus()

socket.emit('new-user-joined', name)
if (name) {
  append(name, 'Joined the chat', 'center')
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
  console.log(user)
  append(`${user} `, 'Left the Chat', 'center');
})

// const clear = document.getElementById('clear').addEventListener('click',()=>{
//   username.splice(0,username.length);
// })

function auto_grow(element) {
  // element.style.height = "40px";
  element.style.height = (element.scrollHeight) + "px";
}

