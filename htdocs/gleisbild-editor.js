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
        this.eventHandlers = {}
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

        let p = this

        if (this.showControls) {
            // Add button to toggle between modes
            document.querySelector(`.gbc-${this.id}`).innerHTML += `<button class="gbc-togglemodebtn"><i class="fa-solid fa-book-open"></i></button>`
            document.querySelector(`.gbc-${this.id} .gbc-togglemodebtn`).addEventListener('click', () => {
                if (this.showControls) {
                    this.showControls = false
                    this.mode = 'view'
                    document.querySelector(`.gbc-${this.id} .gbc-togglemodebtn`).innerHTML = '<i class="fa-solid fa-pen"></i>'
                    p.removeEmptyFields()
                } else {
                    this.showControls = true
                    this.mode = 'edit'
                    document.querySelector(`.gbc-${this.id} .gbc-togglemodebtn`).innerHTML = '<i class="fa-solid fa-book-open"></i>'
                    p.renderEmptyFields()
                }
                document.querySelector(`.gbc-${this.id}`).classList.toggle('edit-mode')
            })
        }

        this.updateSizes()
        this.updateMovement()
        this.renderEmptyFields()

        document.querySelector(`.gbc-${this.id}`).addEventListener('wheel', function (e) {
            if (window.gbeionfdo) return
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

            if (isMouseDown && targetsElem && !window.gbeionfdo) {
                p.x -= lastMouseX - x
                p.y -= lastMouseY - y
                p.updateMovement()
            }

            lastMouseX = x
            lastMouseY = y
        })

        
    }

    dispatch (event) {
        if (!this.eventHandlers[event]) this.eventHandlers[event] = []
        for (const handler of this.eventHandlers[event]) {
            handler()
        }
    }

    on (event, cb) {
        if (!this.eventHandlers[event]) this.eventHandlers[event] = []
        this.eventHandlers[event].push(cb)
    }

    async openNewFieldDialogue () {
        window.gbeionfdo = true
        document.querySelector(`.gbc-${this.id}`).innerHTML += `
            <div class="gbc-onfd">
                <h1>Was möchten Sie hinzufügen?</h1>
                <div class="gbc-onfd-cc">
                    <div class="gbc-onfd-cc-e">
                        <h2>Gleis-Abteil</h2>
                        <div style="background-image:url('/gleisbild/abteil.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Kurve nach Unten</h2>
                        <div style="background-image:url('/gleisbild/curve-down.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Kurve nach Oben</h2>
                        <div style="background-image:url('/gleisbild/curve-up.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Zug Detector</h2>
                        <div style="background-image:url('/gleisbild/detector.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Entkupplungsgleis</h2>
                        <div style="background-image:url('/gleisbild/entkupplungsgleis.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Weiche Links</h2>
                        <div style="background-image:url('/gleisbild/weiche-links.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Weiche Rechts</h2>
                        <div style="background-image:url('/gleisbild/weiche-rechts.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Signal</h2>
                        <div style="background-image:url('/gleisbild/signal.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Bahnhof / Haltepunkt</h2>
                        <div style="background-image:url('/gleisbild/station.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Prellbock</h2>
                        <div style="background-image:url('/gleisbild/prellbock.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Portal-Verbinder</h2>
                        <div style="background-image:url('/gleisbild/portal.png')" class="gbc-img-cc"></div>
                    </div>
                    <div class="gbc-onfd-cc-e">
                        <h2>Gleis-Abteil</h2>
                        <div style="background-image:url('/gleisbild/abteil.png')" class="gbc-img-cc"></div>
                    </div>
                </div>
            </div>
        `
    }

    renderEmptyFields () {
        let p = this
        if (!this.showControls) return
        for (const field of document.querySelector(`.gbc-${this.id}`).querySelectorAll('.gbc-field')) {
            if (!field.innerHTML.trim()) {
                field.classList.add('gbc-empty-field')
                field.innerHTML = `<i class="fa-solid fa-circle-plus"></i>`
                field.querySelector('i').addEventListener('click', async () => {
                    if (window.gbeionfdo) return
                    const type = await p.openNewFieldDialogue()
                    console.log(type)
                })
            }
        }
    }

    removeEmptyFields () {
        for (const field of document.querySelectorAll(`.gbc-${this.id} .gbc-empty-field`)) {
            field.innerHTML = ''
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

        this.dispatch('change')
        this.dispatch('size-change')
    }

    updateMovement () {
        const elem = document.querySelector(`.gbc-${this.id}`)
        const fm = elem.querySelector('.gbc-fieldmap')
        fm.style.transform = `translate(${this.x}px, ${this.y}px)`

        this.dispatch('change')
        this.dispatch('position-change')
    }

    addStyles () {
        window.gbESa = true
        document.querySelector('body').innerHTML += `
            <style>
                .gbc {
                    background: #fff;
                    position: relative;
                    overflow: hidden;
                }
                .gbc-togglemodebtn {
                    position: absolute;
                    bottom: 2%;
                    right: 2%;
                    outline: none;
                    border: 2px solid #b83434;
                    background: #fff;
                    color: #cc5858;
                    padding: 1%;
                    border-radius: 100vw;
                }
                .gbc-togglemodebtn:hover {
                    background: #b83434;
                    color: #fff;
                    cursor: pointer;
                }
                .gbc-onfd {
                    position: absolute;
                    width: 70%;
                    height: 80%;
                    top: 10%;
                    left: 15%;
                    border: 2px solid #b83434;
                    background: #fff;
                    border-radius: 10px;
                    padding: 1%;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;      
                    overflow-y: auto; 
                    text-align: center;
                    color: #b83434;  
                    padding-top: 30%;         
                }
                .gbc-onfd-cc {
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    flex-wrap: wrap;
                    flex-direction: row;
                    width: 90%;  
                    margin-top: 3%;       
                }
                .gbc-onfd-cc-e {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-evenly;
                    align-items: center;
                    text-align: center;
                    border: 1px solid #b83434;
                    border-radius: 10px;
                    padding: 1%;
                    cursor: pointer;
                    color: #000;
                    width: 30%;
                    font-size: 75%;
                    margin-bottom: 2%;
                }
                .gbc-onfd-cc-e .gbc-img-cc {
                    aspect-ratio: 640 / 400;
                    height: auto;
                    max-height: 90%;
                    width: 95%;
                    background-size: contain;
                    background-repeat: no-repeat;
                }
                .gbc-fieldmap {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
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