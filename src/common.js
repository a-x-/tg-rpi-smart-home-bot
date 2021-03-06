const config = getConfig()
// eslint-disable-next-line import/no-unresolved
const consts = (process.env.CI ? require('../consts.sample') : require('../consts'))(config)
const throttle = require('lodash.throttle')
const debounce = require('just-debounce-it')
const thrw = require('throw')

const inflect = conf => val => require('cyrillic-inflector')(val, conf)

const { util, pify } = (() => {
  const util = require('util') // eslint-disable-line
  return { util, pify: util.promisify.bind(util) }
})()

const { read, write } = (() => {
  const fs = require('fs')
  const j2s = j => JSON.stringify(j, null, '\t')
  const writeFile = pify(fs.writeFile)
  const read = name => pify(fs.readFile)(name, 'utf8') // eslint-disable-line
  // eslint-disable-next-line
  const write = (name, content) => writeFile(name, typeof content === 'string' ? content : j2s(content), 'utf8')
  return { read, write }
})()

const parse = (() => {
  const { JSDOM: Jsdom } = require('jsdom')
  return html => new Jsdom(html)
})()

const open = (() => {
  const fetch = require('isomorphic-fetch')
  return uri => fetch(uri).then(r => r.status >= 400 ? thrw(r.status) : r.text())
})()

const exec = (() => {
  const childProcess = require('child_process')
  return pify(childProcess.exec.bind(childProcess))
})()

const decode = (() => {
  const { XmlEntities } = require('html-entities')
  return str => new XmlEntities().decode(str)
})()


const randFromList = (list) => list[Math.floor(Math.random() * list.length)]
const randRange = (from, to) => Math.floor(Math.random() * (to - from)) + from

const isDefined = val => val !== undefined && val !== null

const TOKEN = null
const token = process.env.BOT_TOKEN || TOKEN

// weirdTag`1${ 2 }3` --> '123'
const weirdTag = (strings, ...values) =>
  strings.reduce((res, str, i) => res + values[i - 1] + str)

// unindent`
//  123
// ` ---> '\n123\n'
const unindent = (strings, ...values) =>
  weirdTag(strings, ...values).split(/\n/).map(s => s.trim()).join('\n')

// TODO: combo
const combo = (...variants) => { // eslint-disable-line no-unused-vars
  throw new Error('not implemented yet')
}

class UserError extends Error {
  constructor (message, origError) {
    super(message)

    this.name = 'UserError'
    this.uniqId = `${ +new Date() }.${ Math.floor(Math.random() * (2 ** 16)) }`
    if (origError) this.orig = origError
  }
}

function join (...args) {
  return args
    .filter(p => p !== undefined && p !== null && (typeof p === 'string' ? p.length : true))
    .map(p => p instanceof Array ? join(...p) : p)
    .join('')
}

function getOkIcon () {
  return randFromList(['✅', '👌', '🆗', '🤖👍', '👏', '🤘', '💪', '😺', '👻', '🙏', '✨'])
}

const getIntro = (() => {
  const getIntro_ = debounce(() => {
    return `${ randFromList(['вигв+аме', 'кар+оч', 'сл+ушайте', 'эт с+амое']) }, ...  ... — `
  }, config && config.commands.list.voice.list.say.intro_delay * 1000, true)
  return () => getIntro_() || ''
})()

function openRpi3 (cmd, { isX11, isResident } = {}) {
  const x11 = isX11 ? 'DISPLAY=:0.0 ' : ''
  const resident = isResident ? 'screen -d -m ' : ''
  const cmd_ = cmd.replace(/'/g, '\'')
  // return exec(`ssh pi@rpi3 '${ x11 } ${ resident } ${ cmd_ }'`)
  return exec(`${ x11 } ${ resident } ${ cmd_ }`)
}

function getConfig () {
  if (!global.tgbotConfig) {
    global.tgbotConfig = (() => {
      try {
        // eslint-disable-next-line import/no-unresolved
        return process.env.CI ? require('../config.sample') : require('../config')
      } catch (e) {
        console.error('no config file', e)
        return null
      }
    })()
  }
  return global.tgbotConfig
}

/**
 * @example
 * objects = [{ a: 'a', b: 'b' }, { a: 'c', b: 'd' }, { a: 'e', b: 'f' }]
 * cb = (res, val, key) => res[key] + val
 * return = { a: 'ace', b: 'bdf' }
 */
function reduceObjectsThroughArray (objects, cb, init) {
  if (!objects) return objects
  if (!objects.length) return {}
  const hasInit = init !== undefined

  const res = {}
  {
    // eslint-disable-next-line no-unused-vars
    const initKey = hasInit ? ([_, key]) => { res[key] = init } : ([val, key]) => { res[key] = val }
    Object.entries(objects[0]).forEach(initKey)
  }
  const objects_ = hasInit ? objects : objects.slice(1)
  objects_.forEach((ans) => {
    return Object.entries(ans).forEach(([val, key]) => {
      return Object.assign(res, { [key]: cb(res, val, key) })
    })
  })
  return res
}

function setAsyncInterval (fn, interval) {
  let active = true
  const cycle = async () => {
    if (!active) return

    const res = await fn()

    if (res === setAsyncInterval.STOP) return
    setTimeout(cycle, interval)
  }
  cycle()
  return {
    stop: () => {
      active = false
    },
  }
}
setAsyncInterval.STOP = Symbol('setAsyncInterval.STOP')

module.exports = {
  // os utils
  util,
  read,
  write,
  exec,
  // functions utils
  throttle,
  debounce,
  reduceObjectsThroughArray,
  // random
  randFromList,
  randRange,
  // conf
  config,
  consts,
  token, // tg-token
  // misc
  inflect,
  open,
  parse,
  decode,
  unindent,
  combo,
  UserError,
  join,
  getOkIcon,
  getIntro,
  openRpi3,
  isDefined,
  setAsyncInterval,
}
