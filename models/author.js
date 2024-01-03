const mongoose = require("mongoose");
const Book = require("./book");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

authorSchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    // console.log(this.id);
    const books = await Book.find({ author: this.id });
    // console.log(books.length);
    if (books.length > 0) {
      throw new Error("this author still has books");
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Author", authorSchema);
