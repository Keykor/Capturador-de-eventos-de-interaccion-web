prevEvent = null;
actEvent = null;
scrollEvent = null;
lastScrollEvent = null;
logs = [];

function mouseMoveActualization(e) {
    actEvent = e;
}
window.addEventListener('mousemove', mouseMoveActualization);

function mouseClickHandler(e) {
    saveLog('mouse click', positionalData())
}
window.addEventListener('click', mouseClickHandler);

function scrollActualization(e) {
    scrollEvent = e;
}
window.addEventListener('scroll', scrollActualization);

var miliseconds = 1000;
var transformation = miliseconds * 0.001;
var prevSpeed = 0;
var speed = 0;
var acceleration = 0;
setInterval(function(){
    if (prevEvent && actEvent && (prevEvent != actEvent)) {
        var movementX=Math.abs(actEvent.screenX-prevEvent.screenX);
        var movementY=Math.abs(actEvent.screenY-prevEvent.screenY);
        //hipotenusa de triangulo para saber movimiento
        var movement=Math.sqrt(movementX*movementX+movementY*movementY);
        // pixeles / segundos
        speed=transformation*movement;
        acceleration=transformation*(speed-prevSpeed);

        const data = positionalData();
        data.speed = speed;
        data.acceleration = acceleration;
        saveLog('mouse movement', data);
    }
    prevEvent = actEvent;
    prevSpeed = speed;

    if (scrollEvent && !(scrollEvent === lastScrollEvent)) { 
        saveLog('scrolling', positionalData());
        lastScrollEvent = scrollEvent;
    }
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

function submitForm(e, form) {
    e.preventDefault();
    const objeto = {};
    for(const pair of new FormData(form)) {
        objeto[pair[0]] = pair[1];
    }
    objeto.logs = logs;
    let xhr = new XMLHttpRequest();
    xhr.onerror = () => {
        alert("Ha ocurrido un error en el envío. Intente nuevamente.");
        form[2].disabled = false;
    };
    xhr.open("POST","http://e523cff0ee29.ngrok.io/logs", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(objeto));
    xhr.onload = function() {
        alert("Sus datos se han enviado correctamente");
        console.log(JSON.stringify(xhr.response));
    };
}

var terminar = document.getElementById('terminar')
terminar.addEventListener('click', function(e) {
    window.removeEventListener('mousemove', mouseMoveActualization);
    window.removeEventListener('click', mouseClickHandler);
    window.removeEventListener('scroll', scrollActualization);

    terminar.disabled = true;

    document.getElementById('form-background').style.visibility = "visible"

    var form = document.getElementById('form-capturador')
    var formButton = document.getElementById('form-button')
    formButton.addEventListener('click', function(e) {
        if (validateForm(form)) {
            formButton.disabled = true;
            submitForm(e, form);
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