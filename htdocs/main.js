const socket = io()
socket.on('console-log', console.log)
const deb = new DeBSON(socket)
window.deb = deb

const wizardPages = [
    async function () {
        $$('.sw-content').inner(`
            <img alt="RailX" src="/logo.png">
            <h1>Willkommen bei RailX</h1>
            <h2>Nun werden Sie Schritt für Schritt ihr System einrichten und Fahrbereit machen</h2>
        `)
    }, async function () {
        $$('.sw-content').inner('B')
    }, async function () {
        $$('.sw-content').inner('C')
    }, async function () {
        $$('.sw-content').inner('D')
    },
]

const startWizard = async () => {
    $$('body').inner($$('body').inner() + `<div class="setupwizardcontainer">
        <div class="sw-content" data-layout="0"></div>
        <div class="sw-progress">
            <button id="sw-back">Zurück</button>
            <span id="sw-progress-page"></span>
            <button id="sw-next">Weiter</button>
        </div>
    </div>`)
    let currentPageNum = (await deb.cat('setupwizard').obj('currentpage').read()) || 0
    if (currentPageNum === 0) {
        currentPageNum = 1
        await deb.cat('setupwizard').obj('currentpage').write(1)
    }
    await deb.cat('setupwizard').obj('currentpage').watch(async (newPageNum) => {
        currentPageNum = newPageNum
        $$('.sw-content').inner('')
        $$('.sw-content').raw(0).setAttribute('data-layout', currentPageNum)
        $$('#sw-progress-page').text(`${newPageNum}/${wizardPages.length}`)
        await wizardPages[newPageNum - 1]()
        if (currentPageNum <= 1) {
            $$('#sw-back').addClass('deactivated')
        } else {
            $$('#sw-back').removeClass('deactivated')
        }
        if (currentPageNum < wizardPages.length) {
            $$('#sw-next').removeClass('deactivated')
        } else {
            $$('#sw-next').addClass('deactivated')
        }
    })

    if (currentPageNum <= 1) {
        $$('#sw-back').addClass('deactivated')
    } else {
        $$('#sw-back').removeClass('deactivated')
    }
    if (currentPageNum < wizardPages.length) {
        $$('#sw-next').removeClass('deactivated')
    } else {
        $$('#sw-next').addClass('deactivated')
    }

    $$('#sw-back').on('click', async () => {
        if ($$('#sw-back').hasClass('deactivated')) return
        await deb.cat('setupwizard').obj('currentpage').write((await deb.cat('setupwizard').obj('currentpage').read()) - 1) 
    })

    $$('#sw-next').on('click', async () => {
        if ($$('#sw-next').hasClass('deactivated')) return
        await deb.cat('setupwizard').obj('currentpage').write((await deb.cat('setupwizard').obj('currentpage').read()) + 1)
    })

    $$('.sw-content').inner('')
    $$('.sw-content').raw(0).setAttribute('data-layout', currentPageNum)
    await wizardPages[currentPageNum - 1]()
    $$('#sw-progress-page').text(`${currentPageNum}/${wizardPages.length}`)

}

