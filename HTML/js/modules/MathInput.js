class MathInput {
    static returnCursor() {
        let cursor = document.createElement('span')
        cursor.className = 'cursor'
        return cursor
    }

    setCursorPosition() {
        this.textarea.focus()
        this.areaOfReaction.className += " hasCursor"
        this.invite.replaceWith(this.cursor)
        this.blinkInterval = setInterval(() => {
            this.cursor.classList.toggle('blink')
        }, 550)
    }

    dissolveCursor() {
        this.areaOfReaction.className = "main-input"
        this.cursor.replaceWith(this.invite)
        this.cursor.classList.remove('blink')
        clearInterval(this.blinkInterval)
    }

    readInput(event) {
        const inputValue = event.key
        console.log(inputValue)
        event.target.value = ''
    }
    
    constructor(areaOfReaction, textarea){
        this.blinkInterval  = undefined
        this.areaOfReaction = areaOfReaction
        this.invite         = document.getElementById("invite")
        this.cursor         = InputBlock.returnCursor()
        this.textarea       = textarea

        areaOfReaction.addEventListener('click', this.setCursorPosition)
        textarea.addEventListener('keydown', this.readInput)
        textarea.addEventListener('blur', this.dissolveCursor)
    }
}

export {MathInput}