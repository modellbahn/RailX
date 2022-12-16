const socket = io()
socket.on('console-log', console.log)
const deb = new DeBSON(socket)
window.deb = deb

const wizardPages = [
    async function () {
        $$('.sw-content').inner(`
            <img alt="RailX" src="/logo.png">
            <h1>Willkommen bei RailX</h1>
            <h2>Nun werden Sie Schritt für Schritt ihr System einrichten und fahrbereit machen</h2>
        `)
    }, async function () {
        $$('.sw-content').inner(`
            <div class="wizputhead">
                <h1>Systemzeit einstellen</h1>
                <h2>Ihre Anlage besitzt ein eigenes Zeitsystem, um Beleuchtung und Fahrpläne zu steuern</h2>
            </div>
            <div class="input-wizard-field">
                <span>Wie viele Sekunden soll eine Stunde auf der Anlage dauern?</span>
                <input id="wizput-seqh" type="number" min="1" max="3600" value="30">
            </div>
        `)
        $$('#wizput-seqh').on('input', async () => {
            let val = $$('#wizput-seqh').value
            val = parseInt(val)
            if (isNaN(val)) return
            if (val < 1) val = 1
            if (val > 3600) val = 3600

            await deb.cat('timecycler').obj('hour-equals-secs').write(val)
        })
        $$('#wizput-seqh').value = ((await deb.cat('timecycler').obj('hour-equals-secs').read()) || 30)
    }, async function () {
        $$('.sw-content').inner(`
            <div class="wizputhead">
                <h1>Angeschlossene Slaves</h1>
                <h2>Slaves verwalten alle ihre angeschlossenen Geräte. Bitte wählen sie alle unten geliste Geräte aus, die Slaves sind</h2>
            </div>
            <div class="choose-slaves">
                <ul id="slavelist"></ul>
                <hr>
                <ul id="chosen-slaves"></ul>
            </div>
        `)

        const updateDevices = () => {
            socket.emit('listserialdevices', async (devices) => {
                $$('#slavelist').inner('')
                for (const device of devices) {
                    $$('#slavelist').inner($$('#slavelist').inner() + `
                        <li><span class="devicelist-port">${device.path}</span>: <span class="devicelist-name">${device.friendlyName}</span><i class="add-device-slave fa-solid fa-circle-plus"></i></li>
                    `)
                }

                $$('#slavelist li i').on('click', async (event) => {
                    const port = event.path[1].querySelector('.devicelist-port').innerText.trim()
                    const name = event.path[1].querySelector('.devicelist-name').innerText.trim()
                    const slaveoptions = { port, name }
                    let slavelist = (await deb.cat('slaves').obj('slavelist').read()) || []
                    slavelist.push(slaveoptions)
                    slavelist = slavelist.map(e => JSON.stringify(e))
                    slavelist = [...new Set(slavelist)]
                    slavelist = slavelist.map(e => JSON.parse(e))
                    await deb.cat('slaves').obj('slavelist').write(slavelist)
                })

                if ((await deb.cat('setupwizard').obj('currentpage').read()) !== 3) clearInterval(intervalid)
            })
        }
        const intervalid = setInterval(updateDevices, 2000)
        updateDevices()
        const onSlavelistUpdate = newList => {
            $$('#chosen-slaves').inner('')
            for (const device of newList) {
                $$('#chosen-slaves').inner($$('#chosen-slaves').inner() + `
                    <li><span class="devicelist-port">${device.port}</span>: <span class="devicelist-name">${device.name}</span><i class="del-device-slave fa-solid fa-circle-xmark"></i></li>
                `)
            }

            $$('#chosen-slaves li i').on('click', async (event) => {
                const port = event.path[1].querySelector('.devicelist-port').innerText.trim()
                const name = event.path[1].querySelector('.devicelist-name').innerText.trim()
                const slaveoptions = { port, name }
                let slavelist = (await deb.cat('slaves').obj('slavelist').read()) || []
                slavelist = slavelist.map(e => JSON.stringify(e))
                slavelist = slavelist.filter(e => e !== JSON.stringify(slaveoptions))
                slavelist = slavelist.map(e => JSON.parse(e))
                await deb.cat('slaves').obj('slavelist').write(slavelist)
            })
        }
        await deb.cat('slaves').obj('slavelist').watch(onSlavelistUpdate)
        await onSlavelistUpdate((await deb.cat('slaves').obj('slavelist').read()) || [])
    }, async function () {
        $$('.sw-content').inner(`
            <div class="wizputhead">
                <h1>Lautsprecher aktivieren</h1>
                <h2>RailX verfügt über ein Soundsystem. Dafür muss jedoch ein Lautsprecher verbunden und in den Raspberry Pi Einstellungen aktiviert sein. Falls Sie das Soundsystem nicht benutzen wollen, können Sie diesen Schritt überspringen</h2>
            </div>
            <div class="soundcheck">
                <h1>Hören Sie einen Ton?</h1>
                <br>
                <button id="start-soundcheck">Ton abspielen</button>
                <br>
                <br>
                <h2>Falls Sie keinen Ton hören überprüfen Sie ob der Lautsprecher richtig angeschlossen und in den Einstellungen aktiviert ist!</h2>
            </div>
        `)
        $$('#start-soundcheck').on('click', () => {
            socket.emit('soundcheck')
        })
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
    }, async function () {
        $$('.sw-content').inner('D')
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