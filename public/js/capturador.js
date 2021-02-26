var previousEvent = null;
var actualEvent = null;
var scrollEvent = null;
var lastScrollEvent = null;
var logs = [];
var miliseconds = 1000;
var seconds = miliseconds * 0.001;
var previousSpeed = 0;
var speed = 0;
var acceleration = 0;

function mouseMoveUpdate(e) {
    actualEvent = e;
}

function scrollUpdate(e) {
    scrollEvent = e;
}

function mouseClickHandler(e) {
    saveLog('mouse click', positionalData())
}

function startEventCapture() {
    window.addEventListener('mousemove', mouseMoveUpdate);
    window.addEventListener('scroll', scrollUpdate);
    window.addEventListener('click', mouseClickHandler);
    //intervalo para capturar eventos de movimiento y scrolling
    setInterval(function(){
        if (previousEvent && actualEvent && (previousEvent != actualEvent)) {
            var movementX=Math.abs(actualEvent.screenX-previousEvent.screenX);
            var movementY=Math.abs(actualEvent.screenY-previousEvent.screenY);
            //hipotenusa de triangulo para saber movimiento
            var movement=Math.sqrt(movementX*movementX+movementY*movementY);
            // pixeles / segundos
            speed=seconds*movement;
            acceleration=seconds*(speed-previousSpeed);

            const data = positionalData();
            data.speed = speed;
            data.acceleration = acceleration;
            saveLog('mouse movement', data);
        }
        previousEvent = actualEvent;
        previousSpeed = speed;

        if (scrollEvent && !(scrollEvent === lastScrollEvent)) { 
            saveLog('scrolling', positionalData());
            lastScrollEvent = scrollEvent;
        }
    },miliseconds);
}

//guarda el Log en el array, poniendo su tipo, hora y data posicional
function saveLog(newType, newData) {
    logs.push({
        type: newType,
        timestamp: Date.now(),
        data: newData
    })
}

//crea objeto de la data de posicion del mouse
function positionalData() {
    return {
        posX: actualEvent.clientX,
        clientY: actualEvent.clientY,
        pageY: actualEvent.pageY,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight
    }
}

//muestra mensaje inicial y comienza captura al tocar el boton
var startButton = document.getElementById('start-button');
var startMessage = document.getElementById('start-message');
startMessage.style.visibility = "visible";
startButton.addEventListener('click', function(e) {
    document.getElementById('message-background').style.visibility = "hidden";
    startMessage.style.visibility = "hidden";
    startEventCapture()
})

//desactiva los eventos al tocar el boton finish y activa el formulario final
var finish = document.getElementById('finish')
var endMessage = document.getElementById('end-message');
var sendButton = document.getElementById('send-button');
finish.addEventListener('click', function(e) {
    window.removeEventListener('mousemove', mouseMoveUpdate);
    window.removeEventListener('click', mouseClickHandler);
    window.removeEventListener('scroll', scrollUpdate);

    finish.disabled = true;

    document.getElementById('message-background').style.visibility = "visible";

    sendButton.addEventListener('click', function(e) {
        if (validateForm(endMessage)) {
            sendButton.disabled = true;
            submitForm(e, createObjectToSend(endMessage));
        }
    })
    endMessage.style.visibility = "visible";
})

function validateForm(form) {
    var age = form[0].value;
    if (age == "" || age < 1 || age > 100) {
        alert("Ingrese una edad válida");
        return false;
    }
    return true;
}

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
    e.preventDefault();
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