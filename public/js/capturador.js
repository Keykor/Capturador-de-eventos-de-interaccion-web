/* ---------- SECCION DE MENSAJES Y JUEGO ----------*/

const messageBackground = document.getElementById('message-background')

//muestra mensaje inicial y comienza captura al tocar el boton
const startButton = document.getElementById('start-button');
const startMessage = document.getElementById('start-message');
startMessage.style.visibility = "visible";
startButton.addEventListener('click', startGame)

function startGame() {
    messageBackground.style.visibility = "hidden";
    startMessage.style.visibility = "hidden";
    startEventCapture()
}

//desactiva los eventos al tocar el boton finish y activa el formulario final
const finish = document.getElementById('finish')
const endMessage = document.getElementById('end-message');
const sendButton = document.getElementById('send-button');
finish.addEventListener('click', endGame)

function endGame() {
    stopCapture()
    finish.disabled = true;
    messageBackground.style.visibility = "visible";
    endMessage.style.visibility = "visible";
    sendButton.addEventListener('click', submitIfValidate);
}

function submitIfValidate(e) {
    e.preventDefault();
    if (validateForm(endMessage)) {
        sendButton.disabled = true;
        submitForm(createObjectToSend(endMessage));
    }
}

function validateForm(form) {
    var age = form[0].value;
    if (age == "" || age < 1 || age > 100) {
        alert("Ingrese una edad válida");
        return false;
    }
    return true;
}



/* ---------- SECCION DE CAPTURADOR Y EVENTOS ----------*/

var previousMoveEvent = null;
var recentMoveEvent = null;
var recentScrollEvent = null;
var lastScrollEvent = null;
var logs = [];
const miliseconds = 1000;
const seconds = miliseconds * 0.001;
var previousSpeed = 0;
var speed = 0;
var acceleration = 0;

window.addEventListener('mousemove', mouseMoveUpdate);
window.addEventListener('scroll', scrollUpdate);
function startEventCapture() {
    window.addEventListener('click', captureMouseClick);
    //intervalo para capturar eventos de movimiento y scrolling
    setInterval(captureMovementAndScrolling,miliseconds);
}

function stopCapture() {
    window.removeEventListener('mousemove', mouseMoveUpdate);
    window.removeEventListener('click', captureMouseClick);
    window.removeEventListener('scroll', scrollUpdate);
}

function mouseMoveUpdate(e) {
    recentMoveEvent = e;
}

function scrollUpdate(e) {
    recentScrollEvent = e;
}

function captureMouseClick(e) {
    saveLog('mouse click', positionalData(recentMoveEvent))
}

function captureMouseMovement() {
    var actualEvent = recentMoveEvent;
    var previousEvent = previousMoveEvent;
    if (previousEvent && actualEvent && (previousEvent != actualEvent)) {
        var movementX=Math.abs(actualEvent.screenX-previousEvent.screenX);
        var movementY=Math.abs(actualEvent.screenY-previousEvent.screenY);
        //hipotenusa de triangulo para saber movimiento
        var movement=Math.sqrt(movementX*movementX+movementY*movementY);
        // pixeles / segundos
        speed=seconds*movement;
        acceleration=seconds*(speed-previousSpeed);

        const data = positionalData(actualEvent);
        data.speed = speed;
        data.acceleration = acceleration;
        saveLog('mouse movement', data);
    }
    previousMoveEvent = actualEvent;
    previousSpeed = speed;
}

function captureScrolling() {
    var actualEvent = recentScrollEvent;
    if (actualEvent && !(actualEvent === lastScrollEvent)) { 
        saveLog('scrolling', positionalData(recentMoveEvent));
        lastScrollEvent = actualEvent;
    }
}

function captureMovementAndScrolling() {
    captureMouseMovement();
    captureScrolling();
}

//crea objeto de la data de posicion del mouse
function positionalData(e) {
    return {
        posX: e.clientX,
        clientY: e.clientY,
        pageY: e.pageY,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight
    }
}

//guarda el Log en el array, poniendo su tipo, hora y data posicional
function saveLog(newType, newData) {
    logs.push({
        type: newType,
        timestamp: Date.now(),
        data: newData
    })
}



/* ---------- SECCION DE ENVIO DE DATOS ----------*/

//transforma los datos del form y logs en un objeto
function createObjectToSend(form) {
    var newObject= {};
    for(const pair of new FormData(form)) {
        newObject[pair[0]] = pair[1];
    }
    newObject.logs = logs;
    console.log(newObject)
    return newObject;
}

function submitForm(e, object) {
    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        alert("Ha ocurrido un error en el envío. Intente nuevamente.");
        sendButton.disabled = false;
    };
    xhr.open("POST","https://localhost:3000/logs", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(object));
    xhr.onload = function() {
        alert("Sus datos se han enviado correctamente.");
        document.getElementById('thanks-message').style.visibility = "visible";
        endMessage.style.visibility = "hidden";
        console.log(JSON.stringify(xhr.response));
    };
}