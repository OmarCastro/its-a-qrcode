const originalIntlDateTimeFormat = Intl.DateTimeFormat
const originalDateGetTimezoneOffset = Date.prototype.getTimezoneOffset

export function setup () {
  let timeZone = null


  Intl.DateTimeFormat = (locales, options, ...args) => {
    return originalIntlDateTimeFormat(locales, timeZone ? { timeZone, ...options } : options, ...args)
  }

  Date.prototype.getTimezoneOffset = function () {
    timeZone === 'UTC' ? 0 : originalDateGetTimezoneOffset.call(this)
  }


  return {
    useUTC () {
      timeZone = 'UTC'
    },
  }

}

export function teardown () {
  Intl.DateTimeFormat = originalIntlDateTimeFormat
  Date.prototype.getTimezoneOffset = originalDateGetTimezoneOffset
}

/**
 * @typedef {object} MockApi
 * @property {() => void} useUTC - applies UTC timezone to time related operations
 */
