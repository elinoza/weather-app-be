const express = require("express");
const fetch = require("node-fetch");

const apiRouter = express.Router();

apiRouter.get("/:geoCoo", async (req, res, next) => {
  try {
    const url = process.env.WEATHER_APP_URL;
    const key = process.env.WEATHER_APP_KEY;
    const units="metric"
    let query = `forecast?${req.params.geoCoo}&appid=${key}&units=${units}`;
    console.log(req.params.geoCoo)
    let response = await fetch(url + query);
    let weather = await response.json();

    res.send(weather);
  } catch (error) {
    next(error);
  }
});

apiRouter.get("/geo/:selectedCity",async(req,res,next)=>{

try {
  console.log(process.env.WEATHER_APP_CONVERTER_URL,process.env.WEATHER_APP_KEY)
  
  const url = process.env.WEATHER_APP_CONVERTER_URL;
  const key = process.env.WEATHER_APP_KEY;
  const limit= 10;
 
  let query = `direct?q=${req.params.selectedCity}&limit=${limit}&appid=${key}`;
  console.log(req.params.selectedCity,query,url,limit)
  let response = await fetch (url+query)
  let weather = await response.json()
  res.send(weather)
} catch (error) {
  next(error)
}

})



module.exports = apiRouter;