/* --------------------------

    INITIAL EXPRESS CONFIG  
    (Middleware, CORS, JSON)

-------------------------- */

import express, { json } from "express";

/* Use cors to avoid issues with testing on localhost */
import cors from "cors";

const app = express();

/* Base url parameters and port settings */
const apiPath = "/api/";
const version = "v1";
const port = 3000;

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
import { events, attendees } from "./data/initialData.js";
import { getNextEventId, getNextAttendeeId } from "./data/initialData.js";

/* --------------------------

      HELPER FUNCTIONS    

-------------------------- */

const parseId = (value) => {
  const n = Number(value);
  if (Number.isInteger(n) && n > 0) {
    return n;
  }
  else {
    return null;
  }
};

const validateEventId = (req, res, next) => {
  const eventId = parseId(req.params.eventId);
  if (!eventId) {
    return res.status(400).json({message: "Event ID invalid, must be positive integer"
      
    });
  }
  req.eventId = eventId;
  next();
}

const ensureEventExists = (req, res, next) => {
  const event = events.find(e => e.id === req.eventId);
  if (!event) {
    return res.status(404).json({
      message: "Event not found"
    })
  }
  req.event = event;
  next();
};


/* --------------------------

      EVENTS ENDPOINTS     

-------------------------- */


app.get('/api/v1/events',  (req, res) => {
  const allowedParams = ['name', 'location'];
  const receivedParams = Object.keys(req.query);

  const hasInvalidParams = receivedParams.some(p => !allowedParams.includes(p));
  if (hasInvalidParams) {
    return res.status(400).json({ message: "Invalid query parameter" })
  }

  const { name, location } = req.query;

  let results = events;

  if (name) {
    results = results.filter(e => e.name.toLocaleLowerCase().includes(name.toLocaleLowerCase())
    );
  }
  if (location) {
    results = results.filter(e => e.location.toLocaleLowerCase().includes(location.toLowerCase())
    );
  }

  return res.status(200).json(results);
});

app.get('/api/v1/events/:eventId', validateEventId, ensureEventExists, (req, res) => {
  const attendeeCount = attendees.filter(a => a.eventIds.includes(req.eventId)).length;
  return res.status(200).json({ ...req.event, attendeeCount})
});

/* --------------------------

    ATTENDEES ENDPOINTS    

-------------------------- */
app.get('/api/v1/attendees',  (req, res) => {
  return res.status(200).json(attendees);
});

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









app.post('/api/v1/attendees', (req, res) => {

  
  const {name, email} = req.body;
  
  if (!name || !email) {
    return res.status(400).json({message: "Name and location are missing"})
  }
  
  if (!email.includes("@")) {
    return res.status(400).json({message: "Email must contain @ signal"})
  }
  
  const duplicate = attendees.find(a => 
    a.email.toLowerCase() === email.trim().toLowerCase()
  );

  if(duplicate) {
    return res.status(400).json({message: "Email is already in use"})
  }
  
  const new_attendee = {
    id: getNextAttendeeId(),
    name: name.trim(),
    email: email.trim(),
    eventIds: []
  };
  
  attendees.push(new_attendee);
  return res.status(201).json(new_attendee)
})