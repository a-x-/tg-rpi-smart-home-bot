const { randRange } = require('./common')

// const { reportHomematesPresenseChange } = require('../plugins/home');

const cron = (...args) => new (require('cron').CronJob)(...args, null, 'Russia/Moscow')
const HOUR = 1000 * 60 * 60
const DAY = HOUR * 24


// const cronTasks = (strings) => {
//   strings[0].split(/\n/)
//   .map(line => line.trim())
//   .filter(line => lint)
//   .map(task => {
//     const [s, m, h, dom, mon, dow, ...cmd] = task.split(/\s+/);
//     cron([s, m, h, dom, mon, dow].join(' '), exec(cmd.join(' ')));
//   });
// };

// setInterval(reportHomematesPresenseChange, 1000 * 60 * 1);

// todo: rpi3 vol
// todo: alex presense ifttt signal => light schedule

module.exports = ({ commands }) => {

  //    ss mm hh dom mon dow
  cron('00 00  1 *   *   *  ', () => commands.runSys('light', 'off'))
  cron('00 30  9 *   *   *  ', () => commands.runSys('light', 'on'))
  cron('00 10 12 *   *   *  ', () => commands.runSys('light', 'off'))

  cron('00 30 09 *   *   *  ', () => commands.runSys('vol', 'upTo',  80))
  cron('00 00 10 *   *   *  ', () => commands.runSys('vol', 'upTo',  90))
  cron('00 30 10 *   *   *  ', () => commands.runSys('vol', 'upTo', 100))
  cron('00 00 23 *   *   *  ', () => commands.runSys('vol', 'downTo', 90))
  cron('00 00 01 *   *   *  ', () => commands.runSys('vol', 'downTo', 80))
  cron('00 00 02 *   *   *  ', () => commands.runSys('vol', 'downTo', 70))

  cron('00 28 09 *   *   *  ', () => commands.runSys('weather', 'forecast'))
  cron('00 06 12 *   *   *  ', () => commands.runSys('weather', 'forecast'))

  cron('00 00 09 *   *   *  ', () => setTimeout(() => commands.runSys('jokes', 'joke'), randRange(HOUR, 8 * HOUR)))

  // cron('00 00 14 *   *   mon', () => commands.runSys('delivery', 'water')) // TODO: sync with vacancy schedule

  // cron('00 00 10 *   *   *  ', () => commands.runSys('music', 'podcast')) // while I'm out
}
