class AnimationEvent {
    // 時間の単位は msec
    constructor(time_length) {
        this.time_length = time_length
        this.time_at_start = Date.now()
        this.isActive = false
    }

    get IsActive() {
        return this.isActive
    }

    set Length(time_length) {
        this.time_length = time_length
    }

    // v: [0.0, 1.0]
    value(time) {
        var v = (time - this.time_at_start) / this.time_length
        if (v > 1) {
            this.isActive = false
            return NaN
        }
        return v
    }

    activate(time) {
        if (this.isActive) {
            this.time_at_start = time - (this.time_length - (time - this.time_at_start))
        }
        else {
            this.isActive = true
            this.time_at_start = time
        }
    }
}

var cv = new Canvas(512, 512)
cv.Element.addEventListener("mousedown", onMousedownCanvas, false)
cv.Element.addEventListener("dblclick", onDoubleClickCanvas, false)

var wipeEvent = new AnimationEvent(80)

var EDGE_LENGTH = 64
var SHAKE_TIME = 300
var SHAKE_INTENSITY = 8
var sqrX = cv.Center.x - EDGE_LENGTH / 2
var sqrY = cv.Center.y - EDGE_LENGTH / 2
var sqr = []
createSquares()

animate()

function animate() {
    var time = Date.now()

    cv.clearWhite()
    draw(time)
    action(time)

    requestAnimationFrame(animate)
}

function draw(time) {
    drawSquare()

    if (wipeEvent.IsActive) {
        wipe(wipeEvent.value(time))
    }
}

function drawSquare() {
    var i = 0

    //cv.Context.lineWidth = 1
    cv.Context.fillStyle = sqr[0].fill
    for (; i < sqr.length; ++i) {
        //cv.Context.fillStyle = sqr[i].fill
        //cv.Context.strokeStyle = sqr[i].stroke
        //cv.Context.beginPath()
        cv.Context.fillRect(sqr[i].x, sqr[i].y, sqr[i].width, sqr[i].height)
        //cv.Context.stroke()
        //cv.Context.fill()
    }
}

function createSquares() {
    var fill = randomColorCode(),
        x, y

    sqr.length = 0
    for (x = 0; x < cv.Width; x += EDGE_LENGTH) {
        for (y = 0; y < cv.Height; y += EDGE_LENGTH) {
            sqr.push(createSquare(x, y, fill))
        }
    }
}

function createSquare(x, y, fill) {
    return {
        x: x,
        y: y,
        prevX: x,
        prevY: y,
        pinX: x,
        pinY: y,
        width: EDGE_LENGTH,
        height: EDGE_LENGTH,
        fill: fill,
        stroke: "#121212",
        shakeEvent: new AnimationEvent(SHAKE_TIME),
        intensity: SHAKE_INTENSITY,
        shake: shakeSquare,
    }
}

function shakeSquare(time) {
    var value = this.shakeEvent.value(time)
    if (isNaN(value)) {
        this.x = this.pinX
        this.y = this.pinY
        return
    }
    this.x = this.pinX + (0.5 - Math.random()) * this.intensity * (1 - value) + 0.3 * (this.prevX - this.x)
    this.y = this.pinY + (0.5 - Math.random()) * this.intensity * (1 - value) + 0.3 * (this.prevY - this.y)
    this.prevX = this.x
    this.prevY = this.y
}

function action(time) {
    var i = 0
    for (; i < sqr.length; ++i) {
        if (sqr[i].shakeEvent.IsActive) {
            sqr[i].shake(time)
        }
    }
}

function wipe(value) {
    cv.Context.fillStyle = rgbaString(48, 48, 48, 1 - value)
    cv.Context.fillRect(0, 0, cv.Width, cv.Height)
}

// 戻り値が [min, max) のランダムな整数。
function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

// ランダムなカラーコードを生成。
// 少し明るめの色。
function randomColorCode() {
    return "#" + ("00000" + Math.floor(0x666688 * (1 + Math.random())).toString(16)).slice(-6)
}

// r, g, b [0, 255], a [0.0, 1.0]
function rgbaString(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," + a + ")"
}

// UI //

function onMousedownCanvas(event) {
    var i = 0
    for (; i < sqr.length; ++i) {
        sqr[i].shakeEvent.activate(Date.now())
    }
}

function onDoubleClickCanvas(event) {
    EDGE_LENGTH = Math.pow(2, randomInt(3, 8))
    SHAKE_TIME = 300 + 1900 * Math.random()
    SHAKE_INTENSITY = Math.pow(2, randomInt(0, 5))
    wipeEvent.activate(Date.now())
    createSquares()
}