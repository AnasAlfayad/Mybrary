if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");

const indexRouter = require("./routes/index");
const authorRouter = require("./routes/authors");
const bookRouter = require("./routes/books");

app.set("view engine", "ejs");
app.set("views", "./views"); // This defaults to the views directory in the application root directory. view engine
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

const mongoose = require("mongoose");
main().catch((err) => console.error(err));

async function main() {
  await mongoose.connect(process.env.DATABASE_URL);
}
const mongooseDB = mongoose.connection;
mongooseDB.on("error", (error) => console.error(error));
mongooseDB.once("open", () => console.log("Connected to Mongoose"));

app.use("/", indexRouter);
app.use("/authors", authorRouter);
app.use("/books", bookRouter);

app.listen(process.env.PORT || 3000);
