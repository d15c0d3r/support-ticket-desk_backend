var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

const orgRouter = require("./routes/organization");
const userRouter = require("./routes/user");
const ticketRouter = require("./routes/ticket");
const customerRouter = require("./routes/customer");
const healthRouter = require("./routes/health");

const authMiddleware = require("./middleware/auth-middleware");

var app = express();

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//middleware
app.use("/", authMiddleware);

//use Routes
app.use("/health", healthRouter);
app.use("/apis/orgs", orgRouter);
app.use("/apis/orgs/:orgId/users", userRouter);
app.use("/apis/orgs/:orgId/tickets", ticketRouter);
app.use("/apis/orgs/:orgId/customers", customerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
