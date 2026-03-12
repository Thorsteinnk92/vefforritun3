/* --------------------------

   INITIAL EXPRESS CONFIG  
   (Middleware, CORS, JSON)

-------------------------- */

import express, { json } from "express";
import cors from "cors";
import { events, attendees } from "./data/initialData.js";
import { getNextEventId, getNextAttendeeId } from "./data/initialData.js";



const app = express();


/* Base url parameters and port settings */
const apiPath = "/api/";
const version = "v1";
const port = 3000;
const parseId = (value) => {
  const n = Number(value)
  if(Number.isInteger(n) && n > 0) {
    return n;
  } else {
    return null;
  }

}
const validateEventId = (req, res, next) => {
  const eventId = parseId(req.params.eventId);
  if (!eventId) {
    return res.status(400).json({ message: "EventID not valid" })
  }
  req.eventId = eventId
  next();
}



/* Set Cors-related headers to prevent blocking of local requests */
app.use(json());
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/* Initial Data */

// app.get(`${apiPath}${version}/events`, (req, res) => {
  
const api = express.Router();
app.use("/api/v1", api)
  
/* --------------------------

      EVENTS ENDPOINTS     

-------------------------- */

/* --------------------------
//Endpoint: read all events
Method: GET
Url: /api/v1/events

Endpoint: Read a specifi event
If endpoint is invalid request returns 400
if successful returns 200

*/
api.post("/api/v1/events", (req,res) => {
  const {name, location, date} = req.body
}
)
api.get("/events", (req, res) => {
  const {name, location, ...rest} = req.query

  if (Object.keys(rest).length > 0) {
    return res.status(400).json({message: "Invalid query param"})
  }

  let filteredData = events

  if (name) {
    filteredData = filteredData.filter(e =>
      e.name.toLowerCase().includes(name.toLowerCase())
    )
  }
  if (location) {
    filteredData = filteredData.filter(e => 
      e.location.toLowerCase().includes(location.toLowerCase())
    )
  }
  res.status(200).json(filteredData)
})

api.get("/events/:eventId", validateEventId, (req, res) => {
  const event = events.find(e => e.id === req.eventId)  
  if (!event) {
    return res.status(404).json({ message: "Event not found" })
  }
  const attendeeCount = attendees.filter(a => a.eventIds.includes(req.eventId)).length
  res.status(200).json({ ...event, attendeeCount })
})
api.get("/attendees", (req, res) => {
  res.status(200).json(attendees)
})
/*



    ATTENDEES ENDPOINTS    

-------------------------- */

//Endpoint: Read all attendees
//If non exist, an empty array is returned
//The request returns status 200
//Method: Get
// Url: /api/v1/events/attendees
/*
Endpoint: create a new event
*/
api.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" })
})
/* --------------------------

      SERVER INITIALIZATION  
      
!! DO NOT REMOVE OR CHANGE THE FOLLOWING (IT HAS TO BE AT THE END OF THE FILE) !!
      
-------------------------- */
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