;((async()=>{



    // Time Cycler
    const zeroFirst = e => (e.toString().length === 2 ? e.toString() : '0' + e.toString())
    await deb.cat('timecycler').obj('time').watch((newTime) => {
        $$('.timespan').text(newTime)
        if (newTime.split(':')[0] >= 6 && newTime.split(':')[0] <= 19) {
            // Day
            $$('.timeicon').inner('<i class="fa-solid fa-sun"></i>')
        } else {
            // Night
            $$('.timeicon').inner('<i class="fa-solid fa-moon"></i>')
        }
    })
    let timeOnBoot = (await deb.cat('timecycler').obj('time').read()) || '12:00'
    if (timeOnBoot.split(':')[0] >= 6 && timeOnBoot.split(':')[0] <= 19) {
        // Day
        $$('.timeicon').inner('<i class="fa-solid fa-sun"></i>')
    } else {
        // Night
        $$('.timeicon').inner('<i class="fa-solid fa-moon"></i>')
    }
    $$('.timespan').text(timeOnBoot)
    $$('.time-adjust .fa-circle-minus').on('click', async () => {
        let currentTime = (await deb.cat('timecycler').obj('time').read()) || '12:00'
        let [hours, minutes] = currentTime.split(':')
        minutes = parseInt(minutes)
        minutes -= 30
        if (minutes < 0) {
            minutes += 60
            hours = parseInt(hours)
            hours -= 1
            if (hours < 0) {
                hours = 23
            }
        }
        hours = zeroFirst(hours)
        minutes = zeroFirst(minutes)
        const newTime = `${hours}:${minutes}`
        await deb.cat('timecycler').obj('time').write(newTime)
    })
    $$('.time-adjust .fa-circle-plus').on('click', async () => {
        let currentTime = (await deb.cat('timecycler').obj('time').read()) || '12:00'
        let [hours, minutes] = currentTime.split(':')
        minutes = parseInt(minutes)
        minutes += 30
        if (minutes >= 60) {
            minutes -= 60
            hours = parseInt(hours)
            hours += 1
            if (hours >= 24) {
                hours -= 24
            }
        }
        hours = zeroFirst(hours)
        minutes = zeroFirst(minutes)
        const newTime = `${hours}:${minutes}`
        await deb.cat('timecycler').obj('time').write(newTime)
    })
    $$('.dntogglers .fa-sun').on('click', async () => {
        await deb.cat('timecycler').obj('time').write('12:00')
    })
    $$('.dntogglers .fa-moon').on('click', async () => {
        await deb.cat('timecycler').obj('time').write('22:00')
    })
    $$('.dntogglers .daytimecyclelocked').on('click', async () => {
        const isLocked = (await deb.cat('timecycler').obj('daytimecyclelocked').read()) || false
        await deb.cat('timecycler').obj('daytimecyclelocked').write(!isLocked)
    })
    await deb.cat('timecycler').obj('daytimecyclelocked').watch((isLocked) => {
        $$('.daytimecyclelocked').inner(isLocked ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-unlock"></i>')
    })
    const isLockedOnBoot = (await deb.cat('timecycler').obj('daytimecyclelocked').read()) || false
    $$('.daytimecyclelocked').inner(isLockedOnBoot ? '<i class="fa-solid fa-lock"></i>' : '<i class="fa-solid fa-unlock"></i>')

    // Driving Mode Chooser
    const drivingModeOnBoot = (((await deb.cat('drivingmodeselect').obj('mode').read()) || 'manual') === 'script' ? false : true)
    $$('#driving-mode-select').checked = drivingModeOnBoot
    if (drivingModeOnBoot) {
        $$('.driving-mode-select-container .left').removeClass('selected')
        $$('.driving-mode-select-container .right').addClass('selected')

        $$('.rms-manual').addClass('selected')
        $$('.rms-auto').removeClass('selected')
    } else {
        $$('.driving-mode-select-container .right').removeClass('selected')
        $$('.driving-mode-select-container .left').addClass('selected')

        $$('.rms-manual').removeClass('selected')
        $$('.rms-auto').addClass('selected')
    }
    await deb.cat('drivingmodeselect').obj('mode').watch(onoff => {
        onoff = onoff || 'manual'
        onoff = onoff === 'script' ? false : true
        $$('#driving-mode-select').checked = onoff
        if (onoff) {
            $$('.driving-mode-select-container .left').removeClass('selected')
            $$('.driving-mode-select-container .right').addClass('selected')

            $$('.rms-manual').addClass('selected')
            $$('.rms-auto').removeClass('selected')
        } else {
            $$('.driving-mode-select-container .right').removeClass('selected')
            $$('.driving-mode-select-container .left').addClass('selected')

            $$('.rms-manual').removeClass('selected')
            $$('.rms-auto').addClass('selected')
        }
    })
    $$('#driving-mode-select').on('input', async () => {
        await deb.cat('drivingmodeselect').obj('mode').write($$('#driving-mode-select').checked ? 'manual' : 'script')
    })

    if (((await deb.cat('setupwizard').obj('isDone').read()) || false) === false) {
        await deb.cat('setupwizard').obj('isDone').write(false)
        await startWizard()
    }


})());

/*
    https://stackoverflow.com/questions/51647948/change-the-selected-item-in-select-input-on-mouse-wheel-scrolling
    https://hammerjs.github.io/getting-started/
*/