var Solver = (function() {
    // Private Variables
    let areaOfReaction   = undefined
    let blinkInterval    = undefined
    let cursor           = undefined
    let keyboard         = undefined
    let keyboardPopup    = undefined
    let invite           = undefined
    let textarea         = undefined
    let xMatrix          = undefined
    let yMatrix          = undefined
    let ySystem          = undefined
    let msgHolder        = undefined
    let sendButton       = undefined
    let mouseDown        = false
    let isTextareaClear  = true
    let isFunctionCalled = false
    let isCursorSet      = false
    let isSelected       = false

    const commandHandlers = {
        'Backspace': handleBackspace,
        'Enter': handleEnter,
        ' ': handleSpace,
        '\\': handleSlash,
        '^': handleShortcuts,
        '/': handleShortcuts,
        '(': handleShortcuts,
        ')': handleShortcuts,
        '|': handleShortcuts,
        '_': handleShortcuts
    }

    // Handler Mehods
    function handleEnter() {
        cursor.remove()
        clearInterval(blinkInterval)
        sendToSolve()
        textarea.blur()
    }
    function handleBackspace() {
        if (isSelected) {
            return deleteSelection()
        }
        let elem = cursor.previousElementSibling
        if (elem == null) {
            elem = cursor.parentNode
            while (elem.getAttribute('data-math') == null && elem.id != 'formulas')
                elem = elem.parentNode
        }
        // Delete Mathematical Equations
        if (elem.classList.contains('block')) {
            // If mathematical equation is empty
            if (elem.innerText.replace(/[^a-zA-Z0-9]/g, '').length == 0) {
                MathElements.disconnectObserver(elem)
                elem.parentNode.insertBefore(cursor, elem)
                elem.remove()
            } else {
                selectBlock(elem)
                return
            }
        // Delete Symbols
        } else if (elem.tagName == 'SPAN' && elem.innerText.length == 1)
            elem.remove()
        if (cursor.parentNode.innerText.replace(/[^a-zA-Z0-9]/g, '').length == 0 &&
        cursor.parentNode.getAttribute('data-empty'))
            cursor.parentNode.classList.add('empty')
    }
    function handleSpace(event) {
        const cmd = cursor.parentNode
        const func = cmd.textContent.replace(/\u200B/g, '')
        if (cmd.classList.contains("command")) {
            const insertArea = cmd.parentNode
            // Remove command block
            if (!MathElements.functionNames.contains(func)) {
                insertArea.insertBefore(cursor, cmd)
                cmd.innerText = ''
                if (insertArea != areaOfReaction && insertArea.innerText.length == 1)
                    insertArea.classList.add('empty')
                cmd.remove()
                return
            }
            // Generate MathElement
            const obj = MathElements.executeMethod(func)
            insertArea.insertBefore(obj.getBlock(), cmd)
            cmd.remove()
            obj.startObserve()
            obj.getCursorPosition().appendChild(cursor)
        }
        return
    }

    function handleSlash(event) {
        const insertArea = cursor.parentNode
        if (insertArea.classList.contains("command")) {
            insertArea.parentNode.appendChild(cursor)
            insertArea.innerText = ''
            if (insertArea.parentNode != areaOfReaction)
                insertArea.parentNode.classList.add('empty')
            insertArea.remove()
            return
        }
        insertArea.classList.remove('empty')
        const block = MathElements.executeMethod('selectionBlock')
        insertArea.insertBefore(block, cursor)
        block.appendChild(cursor)
    }

    function handleShortcuts(event) {
        if (cursor.parentNode.classList.contains("command"))
            return
        createMathEq(MathElements.parseSymbol(event.key))
    }

    // Private Methods
    function removeSelection() {
        const selection = document.getElementsByClassName('selection')[0]
        for (elem of selection.children) {
            selection.parentNode.insertBefore(elem, selection)
        }
        selection.remove()
        isSelected = false
    }
    function deleteSelection() {
        const selection = document.getElementsByClassName('selection')[0]
        selection.parentNode.insertBefore(cursor, selection)
        selection.remove()
        isSelected = false
    }
    function selectBlock(block) {
        cursor.remove()
        const selection = document.createElement('span')
        selection.className = 'selection'
        block.parentNode.insertBefore(selection, block)
        selection.appendChild(block)
        isSelected = true
    }
    function returnCursor() {
        let cursor = document.createElement('span')
        cursor.className = 'cursor'
        cursor.innerHTML = '&ZeroWidthSpace;'
        return cursor
    }
    function setCursorPosition(event) {
        mouseDown = true
        isCursorSet = true
        let obj = event.target
        event.preventDefault()

        if (isSelected)
            removeSelection()
        if (blinkInterval) {
            clearInterval(blinkInterval)
            cursor.classList.remove('blink')
        }
        invite.remove()
        if (obj.dataset.reactas == 'block') {
            while (!obj.classList.contains('block'))
                obj = obj.parentNode
        }

        switch (obj){
            case areaOfReaction:
                areaOfReaction.appendChild(cursor)
                break
            default:
                if (obj.classList.contains('empty')) {
                    obj.appendChild(cursor)
                } 
                else {
                    const insertArea = (obj.getAttribute('data-displace-cursor') === 'in') ? obj : obj.parentNode;
                    const rect = obj.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    
                    if (obj.getAttribute('data-displace-cursor') === 'in') {
                      if (event.clientX < centerX) {
                        insertArea.insertBefore(cursor, insertArea.firstElementChild);
                      } else {
                        insertArea.appendChild(cursor);
                      }
                    } else {
                      let elem = (event.clientX < centerX) ? obj : obj.nextSibling;
                      if (elem === null) {
                        obj.parentNode.appendChild(cursor);
                      } else {
                        insertArea.insertBefore(cursor, elem);
                      }
                    }
                }
        }
        blinkInterval = setInterval(() => { cursor.classList.toggle('blink') }, 500)
        textarea.focus()
    }
    function textareaInput(event) {
        console.log(event.key)
        const handler = commandHandlers[event.key]
        if (handler) {
            handler(event)
        } else if (event.key.length == 1) {
            isTextareaClear = false
            cursor.parentNode.classList.remove('empty')
            writeText(event.key)
        }
    }
    function writeText(obj) {
        const insertArea = cursor.parentNode
        switch (obj) {
            case '*':
                obj = '×'
                break
            case '-':
                obj = '−'
                break
        }
        const elem = document.createElement('span')
        elem.innerText = obj
        insertArea.insertBefore(elem, cursor)
    }
    function mouseSelection(event) {
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

        if (areaOfReaction.innerText.length == 0) {
            isTextareaClear = true
            areaOfReaction.appendChild(invite)
        }
        else
            isTextareaClear = false

        isCursorSet = false
    }
    function keyboardReaction(event) {
        if (event.target != keyboard.firstElementChild) {
            // When no cursor and cursor
            event.preventDefault()
            createMathEq(event.target.dataset.append)
        }
    }
    function createMatrix(event) {
        if (yMatrix.checkValidity() && xMatrix.checkValidity()) {
            event.preventDefault()
            createMathEq(null, MathElements.matrix(xMatrix.value, yMatrix.value))
        }
    }
    function createSystem(event) {
        if (ySystem.checkValidity()) {
            event.preventDefault()
            createMathEq(null, MathElements.system(ySystem.value))
        }
    }
    function sendToSolve() {
        if (!isTextareaClear) {
            createUserHTMLMessage()
            isTextareaClear = true
            areaOfReaction.appendChild(invite)
        }
    }
    // Generators
    function createUserHTMLMessage() {
        const usrmsg = document.createElement('span')
        const cont   = document.createElement('span')
        usrmsg.className   = 'user-msg'
        cont.className     = 'unselectable'
        cont.style.display = 'contents'

        usrmsg.appendChild(cont)
        for (let elem of Array.from(areaOfReaction.children).slice(1)) {
            cont.appendChild(elem)
        }
        msgHolder.appendChild(usrmsg)
    }
    function createMathEq(eqname=null, object=null) {
        if (blinkInterval) {
            clearInterval(blinkInterval)
            cursor.classList.remove('blink')
        }
        if (object == null)
            object = MathElements.executeMethod(eqname)
        if (isCursorSet) {
            //if (event.target.dataset.append != '\\pow')
            cursor.parentNode.classList.remove('empty')
            cursor.parentNode.insertBefore(object.getBlock(), cursor)
        } else {
            isCursorSet = true
            areaOfReaction.appendChild(object.getBlock())
        }
        isTextareaClear = false
        invite.remove()
        object.startObserve()
        object.getCursorPosition().appendChild(cursor)
        blinkInterval = setInterval(() => { cursor.classList.toggle('blink') }, 500)
        textarea.focus()
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
            xMatrix        = document.getElementById('x')
            yMatrix        = document.getElementById('y')
            ySystem        = document.getElementById('s')
            msgHolder      = document.getElementById('msg-holder')
            sendButton     = document.getElementById('send-button')

            document.getElementById('create-system').addEventListener('mousedown', createSystem)
            document.getElementById('create-matrix').addEventListener('mousedown', createMatrix)
            areaOfReaction.addEventListener('mousedown', setCursorPosition)
            document.addEventListener('mouseup', () => { mouseDown = false })
            document.addEventListener('mousemove', mouseSelection)
            textarea.addEventListener('keydown', textareaInput)
            textarea.addEventListener('blur', getUnfocused)
            keyboardPopup.addEventListener('click', () => {
                if (keyboard.classList.toggle('unactive'))
                    keyboardPopup.firstElementChild.firstElementChild.href.baseVal += '-active'
                else
                    keyboardPopup.firstElementChild.firstElementChild.href.baseVal = '#keyboard-icon'
            })
            keyboard.firstElementChild.addEventListener('mousedown', keyboardReaction)
            sendButton.addEventListener('click', sendToSolve)
        }
    }
})()

window.onload = Solver.init