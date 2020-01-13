import mongoose from "mongoose";
// TODO: mongo
const schema = new mongoose.Schema({
  user_id: {
    type: Number
  },
  content: {
    type: Array
  },
  created_at: { type: Date },
  updated_at: { type: Date }
});

schema.pre("save", function(next) {
  this.created_at = new Date();
  next();
});

schema.pre("findOneAndUpdate", function(next) {
  this._update.updated_at = new Date();
  next();
});

const stock = new mongoose.model("Stock", schema);

export default stock;
