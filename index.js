import express from "express";
const app = express();
import cookieParser from "cookie-parser";
import session from "express-session";
import bcrypt from "bcrypt";
import passport from "passport";
import path from "path";
import { Strategy } from "passport-local";
const LocalStrategy = Strategy;
import "./src/db/config.js";
import { auth } from "./src/middelware/auth.js";
import mongoStore from "connect-mongo";
import handlebars from "express-handlebars";
import User from "./src/models/User.js";
import dotenv from "dotenv";
dotenv.config()
import {fork} from "child_process"

const PORT = process.env.PORT || 5000
const MONGO = process.env.MONGO 

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(session({
  store: new mongoStore({
    mongoUrl:MONGO,
  }),
  secret:"coder",
  resave: false,
  saveUninitialized: false,
  cookie :{
    originalMaxAge:600000,
   }    
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) console.log(err);
      if (!user) return done(null, false);
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) console.log(err);
        if (isMatch) return done(null, user);
        return done(null, false);
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  return done(null, user);
});

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "index.hbs",
    layoutsDir:  path.join(app.get("views"), "layouts"),
    
  })
);
app.set("view engine", "hbs"); 
app.set("views", "./views"); 

app.get("/", (req, res) => {
  if (req.session.nombre) {
    res.redirect("/main");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/loginError", (req, res) => {
  res.render("loginError");
});

app.post("/login",
  passport.authenticate("local", { failureRedirect: "loginError" }),
  (req, res) => {
    res.redirect("/datos");
  }
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/calculo-nobloq", function (req, res) {

  const num = req.query.num || 100000000

  const child = fork("./sumar.js");
  
  child.send(num)

  child.on("message", (resultados) => {
    res.send(resultados);
  });
  
  
});

app.get("/info",auth, (req, res) => {
 
  res.send(`Argumentos de entrada: ${process.argv[0]},------------------
            Sistema Operativo: ${process.platform},------------------
            Version Node: ${process.version},------------------
            Uso memoria: ${process.memoryUsage()},------------------
            Directorio: ${process.cwd()},------------------
            Id del proceso: ${process.pid},------------------          
           Titulo Porces: ${process.title},------------------          
           `)
});

app.post("/register", (req, res) => {
  const { username, password, direccion } = req.body;
  User.findOne({ username }, async (err, user) => {
    if (err) console.log(err);
    if (user) res.render("registerError");
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 8);
      const newUser = new User({
        username,
        password: hashedPassword,
        direccion,
      });
      await newUser.save();
      res.redirect("/login");
    }
  });
});

app.get("/datos", auth, async (req, res) => {
  const datosUsuario = await User.findById(req.user._id).lean();
  res.render("main", {
    datos: datosUsuario,
    productos
  });
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

const productos = []

app.post('/in', (req, res) => {
  productos.push(req.body)
res.render("main", productos);
})

app.get("/logout", (req, res)=> {
  res.render("logout", {user: req.session.user});
  req.session.destroy(err=>{
    if(err)
    return res.json({status: "logout error", body : err})
  })
});
app.listen(PORT, () => console.log(`SERVER ON ${PORT}`));