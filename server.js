// server.js

// import environment variables
import 'dotenv/config'

// import the express package to create the web server
import express from "express";

// import the path package to help navigate the file system
import path from "path"

// import the custom router
import { router } from "./routes/route.js"
import { calendar } from "./routes/calendar.js"

// create a new express application
const app = express();

// read the prefered port from the environment variable, otherwise use http port 80
const PORT = process.env.PORT || 80;

// use the json middleware to read json data from an api request
app.use(express.json());

// use the static middleware to make static files available to requests
app.use(express.static(path.resolve('public')));

// use the router middleware to accept requests at the root
app.use('/', router)
app.use('/api/calendar', calendar)

// start the app on the specified port and check for errors
app.listen(PORT, (error) => {
  if (error) {
    console.error(`failed to start the server`);
  } else {
    console.log(`server running on port ${PORT}`);
  }
});
