const socket = io()
socket.on('console-log', console.log)
const deb = new DeBSON(socket)
window.deb = deb
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min
const uuid = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))

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
                <h2>Slaves verwalten alle ihre angeschlossenen Geräte. Bitte wählen sie alle unten gelisten Geräte aus, die Slaves sind</h2>
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
        $$('.sw-content').inner(`
            <div class="wizputhead">
                <h1>Rangierfahrtenregler hinzufügen</h1>
                <h2>Der Rangierfahrtenregler steuert die Loks im Schattenbahnhof</h2>
            </div>
            <div class="input-wizard-field">
                <span>Mit welchem Slave ist der Rangierfahrtenregler verbunden?</span>
                <div id="slave-select"></div>
            </div>
            <div class="input-wizard-field">
                <span>Welcher PWM-Pin ist mit dem Enable Pin verbunden?</span>
                <input id="wizput-rfr-pin-enable" type="number" min="1" max="500" value="1">
            </div>
            <div class="input-wizard-field">
                <span>Welcher Pin ist mit dem Input1 Pin verbunden?</span>
                <input id="wizput-rfr-pin-input1" type="number" min="1" max="500" value="2">
            </div>
            <div class="input-wizard-field">
                <span>Welcher Pin ist mit dem Input2 Pin verbunden?</span>
                <input id="wizput-rfr-pin-input2" type="number" min="1" max="500" value="3">
            </div>
        `)

        $$('#slave-select').on('input', async () => {
            const port = $$('#slave-select #wizput-rfr-slave').value
            await deb.cat('RangierFahrtenRegler').obj('slave').write(port)
        })
        setTimeout(async () => {
            let rfrslaveonboot = await deb.cat('RangierFahrtenRegler').obj('slave').read()
            if (rfrslaveonboot) {
                $$('#slave-select #wizput-rfr-slave').value = rfrslaveonboot
            }
        }, 200)

        $$('#wizput-rfr-pin-enable').on('input', async () => {
            await deb.cat('RangierFahrtenRegler').obj('pin-enable').write($$('#wizput-rfr-pin-enable').value)
        })
        let rfrPinEnableOnBoot = await deb.cat('RangierFahrtenRegler').obj('pin-enable').read()
        if (typeof rfrPinEnableOnBoot === 'string') {
            $$('#wizput-rfr-pin-enable').value = rfrPinEnableOnBoot
        }

        $$('#wizput-rfr-pin-input1').on('input', async () => {
            await deb.cat('RangierFahrtenRegler').obj('pin-input1').write($$('#wizput-rfr-pin-input1').value)
        })
        let rfrPinInput1OnBoot = await deb.cat('RangierFahrtenRegler').obj('pin-input1').read()
        if (typeof rfrPinInput1OnBoot === 'string') {
            $$('#wizput-rfr-pin-input1').value = rfrPinInput1OnBoot
        }

        $$('#wizput-rfr-pin-input2').on('input', async () => {
            await deb.cat('RangierFahrtenRegler').obj('pin-input2').write($$('#wizput-rfr-pin-input2').value)
        })
        let rfrPinInput2OnBoot = await deb.cat('RangierFahrtenRegler').obj('pin-input2').read()
        if (typeof rfrPinInput2OnBoot === 'string') {
            $$('#wizput-rfr-pin-input2').value = rfrPinInput2OnBoot
        }
        
        const onSlaveChange = async (slavelist) => {
            if (typeof slavelist !== 'object') slavelist = []
            $$('#slave-select').inner(`<select id="wizput-rfr-slave"></select>`)
            for (const slave of slavelist) {
                $$('#slave-select #wizput-rfr-slave').inner($$('#slave-select #wizput-rfr-slave').inner() + `
                    <option data-slave-port="${slave.port}" value="${slave.port}">${slave.port}: ${slave.name}</option>
                `)
            }
        }
        onSlaveChange(await deb.cat('slaves').obj('slavelist').read())
        await deb.cat('slaves').obj('slavelist').watch(onSlaveChange)
    }, async function () {
        $$('.sw-content').inner(`
            <div class="wizputhead">
                <h1>Fahrtenregler hinzufügen</h1>
                <h2>Fahrtenregler steuern die Loks an. Füge mindestens 3 hinzu!</h2>
            </div>
            <div class="add-fr">
                <button id="wiz-add-fr-btn">Neuer Fahrtenregler</button>
            </div>
            <div class="fr-list"></div>
        `)

        const onSlaveChange = async (slavelist) => {
            if (typeof slavelist !== 'object') slavelist = []
            $$('.wiz-fr-slave-select').inner(`<select class="wizput-fr-slave"></select>`)
            for (const slave of slavelist) {
                $$('.wiz-fr-slave-select .wizput-fr-slave').inner($$('.wiz-fr-slave-select .wizput-fr-slave').get(0).inner() + `
                    <option data-slave-port="${slave.port}" value="${slave.port}">${slave.port}: ${slave.name}</option>
                `)
            }
            $$('.wizput-fr-slave').each(async el =>  {
                const id = el.raw(0).parentElement.parentElement.parentElement.dataset.frId
                const frlist = await deb.cat('FahrtenRegler').obj('list').read()
                const slave = frlist.filter(e => e.id == id)[0].slave
                if (slave) {
                    el.value = slave
                } else {
                    el.value = slavelist[0].port
                    const newFrList = frlist.map(e => {
                        if (e.id == id) {
                            e.slave = slavelist[0].port
                        }
                        return e
                    })
                    await deb.cat('FahrtenRegler').obj('list').write(newFrList)
                }
            })
            $$('.wizput-fr-slave').on('input', async ev => {
                let list = await deb.cat('FahrtenRegler').obj('list').read()
                list = list.map(el => {
                    if (el.id == ev.target.parentElement.parentElement.parentElement.dataset.frId) {
                        el.slave = ev.target.value
                    }

                    return el
                })
                await deb.cat('FahrtenRegler').obj('list').write(list)
            })
        }

        const updateFr = async (frs) => {
            if (!Array.isArray(frs)) {
                frs = []
                await deb.cat('FahrtenRegler').obj('list').write(frs)
            }
            $$('.fr-list').inner('')
            for (const fr of frs) {
                $$('.fr-list').innerHTML += `
                    <div class="fr-list-fr" data-fr-id="${fr.id}">
                        <button onclick="(async()=>{await deb.cat('FahrtenRegler').obj('list').write((await deb.cat('FahrtenRegler').obj('list').read()).filter(e => e.id !== '${fr.id}'))})()">Löschen</button>
                        <div class="input-wizard-field">
                            <span>Slave: </span>
                            <div class="wiz-fr-slave-select"></div>
                        </div>
                        <div class="input-wizard-field">
                            <span>Enable Pin: </span>
                            <input id="wizput-fr-pin-enable" oninput="(async()=>{await deb.cat('FahrtenRegler').obj('list').write((await deb.cat('FahrtenRegler').obj('list').read()).map(e=>{if(e.id=='${fr.id}'){e.enablePin=(event.srcElement.value)};return e}))})()" type="number" min="1" max="500" value="${fr.enablePin}">
                        </div>
                        <div class="input-wizard-field">
                            <span>Input1 Pin: </span>
                            <input id="wizput-fr-pin-input1" oninput="(async()=>{await deb.cat('FahrtenRegler').obj('list').write((await deb.cat('FahrtenRegler').obj('list').read()).map(e=>{if(e.id=='${fr.id}'){e.input1Pin=(event.srcElement.value)};return e}))})()" type="number" min="1" max="500" value="${fr.input1Pin}">
                        </div>
                        <div class="input-wizard-field">
                            <span>Input2 Pin: </span>
                            <input id="wizput-fr-pin-input2" oninput="(async()=>{await deb.cat('FahrtenRegler').obj('list').write((await deb.cat('FahrtenRegler').obj('list').read()).map(e=>{if(e.id=='${fr.id}'){e.input2Pin=(event.srcElement.value)};return e}))})()" type="number" min="1" max="500" value="${fr.input2Pin}">
                        </div>
                    </div>
                `
            }

            onSlaveChange(await deb.cat('slaves').obj('slavelist').read())
        }

        await deb.cat('FahrtenRegler').obj('list').watch(updateFr)
        updateFr(await deb.cat('FahrtenRegler').obj('list').read())

        onSlaveChange(await deb.cat('slaves').obj('slavelist').read())
        await deb.cat('slaves').obj('slavelist').watch(onSlaveChange)
        

        $$('#wiz-add-fr-btn').on('click', async () => {
            let list = await deb.cat('FahrtenRegler').obj('list').read()
            if (!Array.isArray(list)) list = []
            list.push({
                slave: null,
                enablePin: `${random(1, 52) }`,
                input1Pin: `${random(1, 52) }`,
                input2Pin: `${random(1, 52) }`,
                id: uuid()
            })
            await deb.cat('FahrtenRegler').obj('list').write(list)
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