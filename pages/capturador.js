prevEvent = null;
actEvent = null;
logs = []

window.addEventListener('mousemove', function (e) {
    actEvent = e;
})

window.addEventListener('click', function(e) {
    saveLog('mouse click', positionalData())
})

window.addEventListener('scroll', function(e) {
    saveLog('scrolling', positionalData())
})

var miliseconds = 2500;
var transformation = miliseconds * 0.001;
var prevSpeed = 0;
var speed = 0;
var acceleration = 0;
setInterval(function(){
    if (prevEvent && actEvent) {
        var movementX=Math.abs(actEvent.screenX-prevEvent.screenX);
        var movementY=Math.abs(actEvent.screenY-prevEvent.screenY);
        //hipotenusa de triangulo para saber movimiento
        var movement=Math.sqrt(movementX*movementX+movementY*movementY);
        // pixeles / segundos
        speed=transformation*movement;
        acceleration=transformation*(speed-prevSpeed);
    }
    prevEvent = actEvent;
    prevSpeed = speed;

    const data = positionalData();
    data.speed = speed;
    data.acceleration = acceleration;
    saveLog('mouse movement', data)
},miliseconds);

function saveLog(newType, newData) {
    logs.push({
        type: newType,
        timestamp: Date.now(),
        data: newData
    })
}

function positionalData() {
    return {
        posX: actEvent.clientX,
        clientY: actEvent.clientY,
        pageY: actEvent.pageY,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight
    }
}

//ENVIO DE DATOS
setInterval(function() {
    //uso la funcion splice con 0 para cortar y borrar el array atómicamente
    //si lo hiciera en dos pasos tendría problemas de memoria compartida
    const logsToSend = logs.splice(0);
    let xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/logs", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(logsToSend));
    xhr.onload = function() {
        console.log(JSON.stringify(xhr.response))
    };
}, 5000)
