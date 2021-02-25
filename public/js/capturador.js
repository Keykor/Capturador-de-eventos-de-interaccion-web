previousEvent = null;
actualEvent = null;
scrollEvent = null;
lastScrollEvent = null;
logs = [];

function mouseMoveUpdate(e) {
    actualEvent = e;
}
window.addEventListener('mousemove', mouseMoveUpdate);

function scrollUpdate(e) {
    scrollEvent = e;
}
window.addEventListener('scroll', scrollUpdate);

var miliseconds = 1000;
var seconds = miliseconds * 0.001;
var previousSpeed = 0;
var speed = 0;
var acceleration = 0;
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

//toma el evento del click del mouse
function mouseClickHandler(e) {
    saveLog('mouse click', positionalData())
}
window.addEventListener('click', mouseClickHandler);

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

//desactiva los eventos al tocar el boton terminar y activa el formulario final
var terminar = document.getElementById('terminar')
terminar.addEventListener('click', function(e) {
    window.removeEventListener('mousemove', mouseMoveUpdate);
    window.removeEventListener('click', mouseClickHandler);
    window.removeEventListener('scroll', scrollUpdate);

    terminar.disabled = true;

    document.getElementById('form-background').style.visibility = "visible"

    var form = document.getElementById('form-capturador')
    var formButton = document.getElementById('form-button')
    formButton.addEventListener('click', function(e) {
        if (validateForm(form)) {
            formButton.disabled = true;
            submitForm(e, createObjectToSend(form));
        }
    })
    form.style.visibility = "visible"
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
    for(const pair of new FormData(form)) {
        objeto[pair[0]] = pair[1];
    }
    objeto.logs = logs;
}

function submitForm(e, object) {
    e.preventDefault();
    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        alert("Ha ocurrido un error en el envío. Intente nuevamente.");
        form[2].disabled = false;
    };
    xhr.open("POST","https://localhost:3000/logs", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(object));
    xhr.onload = function() {
        alert("Sus datos se han enviado correctamente");
        console.log(JSON.stringify(xhr.response));
    };
}