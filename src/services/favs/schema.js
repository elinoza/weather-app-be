const {
  Schema,
  model
} = require("mongoose")

const favSchema = new Schema({
      favCity: {
        type: String,
        required: true
      },

      geoCoo: {
        type: String,
        required: true
      },
    
    },



  {
    timestamps: true,
  }
)

module.exports = model("fav", favSchema)