class Gleisbild {
    constructor (element, mode, save = '{"settings":{"width":30,"height":50,"zoom":0.2,"x":0,"y":0},"elements":[]}') {
        if (!element) throw new Error('Please provide an element!')
        if (typeof element === 'string') element = document.querySelector(element)
        this.element = element
        this.mode = mode
        this.showControls = mode === 'edit'
        this.save = JSON.parse(save)
        this.zoom = this.save.settings.zoom || 0.2
        this.x = this.save.settings.x || 0
        this.y = this.save.settings.y || 0
        this.id = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))

        element.classList.add('gleisbild-container')
        element.classList.add('gbc')
        element.classList.add(`gbc-${this.id}`)
        if (this.showControls) element.classList.add('edit-mode')
        element.innerHTML = '<div class="gbc-fieldmap"></div>'
        const fm = element.querySelector('.gbc-fieldmap')
        this.fm = fm

        let fieldstr = ''
        for (let i = 1; i <= this.save.settings.width * this.save.settings.height; i++) {
            const row = Math.ceil(i / this.save.settings.width)
            const column = (i % this.save.settings.width) === 0 ? 30 : (i % this.save.settings.width)
            fieldstr += `
                <div class="gbc-field" data-gbf-row="${row}" data-gbf-column="${column}" data-gbf-fieldindex="${i}"></div>
            `
        }
        fm.innerHTML = fieldstr

        if (window.gbESa !== true) {
            this.addStyles()
        }

        this.updateSizes()
        this.updateMovement()
        this.renderEmptyFields()
        let p = this

        document.querySelector(`.gbc-${this.id}`).addEventListener('wheel', function (e) {
            e.preventDefault()
            if (e.deltaY < 0) {
                p.zoom += 0.01
                p.updateSizes()
            }
            if (e.deltaY > 0) {
                p.zoom -= 0.01
                p.updateSizes()
            }
        })

        let isMouseDown = false
        let targetsElem = false
        let lastMouseX = 0
        let lastMouseY = 0
        document.addEventListener('mousedown', () => {
            isMouseDown = true
        })
        document.addEventListener('mouseup', () => {
            isMouseDown = false
        })
        document.querySelector(`.gbc-${this.id}`).addEventListener('mouseover', () => {
            targetsElem = true
        })
        document.querySelector(`.gbc-${this.id}`).addEventListener('mouseout', () => {
            if (!isMouseDown) targetsElem = false
        })


        document.addEventListener('mousemove', (e) => {
            const x = e.clientX
            const y = e.clientY

            if (isMouseDown && targetsElem) {
                p.x -= lastMouseX - x
                p.y -= lastMouseY - y
                p.updateMovement()
            }

            lastMouseX = x
            lastMouseY = y
        })

        
    }

    renderEmptyFields () {
        if (!this.showControls) return
        for (const field of document.querySelector(`.gbc-${this.id}`).querySelectorAll('.gbc-field')) {
            if (!field.innerHTML.trim()) {
                field.classList.add('gbc-empty-field')
                field.innerHTML = `<i class="fa-solid fa-circle-plus"></i>`
            }
        }
    }

    export () {
        this.save.settings.zoom = this.zoom
        this.save.settings.x = this.x
        this.save.settings.y = this.y
        return JSON.stringify(this.save)
    }

    updateSizes () {
        const elem = document.querySelector(`.gbc-${this.id}`)
        const fm = elem.querySelector('.gbc-fieldmap')

        fm.style.width = `${640 * this.zoom * this.save.settings.width}px`
        fm.style.height = `${400 * this.zoom * this.save.settings.height}px`
        for (const field of elem.querySelectorAll('.gbc-field')) {
            field.style.width = `${640 * this.zoom}px`
            field.style.height = `${400 * this.zoom}px`
            field.style.fontSize = `${120 * this.zoom}px`
        }
    }

    updateMovement () {
        const elem = document.querySelector(`.gbc-${this.id}`)
        const fm = elem.querySelector('.gbc-fieldmap')
        fm.style.transform = `translate(${this.x}px, ${this.y}px)`
    }

    addStyles () {
        window.gbESa = true
        document.querySelector('body').innerHTML += `
            <style>
                .gbc {
                    background: #fff;
                    overflow: hidden;
                }
                .gbc-fieldmap {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    flex-wrap:wrap;
                    
                }
                .gbc-field {
                    
                }
                .gbc-empty-field {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                .gbc-empty-field i {
                    font-size: 2em;
                    color: #cc5858;
                }
                .gbc-empty-field i:hover {
                    font-size: 2em;
                    color: #b83434;
                    cursor: pointer;
                }
                .gbc.edit-mode .gbc-field {
                    border: 1px solid gray;
                }
            </style>
        `
    }
}

window.Gleisbild = Gleisbild