const express = require("express");
const favModel = require("./schema")

const favsRouter = express.Router()

favsRouter.get("/",  async(req, res) => {
  try {
    const favs = await favModel.find()
    res.send(favs);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
favsRouter.post("/", async (req, res, next) => {
  try {
    const newfav = new favModel(req.body)

    const { _id } = await newfav.save()
    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

favsRouter.get("/:id", async (req, res, next) => {
  try {
    const fav = await favModel.findById(req.params.id)
    res.send(fav)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

favsRouter.put("/:id", async (req, res, next) => {
  try {
    const modifiedfav = await favModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    )
    if (modifiedfav) {
      res.send(modifiedfav)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

favsRouter.delete("/:id", async (req, res, next) => {
  try {
    const fav = await favModel.findByIdAndDelete(req.params.id)
    if (fav) {
      res.send(fav)
    } else {
      next()
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})


module.exports = favsRouter;
