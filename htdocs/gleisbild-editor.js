class Gleisbild {
    constructor (element, mode, save = '{"settings":{"width":30,"height":50,"zoom":0.2},"elements":[]}') {
        if (!element) throw new Error('Please provide an element!')
        if (typeof element === 'string' || element instanceof Element) element = $$(element)
        this.element = element
        this.mode = mode
        this.showControls = mode === 'edit'
        this.save = JSON.parse(save)
        this.zoom = this.save.settings.zoom || 0.2

        element.addClass('gleisbild-container')
        element.addClass('gbc')
        if (this.showControls) element.addClass('edit-mode')
        element.inner('<div class="gbc-fieldmap"></div>')
        const fm = element.raw(0).querySelector('.gbc-fieldmap')
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
    }

    export () {
        this.save.settings.zoom = this.zoom
        return JSON.stringify(this.save)
    }

    updateSizes () {
        this.fm.style.width = 640 * this.zoom * this.save.settings.width
        this.fm.style.height = 400 * this.zoom * this.save.settings.height
    }

    addStyles () {
        window.gbESa = true
        $$('body').inner($$('body').inner() + `
            <style>
                .gbc {
                    background: #fff;
                }
                .gbc-fieldmap {
                    display: flex;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    flex-wrap:wrap;
                }
                .gbc-field {
                    width: 320px;
                    height: 200px;
                }
                .gbc.edit-mode .gbc-field {
                    border: 1px solid gray;
                }
            </style>
        `)
    }
}

window.Gleisbild = Gleisbild