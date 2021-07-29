const spawn = require('child_process').spawn
const chokidar = require('chokidar')
const path = require('path')
const Utility = require('../util/utility')
const logger = require('../lib/logger')

class NodeKeeper {
    constructor() {
        this._init_()
    }

    _init_ = () => {
        this.args = process.argv
        this.fileName = this.args[2]
        this.cwd = process.cwd()
        this.watchPaths = [path.join(this.cwd, '/**/*.js')]
        this.ignoredPaths = '**/node_modules/*'

        this.logInit()
        this.reload()
        this.startWatching()
        this.listeningEvents()
        this.sayBye()
    }

    reload = () => {
        logger('debug', `starting \`node ${this.fileName}\``)
        if (this.nodeServer) this.nodeServer.kill('SIGTERM')

        this.nodeServer = spawn('node', [this.fileName], {
            stdio: [process.stdin, process.stdout, process.stderr]
        })

        this.nodeServer.on('exit', code => {
            if (code === 1) {
                // code为1，表示子进程发生错误退出
                logger(
                    'error',
                    'app crashed - Waiting for changes to restart...'
                )
            }
        })
    }

    startWatching = () => {
        chokidar
            .watch(this.watchPaths, {
                ignored: this.ignoredPaths,
                ignoreInitial: true
            })
            .on('all', (event, path) => {
                if (Utility.isValidJs(this.fileName)) {
                    logger('debug', 'restarting due to changes...')
                    Utility.debounce(this.reload, 500)()
                }
            })
    }

    listeningEvents = () => {
        process.stdin.on('data', chunk => {
            let cliInput = chunk.toString().trim().toLowerCase()

            switch (cliInput) {
                case 'rs':
                    logger('debug', 'restarting child process')
                    this.reload()
                    break
            }
        })
    }

    logInit = () => {
        logger('info', 'v1.0.0')
        logger('info', 'to restart at any time, enter `rs`')
    }

    sayBye = () => {
        process.on('SIGINT', function () {
            console.log('Bye!')
            process.exit()
        })
    }
}

module.exports = new NodeKeeper()
