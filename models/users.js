import mongoose from "mongoose";

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ""
  },
  lastName: {
    type: String,
    default: ""
  },
  dob: Date,
  address: String,
  phone: String,
  role: String
});

const user = new mongoose.model("User", schema);

export default user;
