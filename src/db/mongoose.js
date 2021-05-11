const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin-abishek:test123@cluster0-ezbw2.mongodb.net/sentiment-android", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});