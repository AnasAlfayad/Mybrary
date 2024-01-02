const express = require("express");
const router = express.Router();
const Author = require("../models/author");
const Book = require("../models/book");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const uploadPath = path.join("public", Book.coverImageBasePath);
// const upload = multer({
//   dest: uploadPath,
//   fileFilter: (req, file, callback) => {
//     callback(null, imageMimeTypes.includes(file.mimetype));
//   },
// });

//All Books Route
router.get("/", async (req, res) => {
  let query = Book.find();
  // console.log(req.query.title);
  if (req.query.title !== undefined && req.query.title !== "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (
    req.query.publishedBefore !== undefined &&
    req.query.publishedBefore !== ""
  ) {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (
    req.query.publishedAfter !== undefined &&
    req.query.publishedAfter !== ""
  ) {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  try {
    const books = await query.exec();
    // console.log(books);
    res.render("books/index", {
      books: books,
      searchOptions: req.query,
    });
  } catch (error) {
    res.redirect("/");
  }
});

// New Book Route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Create Book Route
router.post("/", async (req, res) => {
  // const fileName = req.file !== undefined ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    // coverImageName: fileName,
    description: req.body.description,
  });
  saveCover(book, req.body.cover);
  try {
    const newBook = await book.save();
    // res.redirect(`books/${newBook.id}`)
    res.redirect("books");
  } catch (error) {
    // console.error(error);
    // if (book.coverImageName !== null) {
    //   removeBookCover(book.coverImageName);
    // }
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors: authors, book: book };
    if (hasError) params.errorMessage = "Error Creating Book";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}

// function removeBookCover(fileName) {
//   fs.unlink(path.join(uploadPath, fileName), (err) => {
//     if (err) console.error(err);
//   });
// }

function saveCover(book, coverEncoded) {
  if (coverEncoded === null) return;
  const cover = JSON.parse(coverEncoded);
  if (cover !== null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
