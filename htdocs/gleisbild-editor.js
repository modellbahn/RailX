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

        document.querySelector(`.gbc-${this.id}`).innerHTML += `
                <div class="gbc-onfd gbc-hidden">
                    <h1>Was möchten Sie hinzufügen? <i class="fa-solid fa-square-xmark gbc-onfd-close-btn"></i></h1>
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
        setTimeout(() => {
            document.querySelector(`.gbc-${this.id} .gbc-onfd-close-btn`).addEventListener('click', () => {
                window.gbcCurrentOnfdResolve(null)
            })
        }, 200)

        this.renderModeSwitchButton()
        this.updateSizes()
        this.updateMovement()
        this.renderEmptyFields()

        function getDistance(touch1, touch2) {
            var xDiff = touch1.clientX - touch2.clientX
            var yDiff = touch1.clientY - touch2.clientY
            return Math.sqrt(xDiff * xDiff + yDiff * yDiff)
        }
        let tzInitialDistance = null
        const threshold = 0.001
        document.querySelector(`.gbc-${this.id}`).addEventListener('wheel', (e) => {
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

        document.querySelector(`.gbc-${this.id}`).addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (event.touches.length === 2) {
                window.gbeionfdo = true
                tzInitialDistance = getDistance(event.touches[0], event.touches[1])
            }
        })

        document.querySelector(`.gbc-${this.id}`).addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (event.touches.length === 2) {
                if (Math.abs(event.scale - 1) > threshold) {
                    p.zoom += (event.scale - 1) * 0.02;
                    p.updateSizes();
                }
            }
        })

        document.querySelector(`.gbc-${this.id}`).addEventListener('touchend', (event) => {
            window.gbeionfdo = false
            tzInitialDistance = null
        })

        let isMouseDown = false
        let targetsElem = false
        let initialTouchX = 0
        let initialTouchY = 0

        // Add mouse event listeners
        document.addEventListener('mousedown', (e) => {
            isMouseDown = true
            targetsElem = e.target.closest(`.gbc-${this.id}`) !== null
            initialTouchX = e.clientX
            initialTouchY = e.clientY
        })
        document.addEventListener('mouseup', () => {
            isMouseDown = false
            targetsElem = false
        })

        document.addEventListener('mousemove', (e) => {
            if (isMouseDown && targetsElem && !window.gbeionfdo) {
                requestAnimationFrame(() => {
                    p.x -= initialTouchX - e.clientX
                    p.y -= initialTouchY - e.clientY
                    p.updateMovement()
                })
            }
        })

        // Add touch event listeners
        document.addEventListener('touchstart', (e) => {
            isMouseDown = true
            targetsElem = e.target.closest(`.gbc-${this.id}`) !== null
            initialTouchX = e.touches[0].clientX
            initialTouchY = e.touches[0].clientY
        })
        document.addEventListener('touchend', () => {
            isMouseDown = false
            targetsElem = false
        })

        document.addEventListener('touchmove', (e) => {
            if (isMouseDown && targetsElem && !window.gbeionfdo) {
                requestAnimationFrame(() => {
                    p.x -= initialTouchX - e.touches[0].clientX
                    p.y -= initialTouchY - e.touches[0].clientY
                    p.updateMovement()
                })
            }
        })



        var all = ['/gleisbild/abteil.png', '/gleisbild/curve-down.png', '/gleisbild/curve-up.png', '/gleisbild/detector.png', '/gleisbild/entkupplungsgleis.png', '/gleisbild/portal.png', '/gleisbild/prellbock.png', '/gleisbild/signal.png', '/gleisbild/station.png', '/gleisbild/weiche-links.png', '/gleisbild/weiche-rechts.png',]
        function onAllImagesLoaded() {}
        function preload() {
            var i = new Image()
            var src = all.pop()
            if (!src) {
                onAllImagesLoaded()
                return
            }
            i.src = src
            i.onload = preload
        }
        preload()
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

    openNewFieldDialogue () {
        window.gbeionfdo = true
        return new Promise(resolve => {
            document.querySelector(`.gbc-${this.id} .gbc-onfd`).classList.remove('gbc-hidden')
            window.gbcCurrentOnfdResolve = (val) => {
                document.querySelector(`.gbc-${this.id} .gbc-onfd`).classList.add('gbc-hidden')
                window.gbeionfdo = false
                resolve(val)
            }
        })
    }

    renderModeSwitchButton () {
        let p = this
        if (this.showControls) {
            // Add button to toggle between modes
            (document.querySelector(`.gbc-${this.id} .gbc-togglemodebtn`) || { outerHTML: '' }).outerHTML = ''
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
    }

    renderEmptyFields () {
        let p = this
        if (!this.showControls) return
        for (const field of document.querySelector(`.gbc-${this.id}`).querySelectorAll('.gbc-field')) {
            if (!field.innerHTML.trim()) {
                field.classList.add('gbc-empty-field')
                field.innerHTML = `<i class="fa-solid fa-circle-plus"></i>`
                field.querySelector('i').addEventListener('click', async () => {
                    console.log('m')
                    if (window.gbeionfdo) return
                    console.log('e')
                    const type = await p.openNewFieldDialogue()
                    
                    console.log(type)
                    console.log(window.gbeinonfdo)
                })
            }
        }
    }

    removeEmptyFields () {
        for (const field of document.querySelectorAll(`.gbc-${this.id} .gbc-empty-field`)) {
            field.innerHTML = ''
            field.classList.remove('gbc-empty-field')
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
        document.querySelector('head').innerHTML += `
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
                .gbc-onfd-close-btn {
                    cursor: pointer;
                }
                .gbc-fieldmap {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .gbc-hidden {
                    display: none;
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