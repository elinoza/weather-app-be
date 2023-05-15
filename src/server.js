const express = require("express");//Primary
const listEndPoints = require("express-list-endpoints");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const oauth = require("./services/auth/oauth");

const {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");


//API ROUTES are Primary
const userRoutes = require("./services/users/index");
const apiRoutes = require("./services/api/index");
const favsRoutes = require("./services/favs/index");

const server = express();//Primary

server.use(express.json());//express.json() is a built-in middleware function in Express.js that is used to parse JSON-encoded data in the request body. It is used to extract the JSON object from the request body and make it available in the req.body property of the request object.Without express.json(), we would have to manually parse the JSON data from the request body using something like JSON.parse(). However, using express.json() simplifies this process and makes it easier to work with JSON data in an Express.js app.
server.use(cookieParser());//we're using cookie-parser as middleware to read and write cookies.Without cookie-parser, we would need to manually parse the cookie header from the incoming request and set cookies on the response using the Set-Cookie header. However, using cookie-parser simplifies this process and makes it easier to work with cookies in an Express.js app.
server.use(passport.initialize());// a middleware function in the Passport.js authentication framework that is used to initialize Passport and set up the authentication session. It is typically used in an Express.js app to enable authentication and handle user login and logout requests.

const whitelist = ["https://weather-app-elinoza.vercel.app/","http://localhost:3000"];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,// this makes cookies allowed.by default it s not allowed
};

server.use(cors(corsOptions));
server.use("/users", userRoutes);
server.use("/api", apiRoutes);
server.use("/favs", favsRoutes);

server.use(badRequestHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndPoints(server));

mongoose.set("debug", true);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(process.env.PORT, () => {
      console.log("Server running on port: ", process.env.PORT);
    })
  )
  .catch(console.error);// server listening is primary
