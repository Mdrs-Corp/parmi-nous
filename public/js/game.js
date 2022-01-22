const socket = io();
socket.emit('initialization', gameId, playerId);

// chat
const chat = document.querySelector('#chat-box');
const messageInput = document.querySelector('#message-input');

const sendMessage = () => {
    const content = messageInput.value.trim();
    messageInput.value = '';

    if (content.toLowerCase() === '!start') // TEMPORAIRE
        socket.emit('start');

    if (content !== '')
        socket.emit('message', content);
}

const displayMessage = (sender, content) => {
    const message = document.createElement('p');
    message.className = 'message';

    const senderSpan = document.createElement('span');
    senderSpan.textContent = `${sender}: `;
    const text = document.createTextNode(content);

    message.appendChild(senderSpan);
    message.appendChild(text);
    chat.appendChild(message);
}

const displayEvent = (content, type = 'event') => {
    const event = document.createElement('p');
    event.className = type;
    event.textContent = content;

    chat.appendChild(event);
}

messageInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')
        sendMessage();
})

socket.on('message', (sender, content) => displayMessage(sender, content));
socket.on('event', (content, type) => displayEvent(content, type));


// bindings
const gameWindow = document.querySelector('#game-window');
const bindings = { left: 'q', right: 'd', up: 'z', down: 's', interact: 'i' };
const inputs = { left: false, right: false, up: false, down: false };
const direction = { x: 0, y: 0 };

gameWindow.addEventListener('keydown', e => {
    if (e.repeat) return;
    let update = false;

    if (e.key === '*')
        debug = !debug;

    switch (e.key) {
        case bindings.left:
            inputs.left = true;
            update = true;
            break;
        case bindings.right:
            inputs.right = true;
            update = true;
            break;
        case bindings.up:
            inputs.up = true;
            update = true;
            break;
        case bindings.down:
            inputs.down = true;
            update = true;
            break;
    }

    if (update)
        socket.emit('update-direction', inputs.right - inputs.left, inputs.down - inputs.up);
})

gameWindow.addEventListener('keyup', e => {
    let update = false;

    switch (e.key) {
        case bindings.left:
            inputs.left = false;
            update = true;
            break;
        case bindings.right:
            inputs.right = false;
            update = true;
            break;
        case bindings.up:
            inputs.up = false;
            update = true;
            break;
        case bindings.down:
            inputs.down = false;
            update = true;
            break;
    }

    if (update)
        socket.emit('update-direction', inputs.right - inputs.left, inputs.down - inputs.up);
})

gameWindow.addEventListener('focusout', () => {
    inputs.left = false;
    inputs.right = false;
    inputs.up = false;
    inputs.down = false;
    
    socket.emit('update-direction', inputs.right - inputs.left, inputs.down - inputs.up);
})