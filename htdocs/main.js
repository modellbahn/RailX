const socket = io()
window.socket = socket
socket.on('console-log', console.log)
const deb = new DeBSON(socket)
window.deb = deb
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min
const uuid = () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))

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
})());


/*
    https://stackoverflow.com/questions/51647948/change-the-selected-item-in-select-input-on-mouse-wheel-scrolling
    https://hammerjs.github.io/getting-started/
*/