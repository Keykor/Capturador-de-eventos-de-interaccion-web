prevEvent = null;
actEvent = null;
logs = []

function takeMouseMetrics(e) {
    //conseguir posicion del mouse local en base a la ventana
    //console.log('clientX:', e.clientX, '; clientY:', e.clientY);
    document.getElementById('clientX-value').textContent = e.clientX;
    document.getElementById('clientY-value').textContent = e.clientY;

    //conseguir posicion del mouse en base a la página
    //console.log('pageX:', e.pageX, '; pageY:', e.pageY);
    document.getElementById('pageX-value').textContent = e.pageX;
    document.getElementById('pageY-value').textContent = e.pageY;
    
    //conseguir el tamaño de la ventana
    //console.log('outerWidth:', window.outerWidth, '; outerHeight:', window.outerHeight);
    document.getElementById('screenX-value').textContent = window.outerWidth;
    document.getElementById('screenY-value').textContent = window.outerHeight;
    
    //conseguir el nivel de scroll y tamaño del scroll
    //console.log('scrollY:', window.scrollY, '; scrollHeight:', document.documentElement.scrollHeight);
    document.getElementById('scrollY-value').textContent = window.scrollY;
    document.getElementById('scrollHeight-value').textContent = document.documentElement.scrollHeight;
}

window.addEventListener('mousemove', function (e) {
    actEvent = e;
})

window.addEventListener('click', function(e) {
    log = {
        type: 'mouse click',
        timestamp: Date.now()
    }
    saveLog(log)
})

window.addEventListener('scroll', function(e) {
    log = {
        type: 'scrolling',
        timestamp: Date.now()
    }
    saveLog(log)
})

var miliseconds = 1000;
var transformation = miliseconds * 0.001;
var prevSpeed = 0;
var speed = 0;
var acceleration = 0;
setInterval(function(){
    if (prevEvent && actEvent) {
        //takeMouseMetrics(actEvent);
        var movementX=Math.abs(actEvent.screenX-prevEvent.screenX);
        var movementY=Math.abs(actEvent.screenY-prevEvent.screenY);
        //hipotenusa de triangulo para saber movimiento
        var movement=Math.sqrt(movementX*movementX+movementY*movementY);
        // pixeles / segundos
        speed=transformation*movement;
        //console.log('speed:', speed);
        acceleration=transformation*(speed-prevSpeed);
        //console.log('acceleration:', acceleration);
    }
    prevEvent = actEvent;
    prevSpeed = speed;

    log = {
        type: 'mouse movement',
        timestamp: Date.now(),
        data: {
            speed: speed,
            acceleration: acceleration,
            posX: actEvent.clientX,
            clientY: actEvent.clientY,
            pageY: actEvent.pageY,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            scrollY: window.scrollY,
            scrollHeight: document.documentElement.scrollHeight
        }
    }
    saveLog(log)
},miliseconds);

function saveLog(obj) {
    console.log(obj);
    logs.push(obj)
    let xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/logs", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(obj));
    xhr.onload = function() {
        console.log(JSON.stringify(xhr.response))
    };
}