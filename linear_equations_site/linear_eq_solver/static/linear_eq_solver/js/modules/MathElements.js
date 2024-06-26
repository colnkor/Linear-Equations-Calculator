class MathElements {
    static functionNames = new StringTree(['\\sqrt', '\\pow', '\\frac', '\\nthsqrt', '\\parentheses', '\\abs'])
    static ses = {
        '^' : '\\pow',
        '(' : '\\parentheses',
        ')' : '\\parentheses',
        '/' : '\\frac',
        '|' : '\\abs',
    }
    static observers = new WeakMap()

    static cSystems = 0
    static cMatrix = 0

    static convertStringToMath(string) {
        function findFirstParenthesesContent(str) {
            let count = 0;
            let start = -1;
            
            for (let i = 0; i < str.length; i++) {
                if (str[i] === '(') {
                    if (count === 0) start = i;
                    count++;
                } else if (str[i] === ')') {
                    count--;
                    if (count === 0 && start !== -1) {
                        return str.substring(start + 1, i);
                    }
                }
            }
            
            return null; // Если не найдено соответствующих скобок
        }

        function memoryRelease(putIn, memory) {
            for (let elem of memory) {
                putIn.appendChild(elem)
            }
            memory.length = 0
        }

        const mathBlock = document.createElement('span');
        mathBlock.style.display = 'contents';

        let putIn = mathBlock
        let memory = []
        for (let elem = 0; elem < string.length; elem++) {
            if (/\d+/.test(string[elem])) {
                const num = this.createElement('span', '', string[elem])
                memory.push(num)
                continue
            }
            if (string[elem] === '/') {
                const frac = this.frac(false)
                memoryRelease(frac.getCursorPosition(), memory)
                const mat = string.slice(elem).match(/\/(\d*)/)
                frac.getBlock().lastElementChild.appendChild(this.convertStringToMath(mat[1]))
                putIn.appendChild(frac.getBlock())
                string = string.replace(mat[0], '')
                elem--
                continue
            }
            else if (string[elem] === '_') {
                const subscript = this.subscript(false)
                const index = this.createElement('span', '', string[elem+1])
                subscript.getCursorPosition().appendChild(index)
                putIn.appendChild(subscript.getBlock())
                elem++
                continue
            }
            memoryRelease(putIn, memory)
            if (string[elem] === '(') {
                const paren = this.parentheses(false)
                const mat = findFirstParenthesesContent(mat)
                paren.getCursorPosition().appendChild(this.convertStringToMath(mat))
                memory.push(paren.getBlock())
                string = string.replace('('+mat+')', '')
                elem--
                continue
            } else if (string[elem] === 's') {
                const mat = findFirstParenthesesContent(string)
                if (mat) {
                    const sq = this.sqrt(false)
                    sq.getCursorPosition().appendChild(this.convertStringToMath(mat))
                    memory.push(sq.getBlock())
                    string = string.replace('sqrt('+mat+')', '')
                    elem--
                    continue
                }
            }
            putIn.appendChild(this.createElement('span', '', string[elem]))
        }
        memoryRelease(putIn, memory)

        return mathBlock;
    }

    static observeElement(parentNode, elem, toChange=[elem.previousSibling]) {
        const observer = new MutationObserver(() => {
            for (let toScale of toChange)
                toScale.style.transform = `scaleY(${elem.offsetHeight / toScale.offsetHeight})`
        })
        observer.observe(elem, {childList: true, subtree: true})
        this.observers.set(parentNode, observer)
    }

    static disconnectObserver(elem) {
        const observer = this.observers.get(elem);
        if (observer) {
            observer.disconnect();
            this.observers.delete(elem);
            switch (elem.getAttribute('data-math')){
                case 'matrix':
                    this.cMatrix--
                    break
                case 'system':
                    this.cSystems--
                    break
            }
        }
    }

    static disconnectObserversRecursively(element) {
        this.disconnectObserver(element);

        element.childNodes.forEach(child => this.disconnectObserversRecursively(child));
    }

    static createElement(tag, className = '', innerHTML = '') {
        const elem = document.createElement(tag);
        if (className) elem.className = className;
        if (innerHTML) elem.innerHTML = innerHTML;
        return elem;
    }

    static system(y = 2, x = 2) {
        const block = this.createElement('span', 'block')
        const parenL = this.createElement('span', 'paren unselectable', '{')
        const systemContent = this.createElement('table', 'system-content')
        const table = this.createElement('tbody')

        block.setAttribute('data-math', 'system')
        block.setAttribute('data-rows', `${y}`)
        block.setAttribute('data-cols', `${x}`)
        block.appendChild(parenL)
        block.appendChild(systemContent)
        systemContent.appendChild(table)
        systemContent.setAttribute('data-reactas', 'block')
        
        for (let i = 0; i < y; i++) {
            let funny_index = 1
            const row = this.createElement('tr', 'matrix-row');
            row.setAttribute('data-reactas', 'block')
            for (let j = 0; j < x + 1; j++) {
                const cell = this.createElement('td', 'matrix-cell empty');
                cell.setAttribute('data-displace-cursor', 'in')
                cell.setAttribute('data-empty', 'true')
                row.appendChild(cell);
                if (j != x) {
                    row.appendChild(this.createElement('span', 'unselectable', 'x'))
                    row.appendChild(this.subscript(false, funny_index.toString()).getBlock())
                    funny_index++
                } else {
                    row.insertBefore(this.createElement('span', 'unselectable', '='), cell)
                }
            }
            table.appendChild(row);
        }

        this.cSystems++

        return {
            getCursorPosition: () => table.firstChild.firstChild, // Start at the first row
            getBlock: () => block,
            startObserve: () => this.observeElement(block, table, [parenL])
        };
    }

    static matrix(rows = 2, cols = 2, editable=true) {
        const block = this.createElement('span', 'block');
        const parenL = this.createElement('span', 'paren unselectable', '[');
        const parenR = this.createElement('span', 'paren unselectable', ']');
        const matrixContent = this.createElement('table', 'matrix-content');
        const table = this.createElement('tbody')
        
        block.setAttribute('data-math', 'matrix');
        block.setAttribute('data-rows', `${rows}`)
        block.setAttribute('data-cols', `${cols}`)
        block.appendChild(parenL);
        block.appendChild(matrixContent);
        matrixContent.appendChild(table)
        matrixContent.setAttribute('data-reactas', 'block')
        block.appendChild(parenR);
    
        this.cMatrix++
        let cell_class = (editable) ? 'matrix-cell empty' : 'matrix-cell unselectable'
        let funny_index = 1
        // Create rows and columns
        for (let i = 0; i < rows; i++) {
            const row = this.createElement('tr', 'matrix-row');
            row.setAttribute('data-reactas', 'block')
            for (let j = 0; j < cols; j++) {
                const cell = this.createElement('td', cell_class);
                cell.setAttribute('data-displace-cursor', 'in')
                cell.setAttribute('data-empty', 'true')
                if (!editable) {
                    cell.appendChild(this.createElement('span', '', 'x'))
                    cell.appendChild(this.subscript(false, funny_index.toString()).getBlock())
                    funny_index++
                }
                row.appendChild(cell);
            }
            table.appendChild(row);
        }
    
        return {
            getCursorPosition: () => table.firstChild.firstChild, // Start at the first cell
            getBlock: () => block,
            startObserve: () => this.observeElement(block, table, [parenL, parenR])
        };
    }

    static abs() {
        const block   = this.createElement('span', 'block')
        const parenR  = this.createElement('span', 'paren unselectable', '|')
        const blockin = this.createElement('span', 'block empty')
        const parenL  = this.createElement('span', 'paren unselectable', '|')

        block.setAttribute('data-math', 'abs')
        block.appendChild(parenR)
        block.appendChild(blockin)
        block.appendChild(parenL)
        blockin.setAttribute('data-empty', 'true')
        blockin.setAttribute('data-displace-cursor', 'in')
        return {
            getCursorPosition: () => blockin,
            getBlock: () => block,
            startObserve: () => this.observeElement(block, blockin, [parenL, parenR])
        }
    }

    static parentheses(isEmpty=true) {
        const block   = this.createElement('span', 'block')
        const parenR  = this.createElement('span', 'paren unselectable', '(')
        const blockin = this.createElement('span', 'block empty')
        const parenL  = this.createElement('span', 'paren unselectable', ')')

        block.setAttribute('data-math', 'paren')
        block.appendChild(parenR)
        block.appendChild(blockin)
        block.appendChild(parenL)
        blockin.setAttribute('data-empty', 'true')
        blockin.setAttribute('data-displace-cursor', 'in')

        if (!isEmpty) {
            blockin.classList.remove('empty')
        }

        return {
            getCursorPosition: () => blockin,
            getBlock: () => block,
            startObserve: () => this.observeElement(block, blockin, [parenL, parenR])
        }
    }

    static frac(isEmpty=true) {
        const block = this.createElement('span', 'block')
        const num   = this.createElement('span', 'numerator empty')
        const den   = this.createElement('span', 'denominator empty')
        
        num.setAttribute('data-displace-cursor', 'in')
        num.setAttribute('data-empty', 'true')
        den.setAttribute('data-displace-cursor', 'in')
        den.setAttribute('data-empty', 'true')
        block.setAttribute('data-math', 'fraction')
        block.appendChild(num)
        block.appendChild(den)

        if (!isEmpty) {
            num.classList.remove('empty')
            den.classList.remove('empty')
        }
        return {
            getCursorPosition: () => num,
            getBlock: () => block,
            startObserve: () => {}
        }
    }

    static nthsqrt() {
        const block = this.createElement('span', 'block')
        const sroot = this.createElement('span', 'sup root empty')
        const root  = this.createElement('span', 'square-root unselectable', '√')
        const head  = this.createElement('span', 'sqrt-head empty')

        block.setAttribute('data-math', 'nthsqrt')
        block.appendChild(sroot)
        block.appendChild(root)
        block.appendChild(head)
        sroot.setAttribute('data-empty', 'true')
        head.setAttribute('data-displace-cursor', 'in')
        head.setAttribute('data-empty', 'true')
        return {
            getCursorPosition: () => sroot, 
            getBlock: () => block,
            startObserve: () => this.observeElement(block, head)
        }
    }

    static subscript(isEmpty=true, defaultVal='') {
        const block     = this.createElement('span', 'block')
        const subscript = this.createElement('sup', 'empty')

        block.setAttribute('data-math', 'subscript')
        block.appendChild(subscript)
        subscript.setAttribute('data-empty', 'true')
        subscript.style.verticalAlign = '-.4em'
        subscript.innerText = defaultVal

        if (!isEmpty) {
            subscript.classList.remove('empty')
            block.classList.add('unselectable')
        }

        return {
            getCursorPosition : () => subscript,
            getBlock : () => block,
            startObserve: () => {}
        }
    }

    static pow() {
        const block = this.createElement('span', 'block')
        const pow   = this.createElement('sup', 'empty')

        block.setAttribute('data-math', 'pow')
        block.appendChild(pow)
        pow.setAttribute('data-empty', 'true')
        return {
            getCursorPosition : () => pow,
            getBlock : () => block,
            startObserve: () => {}
        }
    }

    static sqrt(isEmpty=true) {
        const block = this.createElement('span', 'block')
        const root  = this.createElement('span', 'square-root unselectable', '√')
        const head  = this.createElement('span', 'sqrt-head empty')

        block.setAttribute('data-math', 'sqrt')
        block.appendChild(root)
        block.appendChild(head)
        head.setAttribute('data-displace-cursor', 'in')
        head.setAttribute('data-empty', 'true')

        if (!isEmpty)
            head.classList.remove('empty')
        return {
            getCursorPosition : () => head,
            getBlock : () => block,
            startObserve: () => this.observeElement(block, head)
        }
    }

    static selectionBlock() {
        const elem        = this.createElement('span', 'block command empty')
        const slash       = this.createElement('span', '', '\\')
        
        elem.setAttribute('data-empty', 'true')
        elem.setAttribute('data-math', 'command')
        elem.appendChild(slash)
        return elem
    }

    static executeMethod(name) {
        return MathElements[name.replace('\\', '')]()
    }
    static parseSymbol(symbol) {
        return this.ses[symbol]
    }
}