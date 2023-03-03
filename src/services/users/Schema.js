const { Schema, model } = require("mongoose");

const bcrypt = require("bcryptjs");


const UserSchema = new Schema(
  {
    name: {
      type: String
    },
    surname: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    googleId:{
      type:String
    },
    favs:[
      {
        favCity: String
      }
    ]
    
    // refreshTokens: [
    //   {
    //     token: {
    //       type: String,
    //     },
    //   },
    // ],
  },
  { timestamps: true }
);


UserSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.__v

  return userObject
}

UserSchema.pre("save", async function (next) {
  const user= this
  const plainPW = user.password
// Only run this function below if password was moddified (not on other update functions)
  if (user.isModified("password")) {
      // Hash password with strength of 10
    user.password = await bcrypt.hash(plainPW, 10)

     //remove the confirm field 
  //this.passwordConfirm = undefined;
  }
  next()
})

UserSchema .statics.findByCredentials = async function(email, plainPW)  {
  const user = await this.findOne({ email })
  
  if (user) {
    const isMatch = await bcrypt.compare(plainPW, user.password)
    console.log("isMatch?",isMatch)
    if (isMatch) 
    return user
    else return console.log("user isnt matched user:",user)
  } else {
    return console.log( "findbycredential problem user:",user)
  }
}



module.exports = model("user", UserSchema);
