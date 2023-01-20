const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require('cors');
const sessions = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const dbconnect = require("./config/connection");


const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;
app.use(morgan('dev'));

app.use(cookieParser());
dbconnect.dbconnect()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions ={
  origin:'http://localhost:3000', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(express.static("public"));
app.use("/img", express.static(path.join(__dirname + "public/user/img")));
app.use("/products",express.static(path.join(__dirname + "public/admin/products")));
app.set("view engine", "ejs");

app.use(
  sessions({
    secret: "123",
    resave: true,
    saveUninitialized: true,
    // cookie: { maxAge: 3000000 },
  })
);
app.use((req, res, next) => {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/admin", adminRouter);
app.use("/", userRouter);
app.use('*',(req,res)=>{
  res.redirect('/error404')
})

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT} `);
});
