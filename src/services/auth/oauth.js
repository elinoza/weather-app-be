const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy

const UserSchema = require("../users/Schema")
const { authenticate } = require("./tools")

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL:process.env.BACKEND_URL+"/users/googleRedirect",
    },
    async (request, accessToken, refreshToken, profile, next) => {
     

      try {
        const email= await UserSchema.findOne({email:profile.emails[0].value})
        if(email){  //email is already in database,please provide your password and login
          // const error = new Error("email is already in database,please provide your password and login");
          // error.httpStatusCode = 400;
          // next(error);
          next(null)}
      
        else{



        const user = await UserSchema.findOne({ googleId: profile.id })

        if (user) {
          const tokens = await authenticate(user)
          next(null, { user, tokens })
        } else {
        const newUser = {
                googleId: profile.id,
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
                // refreshToken:[]
           }
          const createdUser =  new UserSchema(newUser)
          await createdUser.save()
          const tokens = await authenticate(createdUser)
          
          next(null, { user: createdUser, tokens })
        }}
      } catch (error) {
          console.log(error)
        next(error)
      }
    }
  )
)


passport.serializeUser(function (user, next) {
  next(null, user)
})