const express = require("express");
const fetch = require("node-fetch");

const apiRouter = express.Router();

apiRouter.get("/:geoCoo", async (req, res, next) => {
  try {
    const url = process.env.WEATHER_APP_URL;
    const key = process.env.WEATHER_APP_KEY;
    let query = `forecast?${req.params.geoCoo}&appid=${key}`;
    console.log(req.params.geoCoo)
    let response = await fetch(url + query);
    let weather = await response.json();
    res.send(weather);
  } catch (error) {
    next(error);
  }
});



module.exports = apiRouter;