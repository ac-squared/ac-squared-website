// index.js

// get the project elements
const projectLoading = document.getElementById("projects-loading")
const projectGrid = document.getElementById("projects-grid")

// get the calendar elements
const calendarLoading = document.getElementById("calendar-loading")
const calendarGrid = document.getElementById("calendar-grid")

// months & days of the week in nice names
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// load the featured projects from the server
const loadProjects = () => {
  return new Promise(async (res, rej) => {
    // request the api endpoint
    const projectRequest = await fetch('./api/projects/featured')
    const projectResponse = await projectRequest.json()

    // if the request is not ok show an error message
    if(projectRequest.status != 200) {
      projectLoading.innerText = projectResponse.error ?? `Failed to load! 😭`

      rej(new Error('Failed to load projects!'))
      return;
    }

    // get the array of featured projects
    const featured = projectResponse.featured

    // if there's none show the error message
    if(featured.length == 0) {
      projectLoading.innerText = `No projects are featured right now! 🧑‍💻`
      res()
      return;
    }
    
    const elements = []
    
    // create the elements for all projects
    for(const feature of featured) {
      const element = document.createElement("div")
      element.classList.add("project")

      const name = document.createElement("h2")
      name.innerText = feature.name
      element.appendChild(name)

      const info = document.createElement("p")
      info.innerText = feature.description
      element.appendChild(info)

      const link = document.createElement("a")
      link.classList.add("button")
      link.target = "_blank"
      link.href = feature.url
      link.innerText = "Repository"
      element.appendChild(link)
      
      elements.push(element)
    }
    
    // add them to the grid
    projectGrid.replaceChildren(...elements)

    // switch from loading to the grid of projects
    projectLoading.style.display = "none"
    projectGrid.style.display = "grid"

    res()
  })
}

// load the upcoming calendar events from the server
const loadCalendar = () => {
  return new Promise(async (res, rej) => {
    // request the api endpoint
    const calendarRequest = await fetch('./api/calendar/events')
    const calendarResponse = await calendarRequest.json()

    // if the request is not ok show an error message
    if(calendarRequest.status != 200) {
      calendarLoading.innerText = calendarResponse.error ?? `Failed to load! 😭`

      rej(new Error('Failed to load calendar!'))
      return;
    }

    // get the array of calendar events
    const events = calendarResponse.events

    const elements = []

    // create the elements for all events
    for(const event of events) {
      // skip if event already happened
      if(event.time < Date.now()) continue;

      const day = new Date(event.time)
      const dateText = `${days[day.getDay()]} ${day.getDate()} ${months[day.getMonth()]} ${day.getFullYear()}`
      const timeText = `${day.getHours()}:${day.getMinutes().toString().padStart(2, '0')}`

      const element = document.createElement("div")
      element.classList.add("calendar")

      const info = document.createElement("p")
      info.classList.add("calendar-info")
      element.appendChild(info)
  
      const title = document.createElement("span")
      title.classList.add("calendar-title")
      title.innerText = event.name
      info.appendChild(title)

      const place = document.createElement("span")
      place.innerText = ` at ${event.location}`
      info.appendChild(place)

      const date = document.createElement("p")
      date.classList.add("calendar-date")
      element.appendChild(date)

      const time = document.createElement("span")
      time.innerText = `${dateText} at ${timeText}`
      date.appendChild(time)

      elements.push(element)
    }

    // if there's none show the error message
    // after the creating elements as all events may have passed already
    if(elements.length == 0) {
      calendarLoading.innerText = `No events upcoming! 😎`
      res()
      return;
    }
    
    // add them to the grid
    calendarGrid.replaceChildren(...elements)

    // switch from loading to the grid of events
    calendarLoading.style.display = "none"
    calendarGrid.style.display = "grid"

    res()
  })
}

// load all data from the server
const start = async () => {
  await loadProjects()
  await loadCalendar()
}

// await the document being ready before starting!
document.addEventListener('DOMContentLoaded', start)