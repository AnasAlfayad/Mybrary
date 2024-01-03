const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");

// Get All Authors Route
router.get("/", async (req, res) => {
  let searchOptions = {};
  if (req.query.name !== null && req.query.name !== "") {
    searchOptions.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOptions);
    res.render("authors/index", { authors: authors, searchOptions: req.query });
  } catch (error) {
    res.redirect("/");
  }
});

// Get New Author Page Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});

// Post New Author Route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name,
  });
  try {
    const newAuthor = await author.save();
    res.redirect(`authors/${newAuthor.id}`);
    console.log(`The Author ${author.name} has been created!`);
  } catch {
    res.render("authors/new", {
      author: author,
      errorMessage: "Error creating Author",
    });
    // console.error(error);
  }
});

// Get Author show page By ID
router.get("/:id", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    const books = await Book.find({ author: author.id }).limit(6).exec();
    res.render("authors/show", { author: author, booksByAuthor: books });
  } catch (error) {
    // console.error(error); remove all logs on production mode
    res.redirect("/");
  }
});

// Get Author Edit Page By ID
router.get("/:id/edit", async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    res.render("authors/edit", { author: author });
  } catch (error) {
    console.log("Get Author Edit Page Failed");
    res.redirect("/authors");
  }
});

// Update Author Then Show His Page
router.put("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    author.name = req.body.name;
    await author.save();
    res.redirect(`/authors/${author.id}`);
  } catch {
    if (author === null) {
      res.redirect("/");
    } else {
      console.log("Update Author Failed");
      res.render("authors/edit", {
        author: author,
        errorMessage: "Error updating Author",
      });
    }
  }
});

// Delete Author Then Show All Authors Page
router.delete("/:id", async (req, res) => {
  let author;
  try {
    author = await Author.findById(req.params.id);
    await author.deleteOne();
    res.redirect("/authors");
  } catch (error) {
    if (author === null) {
      res.redirect("/");
    } else {
      console.log(`Delete Author Failed Because ${error.message}`);
      res.redirect(`/authors/${author.id}`);
    }
  }
});

module.exports = router;
