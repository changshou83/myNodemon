const JS_EXT = '.js'
const fs = require('fs')

exports.isValidJs = fileName => {
    fileName = fileName.endsWith(JS_EXT) ? fileName : fileName + '.js'

    return fs.existsSync(fileName)
}

exports.debounce = (cb, delay) => {
    let debounceTimer

    return function () {
        let ctx = this
        let args = arguments

        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            cb.apply(ctx, args)
        }, delay)
    }
}
