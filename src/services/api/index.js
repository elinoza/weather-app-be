const express = require("express");
const fetch = require("node-fetch");

const apiRouter = express.Router();

apiRouter.get("/:city", async (req, res, next) => {
  try {
    const url = process.env.WEATHER_APP_URL;
    const key = process.env.WEATHER_APP_KEY;
    let query = `forecast?q=${req.params.city}&appid=${key}`;
    let response = await fetch(url + query);
    let weather = await response.json();
    res.send(weather);
  } catch (error) {
    next(error);
  }
});



module.exports = apiRouter;