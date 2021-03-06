const { inflect, exec } = require('../src/common')

const getUnit = inflect({ zero: 'градусов', one: 'градус', some: 'градуса', many: 'градусов' })

module.exports = () => ({
  async forecast () {
    const weather = await exec('get-weather2').then(res => JSON.parse(res))

    const temp = Math.floor(weather.temp)
    const eveningTemp = Math.floor(weather.eveningTemp)
    if (!weather.description || !weather.temp) throw new Error('no_data')
    const formattedWeather = `Погода в ближайшее время: ${ weather.description || '' } ${ temp } ${ getUnit(temp) }.
    А вечером:  ${ eveningTemp } ${ getUnit(eveningTemp) }`

    return formattedWeather

    // weather.icon && app.telegram.sendPhoto(ctx.chat.id, `http://openweathermap.org/img/w/${ weather.icon }.png`,
    //    {disable_notification: true})
    // const url = `http://tg-bot-web.invntrm.ru/weathericons/${ weather.icon }.svg`
    // weather.icon && app.telegram.sendPhoto(ctx.chat.id, url, {disable_notification: true})
  },
})
