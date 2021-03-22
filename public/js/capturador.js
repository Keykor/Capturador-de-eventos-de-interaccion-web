const MILISECONDS = 200;
const URLTOSEND = "https://encuestanews.tk/logs"

/* ---------- SECCION DE MENSAJES Y JUEGO ----------*/
class Game {

    constructor(document) {
        this.messages = ["Bienvenido", "¡Muy bien!", "Ya casi termina"]
        this.attempt = 0
        this.logs = []

        this.logger = new Logger(MILISECONDS);
        this.sender = new Sender(URLTOSEND);
        
        this.messageBackground = document.getElementById('message-background');
        
        this.selectNewHeader();

        //muestra mensaje inicial y comienza captura al tocar el boton
        this.startButton = document.getElementById('start-button');
        this.startMessage = document.getElementById('start-message');
        this.startMessageTitle = document.getElementById('start-message-title');
        this.startMessage.style.visibility = "visible";
        this.startButton.addEventListener('click', this.startAttempt)

        //desactiva los eventos al tocar el header seleccionado y activa el formulario final
        this.endMessage = document.getElementById('end-message');
        this.sendButton = document.getElementById('send-button');
        
    }

    selectNewHeader() {
        this.selectedHeader = selectRandomInArray(document.getElementsByTagName("H5"));
        document.getElementById('selected-header').innerText = this.selectedHeader.innerText;
        this.selectedHeader.addEventListener('click', this.endAttempt);
    }

    //los handlers son funciones anonimas para que el this se refiera al objeto
    startAttempt = e => {
        this.messageBackground.style.visibility = "hidden";
        this.startMessage.style.visibility = "hidden";
        this.logger.startEventCapture()
    }

    endAttempt = e => {
        this.logger.stopCapture();
        this.messageBackground.style.visibility = "visible";
        this.attempt++;
        this.logs.push(this.logger.logs);
        this.logger = new Logger(MILISECONDS);
        if (this.attempt < 3) {
            this.selectNewHeader();
            this.startMessageTitle.innerText = this.messages[this.attempt];
            this.startMessage.style.visibility = "visible";
        }
        else {
            this.logger.startEventCapture();
            this.selectedHeader.removeEventListener('click', this.endAttempt);   
            this.sendButton.addEventListener('click', this.submitIfValidate);
            this.endMessage.style.visibility = "visible";
        } 
    }

    submitIfValidate = e => {
        e.preventDefault();
        if (this.validateEndMessage()) {
            this.sendButton.disabled = true;
            if (!this.logger.isStopped) {
                this.logger.stopCapture();
                this.logs.push(this.logger.logs);
            }
            this.sender.submitForm(this.transformEndMessage(), this.sendButton);
        }
    }

    //transforma los datos del form y logs en un objeto
    transformEndMessage() {
        var newObject= {};
        for(const pair of new FormData(this.endMessage)) {
            newObject[pair[0]] = pair[1];
        }
        newObject.logs = this.logs;
        return newObject;
    }

    validateEndMessage() {
        var age = (this.endMessage.value);
        if (age == "" || age < 1 || age > 100) {
            alert("Ingrese una edad válida");
            return false;
        }
        return true;
    }
}

function selectRandomInArray(array) {
    return array[Math.floor(Math.random() * array.length)]
}



/* ---------- SECCION DE CAPTURADOR Y EVENTOS ----------*/
class Logger {
    constructor(miliseconds) {
        this.isStopped = true;

        this.previousMouseEvent = null;
        this.recentMouseEvent = null;
        this.recentScrollEvent = null;
        this.lastScrollEvent = null;
        this.logs = [];
        this.seconds = miliseconds * 0.001;
        this.miliseconds = miliseconds;
        this.previousSpeed = 0;
        this.previousAcceleration = 0;
        window.scroll(0,0)
        window.addEventListener('mousemove', this.mouseMoveUpdate);
        window.addEventListener('scroll', this.scrollUpdate);
    }

