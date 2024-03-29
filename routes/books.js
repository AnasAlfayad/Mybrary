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

// Get All Books
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

// Get New Book Page
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});

// Post New Book
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
    res.redirect(`books/${newBook.id}`);
  } catch (error) {
    // console.error(error);
    // if (book.coverImageName !== null) {
    //   removeBookCover(book.coverImageName);
    // }
    renderNewPage(res, book, true);
  }
});

// Get Book Show
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate("author").exec();
    res.render("books/show", { book: book });
  } catch (error) {
    res.redirect("/");
  }
});

// Get Book Edit
router.get("/:id/edit", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    renderEditPage(res, book);
  } catch (error) {
    res.redirect("/");
  }
});

// Update Book
router.put("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    book.title = req.body.title;
    book.author = req.body.author;
    book.publishDate = new Date(req.body.publishDate);
    book.pageCount = req.body.pageCount;
    book.description = req.body.description;
    if (req.body.cover !== null && req.body.cover !== "") {
      saveCover(book, req.body.cover);
    }
    await book.save();
    res.redirect(`/books/${book.id}`);
  } catch (error) {
    console.log(error);
    if (book !== null) {
      renderEditPage(res, book, true);
    } else {
      redirect("/");
    }
  }
});

// Delete Book
router.delete("/:id", async (req, res) => {
  let book;
  try {
    book = await Book.findById(req.params.id);
    await book.deleteOne();
    res.redirect("/books");
  } catch (error) {
    if (book != null) {
      res.render("books/show", {
        book: book,
        errorMessage: "Could not remove book",
      });
    } else {
      res.redirect("/");
    }
  }
});

async function renderNewPage(res, book, hasError = false) {
  renderFormPage(res, book, "new", hasError);
}

async function renderEditPage(res, book, hasError = false) {
  renderFormPage(res, book, "edit", hasError);
}

async function renderFormPage(res, book, form, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = { authors: authors, book: book };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = `Error Updating Book`;
      } else {
        params.errorMessage = `Error Creating Book`;
      }
    }
    res.render(`books/${form}`, params);
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
  if (coverEncoded === "") return;
  // console.log(`coverEncoded is empty? ${coverEncoded === ""}`);
  const cover = JSON.parse(coverEncoded);
  if (cover !== null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, "base64");
    book.coverImageType = cover.type;
  }
}

module.exports = router;
