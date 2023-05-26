const express = require("express");
const UserSchema = require("./Schema");
const favSchema = require("../favs/schema");
const passport = require("passport");
const mongoose = require("mongoose")
const sgMail = require("@sendgrid/mail")

const { authenticate } = require("../auth/tools");
const { authorize } = require("../auth/middleware");

const userRouter = express.Router();

// get all users
userRouter.get("/", async (req, res, next) => {
  try {
    const users = await UserSchema.find();
    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
});

userRouter.get(
  "/googleLogin",
  passport.authenticate("google", { scope: ["profile", "email"] })

);

userRouter.get(
  "/googleRedirect",
  passport.authenticate("google"),
  async (req, res, next) => {
    try {
      //res.cookie("accessToken", req.user.tokens.accessToken, {
      // httpOnly: true,
      //});
      // res.cookie("refreshToken", req.user.tokens.refreshToken, {
      //   httpOnly: true,
      //   path: "/authors/refreshToken",
      // })
      // res.status(200).redirect("http://localhost:3000/");
      res.redirect(
        process.env.FRONTEND_URL + "?accessToken=" + req.user.tokens.accessToken
      ); //-->without cookies shitty method:D
    } catch (error) {
      next(error);
    }
  }
);

// get single user
userRouter.get("/me", authorize, async (req, res, next) => {
  try {

    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

// edit user

userRouter.put("/me",authorize, async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
    res.send(updates);
  } catch (error) {
    next(error);
  }
});

// delete user
userRouter.delete("/me", async (req, res, next) => {
  try {
    await res.user.deleteOne();
    res.status(204).send("Delete");
  } catch (error) {
    next(error);
  }
});

//post a new user
userRouter.post("/", async (req, res, next) => {
  try {

      const newUser = new UserSchema(req.body);
      const { _id } = await newUser.save();
  
      res.status(201).send(_id);
    
  } catch (error) {
    next(error);
  }
});
// user logins here
userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserSchema.findByCredentials(email, password);
    console.log(user);

    if (user) {
      const { accessToken } = await authenticate(user);
      console.log(accessToken);
      // without cookies res.send(tokens)
      //  Send back tokens
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        path: "/",
      });
      // res.cookie("refreshToken", refreshToken, {
      //   httpOnly: true,
      //   path: "/users/refreshToken",
      // })

      res.send(accessToken);
    } else {
      //user not found or password &user is not matched
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});
userRouter.post("/logout", async (req, res, next) => {
  try {
    // find the user's refresh token
    req.user.accessToken = req.user.accessToken.filter(
      (token) => token.token !== req.body.accessToken
    );

    await req.user.save();

    res.send("Logged out");
  } catch (error) {
    next(error);
  }
});

/// EMBEDDING FAVS

userRouter.post("/:id/favs",  authorize,async (req, res, next) => {
  try {
    const fav = new favSchema(req.body);
  

    const favToInsert = { ...fav.toObject() };
    console.log(fav, favToInsert);

    const updated = await UserSchema.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          favs: favToInsert,
        },
      },
      { runValidators: true, new: true }
    );
    res.status(201).send(updated);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:id/favs",  async (req, res, next) => {
  user=req.user
  console.log(user)
  try {
    const { favs } = await UserSchema.findById(req.params.id, {
      favs: 1,
      _id: 0,
    });
    res.send(favs);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.get("/:id/favs/:favId",  async (req, res, next) => {
  try {
    const { favs } = await UserSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        favs: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.favId) },
        },
      }
    );

    if (favs && favs.length > 0) {
      res.send(favs[0]);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.delete("/:id/favs/:favId", async (req, res, next) => {
  try {
    const modifiedfav = await UserSchema.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          favs: { _id: mongoose.Types.ObjectId(req.params.favId) },
        },
      },
      {
        new: true,
      }
    );
    res.send(modifiedfav);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRouter.put("/:id/favs/:favId", async (req, res, next) => {
  try {
    const { favs } = await UserSchema.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        favs: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.favId) },
        },
      }
    );

    if (favs && favs.length > 0) {
      const favToReplace = { ...favs[0].toObject(), ...req.body };

      const modifiedfav = await UserSchema.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "favs._id": mongoose.Types.ObjectId(req.params.favId),
        },
        { $set: { "favs.$": favToReplace } },
        {
          runValidators: true,
          new: true,
        }
      );
      res.send(modifiedfav);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});




//sending password to email adress
userRouter.post("/send/email",async (req,res,next)=>{
  try {

    const { email } = req.body;
    const user = await UserSchema.findByEmail(email);
    console.log("rq.body",req.body.email,"user",user)
  if (user){
    const { accessToken } = await authenticate(user);
    console.log(accessToken);
    let link=`${process.env.DEPLOYED_FRONTEND}/Reset?accessToken=${accessToken}`;
    //sgMail.setApiKey(process.env.SENDGRID_API_KEY)


    const msg = {
      to: email,
      from: "helenstudyo@gmail.com",
      subject: "Your reset link Password for Weather App",
      text: "Your password reset link for the Weather App ",
      html: ` <a  href="${link}">You reset your password here.</a>`,
    }
   //await sgMail.send(msg)
    res.status.send("Password link is sent to your email")
  }
  else{
     //user not found or password not found
     const error = new Error();
     error.httpStatusCode = 404;
     next(error);

  }
    
  } catch (error) {
    next(error)
    
  }
})

module.exports = userRouter;
