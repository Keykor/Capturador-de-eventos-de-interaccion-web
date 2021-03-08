/* ---------- SECCION DE MENSAJES Y JUEGO ----------*/
class Game {

    constructor(document) {
        this.messages = ["Bienvenido", "¡Muy bien!", "Ya casi termina"]
        this.attempt = 0
        this.logs = []

        this.logger = new Logger(1000);
        this.sender = new Sender("http://localhost:3000/logs");
        
        this.messageBackground = document.getElementById('message-background');
        
        this.selectNewHeader();

        //muestra mensaje inicial y comienza captura al tocar el boton
        this.startButton = document.getElementById('start-button');
        this.startMessage = document.getElementById('start-message');
        this.startMessageTitle = document.getElementById('start-message-title');
        this.startMessage.style.visibility = "visible";
        this.startButton.addEventListener('click', this.startGame)

        //desactiva los eventos al tocar el header seleccionado y activa el formulario final
        this.endMessage = document.getElementById('end-message');
        this.sendButton = document.getElementById('send-button');
        
    }

    selectNewHeader() {
        this.selectedHeader = selectRandomInArray(document.getElementsByTagName("H5"));
        document.getElementById('selected-header').innerText = this.selectedHeader.innerText;
        this.selectedHeader.addEventListener('click', this.endGame);
    }

    //los handlers son funciones anonimas para que el this se refiera al objeto
    startGame = e => {
        this.messageBackground.style.visibility = "hidden";
        this.startMessage.style.visibility = "hidden";
        this.logger.startEventCapture()
    }

    endGame = e => {
        this.logger.stopCapture();
        this.messageBackground.style.visibility = "visible";
        this.attempt++;
        this.logs.push(this.logger.logs);
        this.logger = new Logger(1000);
        if (this.attempt < 3) {
            this.selectNewHeader();
            this.startMessageTitle.innerText = this.messages[this.attempt];
            this.startMessage.style.visibility = "visible";
        }
        else {
            this.logger.startEventCapture();
            this.selectedHeader.removeEventListener('click', this.endGame);   
            this.endMessage.style.visibility = "visible";
            this.sendButton.addEventListener('click', this.submitIfValidate);
        } 
    }

    submitIfValidate = e => {
        e.preventDefault();
        if (this.validateEndMessage()) {
            this.sendButton.disabled = true;
            if (!this.logger.isStopped) {
                this.logger.stopCapture();
                this.logger.captureMouseClick();
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
        console.log(newObject)
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

        this.previousMoveEvent = null;
        this.recentMoveEvent = null;
        this.recentScrollEvent = null;
        this.lastScrollEvent = null;
        this.logs = [];
        this.seconds = miliseconds * 0.001;
        this.miliseconds = miliseconds;
        this.previousSpeed = 0;
        window.scroll(0,0)
        window.addEventListener('mousemove', this.mouseMoveUpdate);
        window.addEventListener('scroll', this.scrollUpdate);
    }

    startEventCapture() {
        this.isStopped = false;
        window.addEventListener('click', this.captureMouseClick);
        //intervalo para capturar eventos de movimiento y scrolling
        setInterval(this.captureMovementAndScrolling, this.miliseconds);
    }

    stopCapture() {
        window.removeEventListener('mousemove', this.mouseMoveUpdate);
        window.removeEventListener('click', this.captureMouseClick);
        window.removeEventListener('scroll', this.scrollUpdate);
        this.isStopped = true;
    }

    captureMouseMovement() {
        var actualEvent = this.recentMoveEvent;
        var previousEvent = this.previousMoveEvent;
        if (previousEvent && actualEvent && (previousEvent != actualEvent)) {
            var movementX=Math.abs(actualEvent.screenX-previousEvent.screenX);
            var movementY=Math.abs(actualEvent.screenY-previousEvent.screenY);
            //hipotenusa de triangulo para saber movimiento
            var movement=Math.sqrt(movementX*movementX+movementY*movementY);
            // pixeles / segundos
            var speed=this.seconds*movement;
            var acceleration=this.seconds*(speed-this.previousSpeed);

            const data = this.positionalData(actualEvent);
            data.speed = speed;
            data.acceleration = acceleration;
            this.saveLog('mouse movement', data);
        }
        this.previousMoveEvent = actualEvent;
        this.previousSpeed = speed;
    }

    captureScrolling() {
        var actualEvent = this.recentScrollEvent;
        if (actualEvent && !(actualEvent === this.lastScrollEvent)) { 
            this.saveLog('scrolling', this.positionalData(this.recentMoveEvent));
            this.lastScrollEvent = actualEvent;
        }
    }

    //crea objeto de la data de posicion del mouse
    positionalData(e) {
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
    saveLog(newType, newData) {
        this.logs.push({
            type: newType,
            timestamp: Date.now(),
            data: newData
        })
    }


    //los handlers son funciones anonimas para que el this se refiera al objeto
    mouseMoveUpdate = e => {
        this.recentMoveEvent = e;
    }

    scrollUpdate = e => {
        this.recentScrollEvent = e;
    }

    captureMouseClick = e => {
        this.saveLog('mouse click', this.positionalData(this.recentMoveEvent))
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