    startEventCapture() {
        this.isStopped = false;
        window.addEventListener('click', this.captureMouseClick);
        //intervalo para capturar eventos de movimiento y scrolling
        this.interval = setInterval(this.captureMovementAndScrolling, this.miliseconds);
    }

    stopCapture() {
        clearInterval(this.interval);
        window.removeEventListener('mousemove', this.mouseMoveUpdate);
        window.removeEventListener('click', this.captureMouseClick);
        window.removeEventListener('scroll', this.scrollUpdate);
        this.captureMouseClick(this.recentMouseEvent);
        this.isStopped = true;
    }

    captureMouseMovement() {
        let actualEvent = this.recentMouseEvent;
        let previousEvent = this.previousMouseEvent;
        if (actualEvent) {
            if (previousEvent) {
                let movementX=Math.abs(actualEvent.screenX-previousEvent.screenX);
                let movementY=Math.abs(actualEvent.screenY-previousEvent.screenY);
                //hipotenusa de triangulo para saber movimiento
                let movement=Math.sqrt(movementX*movementX+movementY*movementY);
                // pixeles / segundos (estáticos del capturador)
                let speed=movement/this.seconds;
                let acceleration=(speed-this.previousSpeed)/this.seconds;
                //para no guardar tantos eventos iguales pero si el que desacelera y el proximo
                if (previousEvent != actualEvent || this.previousAcceleration != 0) {
                    this.saveMouseMovementLog(actualEvent, speed, acceleration);
                }
                this.previousAcceleration = acceleration;
                this.previousSpeed = speed;
            }
            else {
                //para el caso de inicio
                this.saveMouseMovementLog(actualEvent, 0, 0);
                this.previousAcceleration = 0;
                this.previousSpeed = 0;
            }
            this.previousMouseEvent = actualEvent;
        }
    }

    saveMouseMovementLog(actualEvent, speed, acceleration) {
        const data = this.positionalData(actualEvent);
        data.speed = speed;
        data.acceleration = acceleration;
        this.saveLog('mouse movement', data);
    }

    captureScrolling() {
        var actualEvent = this.recentScrollEvent;
        if (actualEvent && !(actualEvent === this.lastScrollEvent)) { 
            this.saveLog('scrolling', this.positionalData(this.recentMouseEvent));
            this.lastScrollEvent = actualEvent;
        }
    }

    //crea objeto de la data de posicion del mouse
    positionalData(e) {
        return {
            posX: e.clientX,
            clientY: e.clientY,
            pageY: e.pageY,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            scrollY: window.scrollY,
            scrollHeight: document.documentElement.scrollHeight
        }
    }

    //guarda el Log en el array, poniendo su tipo, hora y data posicional
    saveLog(newType, newData) {
        this.logs.push({
            type: newType,
            timestamp: Date.now(),
            data: newData
        })
    }


    //los handlers son funciones anonimas para que el this se refiera al objeto
    mouseMoveUpdate = e => {
        this.recentMouseEvent = e;
    }

    scrollUpdate = e => {
        this.recentScrollEvent = e;
    }

    captureMouseClick = e => {
        this.recentMouseEvent = e;
        this.saveLog('mouse click', this.positionalData(e))
    }

    captureMovementAndScrolling = e => {
        this.captureMouseMovement();
        this.captureScrolling();
    }
}



/* ---------- SECCION DE ENVIO DE DATOS ----------*/
class Sender {
    constructor(urlToSend) {
        this.url = urlToSend;
    }

    submitForm(object, sendButton) {
        let xhr = new XMLHttpRequest();
        xhr.onerror = () => {
            alert("Ha ocurrido un error en el envío. Intente nuevamente.");
            sendButton.disabled = false;
        };
        xhr.open("POST", this.url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(object));
        xhr.onload = function() {
            alert("Sus datos se han enviado correctamente.");
            document.getElementById('thanks-message').style.visibility = "visible";
            document.getElementById('end-message').style.visibility = "hidden";
            console.log(JSON.stringify(xhr.response));
        };
    }
}

var game = new Game(document);