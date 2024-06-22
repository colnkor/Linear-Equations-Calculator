class MathElements {
    static functionNames = new StringTree(['\\sqrt', '\\pow', '\\frac', '\\nthsqrt', '\\parentheses', '\\abs', '\\matrix', '\\subscript', '\\system'])
    static ses = {
        '^' : '\\pow',
        '(' : '\\parentheses',
        ')' : '\\parentheses',
        '/' : '\\frac',
        '|' : '\\abs',
        '_' : '\\subscript'
    }
    static observers = new WeakMap()

    static cSystems = 0
    static cMatrix = 0

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

    static system(y = 2) {
        const block = this.createElement('span', 'block')
        const parenL = this.createElement('span', 'paren unselectable', '{')
        const systemContent = this.createElement('table', 'system-content')
        const table = this.createElement('tbody')

        block.setAttribute('data-math', 'system')
        block.setAttribute('data-rows', `${y}`)
        block.appendChild(parenL)
        block.appendChild(systemContent)
        systemContent.appendChild(table)
        systemContent.setAttribute('data-reactas', 'block')
        
        for (let i = 0; i < y; i++) {
            const row = this.createElement('tr', 'system-row empty')
            row.setAttribute('data-displace-cursor', 'in')
            row.setAttribute('data-empty', 'true')
            table.appendChild(row)
        }

        this.cSystems++

        return {
            getCursorPosition: () => table.firstChild, // Start at the first row
            getBlock: () => block,
            startObserve: () => this.observeElement(block, table, [parenL])
        };
    }

    static matrix(rows = 2, cols = 2) {
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

        // Create rows and columns
        for (let i = 0; i < rows; i++) {
            const row = this.createElement('tr', 'matrix-row');
            row.setAttribute('data-reactas', 'block')
            for (let j = 0; j < cols; j++) {
                const cell = this.createElement('td', 'matrix-cell empty');
                cell.setAttribute('data-displace-cursor', 'in')
                cell.setAttribute('data-empty', 'true')
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

    static parentheses() {
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
        return {
            getCursorPosition: () => blockin,
            getBlock: () => block,
            startObserve: () => this.observeElement(block, blockin, [parenL, parenR])
        }
    }

    static frac() {
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

    static subscript() {
        const block     = this.createElement('span', 'block')
        const subscript = this.createElement('sup', 'empty')

        block.setAttribute('data-math', 'subscript')
        block.appendChild(subscript)
        subscript.setAttribute('data-empty', 'true')
        subscript.style.verticalAlign = '-.4em'
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

    static sqrt() {
        const block = this.createElement('span', 'block')
        const root  = this.createElement('span', 'square-root unselectable', '√')
        const head  = this.createElement('span', 'sqrt-head empty')

        block.setAttribute('data-math', 'sqrt')
        block.appendChild(root)
        block.appendChild(head)
        head.setAttribute('data-displace-cursor', 'in')
        head.setAttribute('data-empty', 'true')
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