var Solver = (function() {
    // Private Variables
    let areaOfReaction   = undefined
    let blinkInterval    = undefined
    let cursor           = undefined
    let keyboard         = undefined
    let invite           = undefined
    let textarea         = undefined
    let mouseDown        = false
    let isTextareaClear  = true
    let isFunctionCalled = false
    let keyboardPopup    = undefined
    let isCursorSet      = false

    // Private Methods
    function returnCursor() {
        let cursor = document.createElement('span')
        cursor.className = 'cursor'
        cursor.innerHTML = '&ZeroWidthSpace;'
        return cursor
    }
    function setCursorPosition(event) {
        mouseDown = true
        isCursorSet = true
        event.preventDefault()

        if (blinkInterval) {
            clearInterval(blinkInterval)
            cursor.classList.remove('blink')
        }
        if (isTextareaClear)
            invite.remove()

        switch (event.target){
            case areaOfReaction:
                areaOfReaction.appendChild(cursor)
                break
            default:
                if (event.target.classList.contains('empty')) {
                    event.target.appendChild(cursor)
                } else {
                    const insertArea = event.target.parentNode
                    const rect       = event.target.getBoundingClientRect();
                    const centerX    = rect.left + rect.width / 2;
                    let elem       = (event.clientX < centerX) ? event.target: event.target.nextSibling;
                    if (elem == null) {
                        event.target.appendChild(cursor) 
                        break
                    }
                    insertArea.insertBefore(cursor, elem)
                }
        }
        blinkInterval = setInterval(() => { cursor.classList.toggle('blink') }, 500)
        textarea.focus()
    }
    function textareaInput(event) {
        console.log(event.key)
        switch (event.key) {
            case ' ':
                const cmd = cursor.parentNode
                const func = cmd.textContent.replace(/\u200B/g, '')
                if (cmd.className == "command") {
                    const insertArea = cmd.parentNode
                    if (!MathElements.functionNames.contains(func)) {
                        insertArea.insertBefore(cursor, cmd)
                        cmd.innerText = ''
                        if (insertArea != areaOfReaction)
                            insertArea.classList.add('empty')
                        else
                            isTextareaClear = (areaOfReaction.innerText.length == 1) ? true : false 
                        cmd.remove()
                        return
                    }
                    const obj = MathElements.executeMethod(func)
                    insertArea.insertBefore(obj.getBlock(), cmd)
                    cmd.remove()
                    obj.getCursorPosition().appendChild(cursor)
                }
                return
            case '\\':
                const insertArea = cursor.parentNode
                if (insertArea.classList.contains("command")) {
                    // Some issues will be here exmp sqrt in sqrt
                    insertArea.parentNode.appendChild(cursor)
                    insertArea.innerText = ''
                    if (insertArea.parentNode != areaOfReaction)
                        insertArea.parentNode.classList.add('empty')
                    else
                        isTextareaClear = (areaOfReaction.innerText.length == 1) ? true : false 
                    insertArea.remove()
                    return
                }
                insertArea.classList.remove('empty')
                if (insertArea == areaOfReaction)
                    isTextareaClear = (areaOfReaction.innerText.length == 2) ? true : false
                const block = MathElements.executeMethod('selectionBlock')
                insertArea.insertBefore(block, cursor)
                block.appendChild(cursor)
                return
            case '^':
            case '(':
            case ')':
            case '/':
                const insert = cursor.parentNode
                if (insert.classList.contains("command"))
                    return
                isTextareaClear = false
                cursor.parentNode.classList.remove('empty')
                const bl = MathElements.parseSymbol(event.key)
                insert.insertBefore(bl.getBlock(), cursor)
                bl.getCursorPosition().appendChild(cursor)
                return
        }
        if (event.key.length == 1) {
            isTextareaClear = false
            cursor.parentNode.classList.remove('empty')
            writeText(event.key)
            return
        }
    }
    function writeText(obj) {
        const insertArea = cursor.parentNode
        switch (obj) {
            case '-':
                obj = '−'
            default:
                const elem = document.createElement('span')
                elem.innerText = obj
                insertArea.insertBefore(elem, cursor)
        }
    }
    function selection(event) {
        if (!isFunctionCalled && !isTextareaClear && mouseDown) {
            isFunctionCalled = true
            console.log("selection")
            setTimeout(() => {
                isFunctionCalled = false;
              }, 100);
        }
    }
    function getUnfocused(event) {
        cursor.remove()
        if (isTextareaClear)
            areaOfReaction.appendChild(invite)
        isCursorSet = false
    }
    function keyboardReaction(event) {
        if (event.target != keyboard.firstElementChild) {
            // When no cursor and cursor
            event.preventDefault()
            if (blinkInterval) {
                clearInterval(blinkInterval)
                cursor.classList.remove('blink')
            }
            const obj = MathElements.executeMethod(event.target.dataset.append)
            if (isCursorSet) {
                //if (event.target.dataset.append != '\\pow')
                cursor.parentNode.classList.remove('empty')
                cursor.parentNode.insertBefore(obj.getBlock(), cursor)
            } else {
                isCursorSet = true
                areaOfReaction.appendChild(obj.getBlock())
            }
            isTextareaClear = false
            invite.remove()
            obj.getCursorPosition().appendChild(cursor)
            blinkInterval = setInterval(() => { cursor.classList.toggle('blink') }, 500)
            textarea.focus()
        }
    }
    // Public Methods
    return {
        init: function() {
            areaOfReaction = document.getElementById("formulas")
            cursor         = returnCursor()
            invite         = document.getElementById("invite")
            textarea       = document.getElementsByTagName("textarea")[0]
            keyboardPopup  = document.getElementById('keyboard-popup')
            keyboard       = document.getElementById('keyboard')

            areaOfReaction.addEventListener('mousedown', setCursorPosition)
            document.addEventListener('mouseup', () => { mouseDown = false })
            document.addEventListener('mousemove', selection)
            textarea.addEventListener('keydown', textareaInput)
            textarea.addEventListener('blur', getUnfocused)
            keyboardPopup.addEventListener('click', () => {
                if (keyboard.classList.toggle('unactive'))
                    keyboardPopup.firstElementChild.firstElementChild.href.baseVal += '-active'
                else
                    keyboardPopup.firstElementChild.firstElementChild.href.baseVal = '#keyboard-icon'
            })
            keyboard.firstElementChild.addEventListener('mousedown', keyboardReaction)
        }
    }
})()

window.onload = Solver.init