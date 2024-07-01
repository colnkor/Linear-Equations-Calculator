var Solver = (function() {
    // Private Variables
    let areaOfReaction   = undefined
    let blinkInterval    = undefined
    let cursor           = undefined
    let invite           = undefined
    let textarea         = undefined 
    let drawer           = undefined
    let x                = undefined
    let y                = undefined
    let msgHolder        = undefined
    let selContainer     = undefined
    let isTextareaClear  = true
    let isCursorSet      = false
    let isSelected       = false

    let observer = undefined

    const equationType = {
        CANNOT_SOLVE: -2,
        WRG_INPUT: -1,
        SYSTEM_EQ: 0,
        MATRIX_EQ: 1,
    }

    const solveMethods = {
        0: [['Решить систему линейных уравнений методом Гаусса', 'Gauss']],
        1: [['Решить систему линейных уравнений методом Гаусса', 'Gauss']],
    }

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
    }

    // Handler Mehods
    function handleEnter() {
        cursor.remove()
        clearInterval(blinkInterval)
        SolutionProcess()
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
                MathElements.disconnectObserversRecursively(elem)
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
    function handleSpace() {
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

    function handleSlash() {
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
        MathElements.disconnectObserversRecursively(selection)
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
        drawer.style.bottom = '0'
    }
    function textareaInput(event) {
        console.log(event.key)
        const handler = commandHandlers[event.key]
        if (handler) {
            handler(event)
        } else if (event.key.length == 1 && /^[0-9a-zA-Z+\-*]$/.test(event.key)) {
            isTextareaClear = false
            writeText(event.key)
        }
    }
    function writeText(obj) {
        if (!isCursorSet)
            return

        cursor.parentNode.classList.remove('empty')
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
    function getUnfocused() {
        cursor.remove()

        if (areaOfReaction.innerText.length == 0) {
            isTextareaClear = true
            areaOfReaction.appendChild(invite)
        }
        else
            isTextareaClear = false

        isCursorSet = false
        drawer.style.bottom = '-125px'
    }
    function createMatrix(event) {
        if (0 < y.value && y.value <= 10 &&
            0 < x.value && x.value <= 10) {
            event.preventDefault()
            // Main matrix
            createMathEq(null, MathElements.matrix(x.value, y.value))
            // vector
            createMathEq(null, MathElements.matrix(y.value, 1, false))
            // eq
            areaOfReaction.appendChild(MathElements.createElement('span', '', '='))
            // To advanced
            createMathEq(null, MathElements.matrix(x.value, 1))
        }
    }
    function createSystem(event) {
        if (0 < y.value && y.value <= 10 &&
            0 < x.value && x.value <= 10)  {
            event.preventDefault()
            createMathEq(null, MathElements.system(parseInt(y.value), parseInt(x.value)))
        }
    }
    // Preparation for Solve
    function parseExpr(data, symbols_allowed = false) {
        let expr = ''
        if (data.length == 0)
            throw new Error('WRG_INPUT:' + equationType.WRG_INPUT)
        for (let elem of data) {
            switch (elem.getAttribute('data-math')) {
                case 'paren':
                    expr += '('+parseExpr(elem.children[1].children)+')'
                    break
                case 'abs':
                    expr += 'abs('+parseExpr(elem.children[1].children)+')'
                    break
                case 'fraction':
                    expr += '('+parseExpr(elem.children[0].children)+')/('+parseExpr(elem.children[1].children)+')'
                    break
                case 'sqrt':
                    expr += '('+parseExpr(elem.children[1].children)+')**(0.50)'
                    break
                case 'nthsqrt':
                    expr += '('+parseExpr(elem.children[2].children)+')**(1/'+parseExpr(elem.children[0].children)+')'
                    break
                case 'pow':
                    expr += '^('+parseExpr(elem.children[0].children)+')'
                    break
                default:
                    ch = elem.innerText
                    if (ch == '×')
                        ch = '*'
                    else if (ch == '−')
                        ch = '-'
                    else if (!symbols_allowed && ch.toLowerCase() != ch.toUpperCase() && ch.trim() !== '')
                        throw new Error('Equation contains symbolic character!')
                    expr += ch
            }
        }
        return expr
    }
    function parseMatrix() {
        let matrix = []
        for (let elem of Array.from(areaOfReaction.children).slice(1)){
            if (elem.getAttribute('data-math') == 'matrix'){
                let cols = elem.getAttribute('data-cols')
                let rows = elem.getAttribute('data-rows')
                matrix.push([elem, parseInt(rows), parseInt(cols)])
            }
        }

        if (matrix[0][1] == matrix[2][1] && matrix[0][2] == matrix[1][1] &&
            matrix[1][2] == 1 && matrix[2][2] == 1
        )
            return matrix
        else {
            throw new Error('Not matrix form of linear equation')
        }
    }
    function getMatrixData(block, rows, columns, symbolic_allowed=false) {
        const cells = block.querySelectorAll('td.matrix-cell');

        const matrix = [];

        for (let i = 0; i < rows; i++) {
            const row = [];

            for (let j = 0; j < columns; j++) {
                const index = i * columns + j;

                row.push(parseExpr(cells[index].children, symbolic_allowed));
            }

            matrix.push(row);
        }

        return matrix;
    }
    function combineMatrices(matrix1, matrix2) {
        if (matrix1.length !== matrix2.length) {
            throw new Error("Матрицы должны иметь одинаковое количество строк");
        }
        const result = [];

        for (let i = 0; i < matrix1.length; i++) {
            const newRow = [...matrix1[i]];

            if (matrix2[i].length > 0) {
                newRow.push(matrix2[i][0]);
            }

            result.push(newRow);
        }

        return result;
    }
    function gatherMatrix(matrix1, matrix2, symbolic_allowed=false) {
        let advancedMatrix = combineMatrices(getMatrixData(matrix1[0], matrix1[1], matrix1[2], symbolic_allowed),
                                            getMatrixData(matrix2[0], matrix2[1], matrix2[2], symbolic_allowed))
        return advancedMatrix
    }
    function parseSystem() {
        let system = undefined

        for (let elem of Array.from(areaOfReaction.children).slice(1)){
            if (elem.getAttribute('data-math') == 'system'){
                let cols = elem.getAttribute('data-cols')
                let rows = elem.getAttribute('data-rows')
                system = [elem, parseInt(rows), parseInt(cols)+1]
                break
            }
        }

        return getMatrixData(system[0], system[1], system[2], false)
    }
    // Understands if query is a matrix form or system of linear equations
    function understandQuery() {
        try {
            if (MathElements.cMatrix == 3 && MathElements.cSystems == 0) {
                let advancedMatrix = undefined
                const parsedData = parseMatrix() // Throws Error if more than two different sizes

                // Throws error if in matrix there are character symbols
                advancedMatrix = gatherMatrix(parsedData[0], parsedData[2])

                if (advancedMatrix == undefined)
                    return [equationType.WRG_INPUT, null]

                return [equationType.MATRIX_EQ, advancedMatrix]
            } else if (MathElements.cMatrix == 0 && MathElements.cSystems == 1) {
                // Throws error if in matrix there are character symbols
                const parsedData = parseSystem()

                return [equationType.MATRIX_EQ, parsedData]
            }
        } catch (e) {
            return [equationType.WRG_INPUT, null]
        }

        return [equationType.CANNOT_SOLVE, null]
    }
    function showMethodSelector(taskname) {
        return new Promise((resovle) => {
            const block = createSelectionBlock(solveMethods[taskname])
            const fader = document.createElement('div')
            fader.id = 'fader'
            selContainer.appendChild(block)
            selContainer.appendChild(fader)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    block.classList.add('visible');
                })
            })

            block.children[0].addEventListener('click', (event) => {
                const selectedMethod = event.target.getAttribute('data-method')
                fader.remove()
                block.remove()
                resovle(selectedMethod)
            })
            fader.addEventListener('click', () => {
                fader.remove()
                block.remove()
                resovle(null)
            })
        })
    }
    async function sendDataToServer(type, info, method) {
        data = {
            type: type,
            info: info,
            method: method
        }

        const csrftoken = getCookie('csrftoken');

        try {
            const response = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`)
            }

            const result = await response.json()
            return result
        } catch (e) {
            console.log(e)
        }
    }
    async function dictToString(dict) {
        return Object.entries(dict)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
    }
    async function SolutionProcess() {
        if (!isTextareaClear) {
            // In matrix form or system
            const query = understandQuery()
            if (query[0] == equationType.MATRIX_EQ) {
                const selectedMethod = await showMethodSelector(query[0])

                if (selectedMethod) {
                    createUserHTMLMessage()
                    const solution = await sendDataToServer('matrix-form-linear-eq', query[1], selectedMethod)
                    if (solution['result'] === 'excuse') {
                        createServerHTMLAsnwer(MathElements.createElement('span', '', solution['answer']))
                    } else if (solution['result'] === 'answer') {
                        const solString = await dictToString(solution['answer'])
                        createServerHTMLAsnwer(MathElements.convertStringToMath(solString))
                    }
                }
            } else if (query[0] == equationType.CANNOT_SOLVE)
                createServerHTMLAsnwer(MathElements.createElement('span', '',
                    `Простите, однако наше приложение умеет решать только системы линейных уравнений. 😔`))
            else if (query[0] == equationType.WRG_INPUT)
                createServerHTMLAsnwer(MathElements.createElement('span', '',
            'Проверьте корректность ввода и попробуйте снова! 🤓'))
        }
    }
    // Generators
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    function createSelectionBlock(options) {
        const mthdslct = document.createElement('div')
        const displayM = document.createElement('span')
        displayM.style.display = 'contents'
        mthdslct.className = 'method-select'

        mthdslct.appendChild(displayM)
        for (option of options) {
            const optionel = document.createElement('span')
            const txt = document.createElement('span')
            optionel.className = 'option'
            txt.innerText = option[0]
            optionel.setAttribute('data-method', option[1])
            optionel.appendChild(txt)
            displayM.appendChild(optionel)
        }

        return mthdslct
    }
    function createServerHTMLAsnwer(ans) {
        const srvmsg = document.createElement('span')
        const con    = document.createElement('span')
        con.style.display = 'contents'
        srvmsg.className = 'srv-msg'

        srvmsg.appendChild(con)
        con.appendChild(ans)

        msgHolder.appendChild(srvmsg)
    }
    function createUserHTMLMessage() {
        const usrmsg = document.createElement('span')
        const cont   = document.createElement('span')
        usrmsg.className   = 'user-msg'
        cont.className     = 'unselectable'
        cont.style.display = 'contents'

        usrmsg.appendChild(cont)
        for (let elem of Array.from(areaOfReaction.children).slice(1)) {
            cont.appendChild(elem)
            MathElements.disconnectObserversRecursively(elem)
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

        key = object.getBlock().getAttribute('data-math')
        if (isCursorSet && key != 'matrix' && key != 'system') {
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
    function test() {
        setTimeout(() => {msgHolder.style.height = `${drawer.offsetTop - 10}px`}, 505)
    }
    // Public Methods
    return {
        init: function() {
            areaOfReaction = document.getElementById("formulas")
            cursor         = returnCursor()
            invite         = document.getElementById("invite")
            textarea       = document.getElementsByTagName("textarea")[0]
            x              = document.getElementById('x')
            y              = document.getElementById('y')
            drawer         = document.getElementById('drawer')
            msgHolder      = document.getElementById('msg-holder')
            selContainer   = document.getElementById('query-history')

            document.getElementById('create-system').addEventListener('mousedown', createSystem)
            document.getElementById('create-matrix').addEventListener('mousedown', createMatrix)
            areaOfReaction.addEventListener('mousedown', setCursorPosition)
            textarea.addEventListener('keydown', textareaInput)
            textarea.addEventListener('blur', getUnfocused)
            document.getElementById('send-button').addEventListener('click', SolutionProcess)
            document.getElementById('keys').addEventListener('mousedown', (e) => {
                key = e.target.getAttribute('data-append')
                e.preventDefault()
                if (MathElements.functionNames.contains(key))
                    createMathEq(key)
                else if (key == "Backspace")
                    handleBackspace()
                else
                    writeText(key)
            })

            msgHolder.style.height = `${drawer.offsetTop - 10}px`
            window.onresize = test

            observer = new MutationObserver(test)
            observer.observe(drawer, { attributes: true, attributeFilter: ['style'] })
        }
    }
})()

window.onload = Solver.init