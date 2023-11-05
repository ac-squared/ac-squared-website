// calendar.js

// import the express package to create the web server
import express from "express"

// import the path package to help navigate the file system
import path from "path"

// import the ical library for reading calendars
import ical from "node-ical"

// import the fetch library for reading from urls
import fetch from "node-fetch"

// create a new express route
const router = express.Router()

// get the ICAL url from environment variables
const icalURL = process.env.ICAL

// months & days of the week in nice names
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// when the router recieves a request at the root, send the homepage file
router.get('/events', async (request, response) => {
  // if the ical url is missing, send an error!
  if(!icalURL) {
    response.status(500).json({error: "calendar not found"})
    return;
  }

  try {
    // downloaded the latest calendar information
    const calendarRequest = await fetch(icalURL)
    const calendarResponse = await calendarRequest.text()

    // parse the ical calendar
    const calendar = await ical.async.parseICS(calendarResponse)

    const events = []

    // loop over events add add them to the array
    for (let item in calendar) {
      if (calendar.hasOwnProperty(item)) {
        const event = calendar[item]
        if (event.type == 'VEVENT') {
          const data = {
            name: event.summary,
            location: event.location ?? `Coding Club`,
            date: `${days[event.start.getDay()]} ${event.start.getDate()} ${months[event.start.getMonth()]} ${event.start.getFullYear()}`,
            time: `${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, '0')}`
          }

          events.push(data)
        }
      }
    }

    // send the response to the client
    response.status(200).json({ events })
  } catch (e) {
    console.error(e)
    response.status(500).json({ error: "An unknown error occurred!" })
  }
})

// export the router
export { router as calendar }