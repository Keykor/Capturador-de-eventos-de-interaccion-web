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
    xhr.open("POST","http://localhost:3000/logs", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(objeto));
    xhr.onload = function() {
        alert("Sus datos se han enviado correctamente");
        console.log(JSON.stringify(xhr.response));
    };
}

var terminar = document.createElement("button");
terminar.setAttribute("id","terminar");
terminar.innerHTML = "Terminar formulario";
terminar.addEventListener('click', function(e) {
    window.removeEventListener('mousemove', mouseMoveActualization);
    window.removeEventListener('click', mouseClickHandler);
    window.removeEventListener('scroll', scrollActualization);

    var form = document.createElement("form");
    form.setAttribute("onclick","return false");

    var ageInput = document.createElement("input");
    ageInput.setAttribute('type',"number");
    ageInput.setAttribute('id',"formAge");
    ageInput.setAttribute('name',"age");
    ageInput.setAttribute('min',"10");
    ageInput.setAttribute('max',"100");
    ageInput.value = 18;
    
    var ageInputLabel = document.createElement("label");
    ageInputLabel.setAttribute('for',"age");
    ageInputLabel.innerHTML = "Edad: ";

    var ageGroup = document.createElement("p");
    ageGroup.appendChild(ageInputLabel);
    ageGroup.appendChild(ageInput)
    
    var select = document.createElement("select");
    select.setAttribute('id',"formSelect");
    select.setAttribute('name',"level");
    select.required = true;
    
    for(let i = 1; i < 4; i++) {
        var opt = document.createElement("option");
        opt.setAttribute('value', i);
        opt.innerHTML = i;
        select.appendChild(opt);
    }
    
    var selectLabel = document.createElement("label");
    selectLabel.setAttribute('for',"level");
    selectLabel.innerHTML = "Nivel tecnológico: ";

    var selectGroup = document.createElement("p");
    selectGroup.appendChild(selectLabel);
    selectGroup.appendChild(select)
    
    var submitButton = document.createElement("button");
    submitButton.setAttribute('type','submit');
    submitButton.innerHTML = "Enviar";
    submitButton.addEventListener('click', function(e) {
        if (validateForm(form)) {
            submitButton.disabled = true;
            submitForm(e, form);
        }
    })

    var title = document.createElement("p");
    title.innerHTML = "Datos finales".bold().fontsize(5);
    
    form.appendChild(title);
	form.appendChild(ageGroup);
    form.appendChild(selectGroup);
    form.appendChild(submitButton);

    terminar.disabled = true;
    document.getElementsByTagName('body')[0].appendChild(form);
})
document.getElementsByTagName('body')[0].appendChild(terminar);

function validateForm(form) {
    var age = form[0].value;
    if (age == "" || age < 1 || age > 100) {
        alert("Ingrese una edad válida");
        return false;
    }
    return true;
}