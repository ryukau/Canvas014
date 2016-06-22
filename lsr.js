class Tower {
    constructor(canvas, x, y, halfwidth, height, lineInterval) {
        this.canvas = canvas
        this.x = x
        this.y = y
        this.halfwidth = halfwidth
        this.height = height
        this.lineInterval = lineInterval
        this.scrollSpeed = lineInterval * 0.01
        this.lines = []

        this.createLines()
    }

    createLines() {
        for (var y = 0; y < this.height; y += this.lineInterval) {
            this.lines.push({
                a: this.createPoint(this.x - this.halfwidth, y),
                b: this.createPoint(this.x + this.halfwidth, y),
            })
        }
    }

    createPoint(x, y) {
        return { x: x, y: y }
    }

    draw(color) {
        cv.Context.strokeStyle = color
        cv.Context.lineWidth = 1
        for (var i = 0; i < this.lines.length; ++i) {
            cv.drawLine(this.lines[i].a, this.lines[i].b)
        }
    }

    move() {
        var i, y
        for (i = 0; i < this.lines.length; ++i) {
            y = (this.lines[i].a.y + this.scrollSpeed) % this.height
            this.lines[i].a.y = y
            this.lines[i].b.y = y
        }
    }
}

window.addEventListener("resize", resizeWindow, false)

var cv = new Canvas(window.innerWidth, window.innerHeight)
cv.Element.addEventListener("click", onClickCanvas, false)
var blue = false

const NUM_TOWER = 128
var towers = []
createTowers()

animate()

function animate() {
    updateCanvas()
    action()
    requestAnimationFrame(animate)
}

function action() {
    if (Math.random() < 0.1) {
        towers.shift()
        towers.push(createTower())
    }

    for (var i = 0; i < towers.length; ++i) {
        towers[i].move()
    }
}

function updateCanvas() {
    blue ? cv.clear("#123286") : cv.clear("#ffffff")
    drawTowers()
}

function createTowers() {
    for (var i = 0; i < NUM_TOWER; ++i) {
        towers.push(createTower())
    }
}

function createTower() {
    return new Tower(
        cv,
        Math.random() * cv.Width,
        0,
        16 + randomPow4() * cv.Width / 2,
        cv.Height,
        32 + Math.random() * 48
    )
}

function drawTowers() {
    for (var i = 0; i < towers.length; ++i) {
        towers[i].draw(brightnessToColor(128 * (i + 1) / towers.length))
    }
}

function brightnessToColor(brightness) {
    return toColorCode(brightness, brightness, brightness * (blue ? 4 : 1))
}

// "#123456" といった形式のカラーコードを表す文字列を生成。
function toColorCode(r, g, b) {
    r = clamp(r, 0, 255);
    g = clamp(g, 0, 255);
    b = clamp(b, 0, 255);

    r = ("0" + Math.floor(r).toString(16)).slice(-2);
    g = ("0" + Math.floor(g).toString(16)).slice(-2);
    b = ("0" + Math.floor(b).toString(16)).slice(-2);
    return "#" + r + g + b;
}

// value を [min, max] の範囲に収める。
function clamp(value, min, max) {
    return isNaN(value) ? 0 : Math.max(min, Math.min(value, max));
}

function randomPow4() {
    var r = Math.random()
    return r * r * r * r
}

// UI //

function resizeWindow(event) {
    console.log("here")
    cv.Element.width = window.innerWidth
    cv.Element.height = window.innerHeight
}

function onClickCanvas() {
    blue = blue ? false : true
}