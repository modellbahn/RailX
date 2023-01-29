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

        this.elementList = {
            abteil: {
                id: 'abteil',
                name: 'Gleis-Abteil',
                imgUrl: '/gleisbild/abteil.png',
                svgCode: '<svg class="gbc-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="0" height="0" viewBox="0 0 640 400" xml:space="preserve"><desc>Created with Fabric.js 4.6.0</desc><defs></defs><g transform="matrix(1 0 0 1 320.08 200)" id="ZpvbJas5ZC5AAEzfv7-Zr"  ><path style="stroke: rgb(0,0,0); stroke-width: 10; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M -319.61538 0 L 319.61539 0" stroke-linecap="round" /></g><g transform="matrix(1 0 0 1 217.81 195)" id="RtrWzZztWs_hXfWIeFpEg"  ><path style="stroke: rgb(0,0,0); stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-opacity: 0; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M 0 0" stroke-linecap="round" /></g><g transform="matrix(0.06 0 0 0.06 620.08 20.78)" id="DFUhICkvTdnUwGb_2HX_c"  ><path style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(-255.95, -255.95)" d="M 495.9 166.6 C 499.09999999999997 175.29999999999998 496.4 185 489.5 191.2 L 446.2 230.6 C 447.3 238.9 447.9 247.4 447.9 256 C 447.9 264.6 447.29999999999995 273.1 446.2 281.4 L 489.5 320.79999999999995 C 496.4 326.99999999999994 499.1 336.69999999999993 495.9 345.4 C 491.5 357.29999999999995 486.2 368.7 480.09999999999997 379.7 L 475.4 387.8 C 468.79999999999995 398.8 461.4 409.2 453.29999999999995 419 C 447.4 426.2 437.59999999999997 428.6 428.79999999999995 425.8 L 373.09999999999997 408.1 C 359.7 418.40000000000003 344.9 427 329.09999999999997 433.5 L 316.59999999999997 490.6 C 314.59999999999997 499.70000000000005 307.59999999999997 506.90000000000003 298.4 508.40000000000003 C 284.59999999999997 510.70000000000005 270.4 511.90000000000003 255.89999999999998 511.90000000000003 C 241.39999999999998 511.90000000000003 227.2 510.70000000000005 213.39999999999998 508.40000000000003 C 204.2 506.90000000000003 197.2 499.70000000000005 195.2 490.6 L 182.7 433.5 C 166.89999999999998 427 152.1 418.4 138.7 408.1 L 83.1 425.9 C 74.3 428.7 64.5 426.2 58.599999999999994 419.09999999999997 C 50.49999999999999 409.29999999999995 43.099999999999994 398.9 36.49999999999999 387.9 L 31.799999999999994 379.79999999999995 C 25.699999999999996 368.79999999999995 20.39999999999999 357.4 15.999999999999993 345.49999999999994 C 12.799999999999994 336.79999999999995 15.499999999999993 327.09999999999997 22.39999999999999 320.8999999999999 L 65.69999999999999 281.49999999999994 C 64.6 273.1 64 264.6 64 256 C 64 247.39999999999998 64.6 238.9 65.7 230.6 L 22.4 191.2 C 15.499999999999998 185 12.799999999999999 175.29999999999998 15.999999999999998 166.6 C 20.4 154.7 25.699999999999996 143.29999999999998 31.799999999999997 132.3 L 36.5 124.20000000000002 C 43.1 113.20000000000002 50.5 102.80000000000001 58.6 93.00000000000001 C 64.5 85.80000000000001 74.3 83.40000000000002 83.1 86.20000000000002 L 138.8 103.90000000000002 C 152.20000000000002 93.60000000000002 167 85.00000000000003 182.8 78.50000000000003 L 195.3 21.400000000000027 C 197.3 12.300000000000027 204.3 5.100000000000026 213.5 3.6000000000000263 C 227.3 1.2 241.5 0 256 0 C 270.5 0 284.7 1.2 298.5 3.5 C 307.7 5 314.7 12.2 316.7 21.3 L 329.2 78.4 C 345 84.9 359.8 93.5 373.2 103.80000000000001 L 428.9 86.10000000000001 C 437.7 83.30000000000001 447.5 85.80000000000001 453.4 92.9 C 461.5 102.7 468.9 113.10000000000001 475.5 124.10000000000001 L 480.2 132.20000000000002 C 486.3 143.20000000000002 491.59999999999997 154.60000000000002 496 166.5 z M 256 336 C 300.2 336 336 300.2 336 256 C 336 211.8 300.2 176 256 176 C 211.8 176 176 211.8 176 256 C 176 300.2 211.8 336 256 336 z" stroke-linecap="round" /></g><g transform="matrix(3.3 0 0 1.02 320.08 78.4)" id="YXMRkUIOSbZKGl2-mZnH6"  ><path style="stroke: rgb(0,0,0); stroke-width: 2; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: none; fill-rule: nonzero; opacity: 1;" vector-effect="non-scaling-stroke"  transform=" translate(0, 0)" d="M -41.12903 -41.12903 L 41.12904 -41.12903 L 41.12904 41.12904 L -41.12903 41.12904 z" stroke-linecap="round" /></g></svg>'
            },
            'curve-down': {
                id: 'curve-down',
                name: 'Kurve nach Unten',
                imgUrl: '/gleisbild/curve-down',
                svgCode: ''
            },
            'curve-up': {
                id: 'curve-up',
                name: 'Kurve nach Oben',
                imgUrl: '/gleisbild/curve-up',
                svgCode: ''
            },
            detector: {
                id: 'detector',
                name: 'Zug-Detector',
                imgUrl: '/gleisbild/detector.png',
                svgCode: ''
            },
            entkupplungsgleis: {
                id: 'entkupplungsgleis',
                name: 'Entkupplungsgleis',
                imgUrl: '/gleisbild/entkupplungsgleis.png',
                svgCode: ''
            },
            portal: {
                id: 'portal',
                name: 'Portal-Verbinder',
                imgUrl: '/gleisbild/portal.png',
                svgCode: ''
            },
            prellbock: {
                id: 'prellbock',
                name: 'Prellbock',
                imgUrl: '/gleisbild/prellbock.png',
                svgCode: ''
            },
            signal: {
                id: 'signal',
                name: 'Signal',
                imgUrl: '/gleisbild/signal.png',
                svgCode: ''
            },
            station: {
                id: 'station',
                name: 'Bahnhof / Haltepunkt',
                imgUrl: '/gleisbild/station.png',
                svgCode: ''
            },
            'weiche-links': {
                id: 'weiche-links',
                name: 'Weiche Links',
                imgUrl: '/gleisbild/weiche-links.png',
                svgCode: ''
            },
            'weiche-rechts': {
                id: 'weiche-rechts',
                name: 'Weiche Rechts',
                imgUrl: '/gleisbild/weiche-rechts.png',
                svgCode: ''
            }
        }

        let p = this

        document.querySelector(`.gbc-${this.id}`).innerHTML += `
                <div class="gbc-onfd gbc-hidden">
                    <h1>Was möchten Sie hinzufügen? <i class="fa-solid fa-square-xmark gbc-onfd-close-btn"></i></h1>
                    <div class="gbc-onfd-cc">
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-abteil">
                            <h2>Gleis-Abteil</h2>
                            <div style="background-image:url('/gleisbild/abteil.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e  gbc-onfd-cc-e-curve-down">
                            <h2>Kurve nach Unten</h2>
                            <div style="background-image:url('/gleisbild/curve-down.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e  gbc-onfd-cc-e-curve-up">
                            <h2>Kurve nach Oben</h2>
                            <div style="background-image:url('/gleisbild/curve-up.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-detector">
                            <h2>Zug Detector</h2>
                            <div style="background-image:url('/gleisbild/detector.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e  gbc-onfd-cc-e-entkupplungsgleis">
                            <h2>Entkupplungsgleis</h2>
                            <div style="background-image:url('/gleisbild/entkupplungsgleis.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-weiche-links">
                            <h2>Weiche Links</h2>
                            <div style="background-image:url('/gleisbild/weiche-links.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-weiche-rechts">
                            <h2>Weiche Rechts</h2>
                            <div style="background-image:url('/gleisbild/weiche-rechts.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-signal">
                            <h2>Signal</h2>
                            <div style="background-image:url('/gleisbild/signal.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-station">
                            <h2>Bahnhof / Haltepunkt</h2>
                            <div style="background-image:url('/gleisbild/station.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e gbc-onfd-cc-e-prellbock">
                            <h2>Prellbock</h2>
                            <div style="background-image:url('/gleisbild/prellbock.png')" class="gbc-img-cc"></div>
                        </div>
                        <div class="gbc-onfd-cc-e  gbc-onfd-cc-e-portal">
                            <h2>Portal-Verbinder</h2>
                            <div style="background-image:url('/gleisbild/portal.png')" class="gbc-img-cc"></div>
                        </div>
                    </div>
                </div>
        `
        setTimeout(() => {
            document.querySelector(`.gbc-${this.id} .gbc-onfd-close-btn`).addEventListener('click', () => {
                window.gbcCurrentOnfdResolve(null)
            })

            for (const ce of document.querySelectorAll(`.gbc-${this.id} .gbc-onfd-cc-e`)) {
                ce.addEventListener('click', (e) => {
                    window.gbcCurrentOnfdResolve(p.elementList[e.target.closest('.gbc-onfd-cc-e').classList[1].replace('gbc-onfd-cc-e-', '')])
                })
            }
        }, 200)

        this.renderModeSwitchButton()
        this.updateSizes()
        this.updateMovement()
        this.renderFields()
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
            if (event.touches.length === 2) {
                event.preventDefault();
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
        let tmLastMovementX = 0
        let tmLastMovementY = 0

        document.querySelector(`.gbc-${this.id}`).addEventListener('mousedown', (e) => {
            isMouseDown = true
            targetsElem = e.target.closest(`.gbc-${this.id}`) !== null
        })

        document.addEventListener('mouseup', () => {
            isMouseDown = false
            targetsElem = false
        })

        document.addEventListener('mousemove', (e) => {
            if (isMouseDown && targetsElem && !window.gbeionfdo) {
                p.x += e.movementX
                p.y += e.movementY
                p.updateMovement()
            }
        })

        // Add touch event listeners
        document.querySelector(`.gbc-${this.id}`).addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return
            isMouseDown = true
            targetsElem = e.target.closest(`.gbc-${this.id}`) !== null
            tmLastMovementX = e.touches[0].clientX
            tmLastMovementY = e.touches[0].clientY
        })

        document.addEventListener('touchend', () => {
            isMouseDown = false
            targetsElem = false
        })

        document.addEventListener('touchmove', (e) => {
            if (isMouseDown && targetsElem && !window.gbeionfdo) {
                const touch = e.touches[0];
                let movementX = touch.clientX - tmLastMovementX;
                let movementY = touch.clientY - tmLastMovementY;
                p.x += movementX
                p.y += movementY
                p.updateMovement()
                tmLastMovementX = touch.clientX;
                tmLastMovementY = touch.clientY;
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

    renderField (field) {
        const x = field.dataset.gbfColumn
        const y = field.dataset.gbfRow
        const elementData = this.save.elements.filter(e => e.x === x && e.y === y)[0]
        const { rotation, properties, type } = elementData
        const svgCode = this.elementList[type].svgCode
        
        field.innerHTML = `
            ${svgCode}
        `
        field.querySelector('.gbc-svg').setAttribute('width', 640 * this.zoom)
        field.querySelector('.gbc-svg').setAttribute('height', 400 * this.zoom)
    }

    renderFields () {
        for (const element of this.save.elements) {
            const { x, y } = element
            const field = document.querySelector(`.gbc-${this.id} .gbc-field[data-gbf-row="${y}"][data-gbf-column="${x}"]`)
            if (!field) return
            this.renderField(field)
        }
    }

    addField ([x, y], type) {
        this.save.elements = Array.isArray(this.save.elements) ? this.save.elements : []
        this.save.elements.push({
            x,
            y,
            rotation: 0,
            type: type.id,
            properties: {}
        })
        this.dispatch('field-change')
        this.dispatch('change')
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
                    if (type === null) return
                    
                    field.innerHTML = ''
                    field.classList.remove('gbc-empty-field')
                    p.addField([field.dataset.gbfColumn, field.dataset.gbfRow], type)
                    p.renderField(field)
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

            if (field.querySelector('.gbc-svg')) {
                field.querySelector('.gbc-svg').setAttribute('width', 640 * this.zoom)
                field.querySelector('.gbc-svg').setAttribute('height', 400 * this.zoom)
            }
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