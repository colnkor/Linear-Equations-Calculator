var Solver = function() {
    this.areaOfReaction = undefined
    this.blinkInterval  = undefined
    this.cursor         = undefined
    this.invite         = undefined
    this.textarea       = undefined
};

Solver.prototype = {
    init: function () {
        this.areaOfReaction = document.getElementById("main-input")
        this.cursor         = this.prototype.returnCursor()
        this.invite         = document.getElementById("invite")
        this.textarea       = document.getElementsByTagName('textarea')[0]

        this.areaOfReaction.addEventListener('click', this.prototype.setCursorPosition.bind(this))
        this.textarea.addEventListener('blur', this.prototype.dissolveCursor.bind(this))
        this.textarea.addEventListener('keydown', this.prototype.readInput.bind(this))
    },
    setCursorPosition() {
        this.textarea.focus()
        this.areaOfReaction.className += " hasCursor"
        this.invite.replaceWith(this.cursor)
        this.blinkInterval = setInterval(() => {
            this.cursor.classList.toggle('blink')
        }, 550)
    },
    returnCursor() {
        let cursor = document.createElement('span')
        cursor.className = 'cursor'
        return cursor
    },
    dissolveCursor() {
        this.areaOfReaction.className = "main-input"
        this.cursor.replaceWith(this.invite)
        this.cursor.classList.remove('blink')
        clearInterval(this.blinkInterval)
    },
    readInput(event) {
        const inputValue = event.key
        console.log(inputValue)
        event.target.value = ''
    }
}

window.onload = Solver.prototype.init.bind(Solver)