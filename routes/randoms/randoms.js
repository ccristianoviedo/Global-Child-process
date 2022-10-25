import express  from "express";
import {fork} from "child_process"
const {Router} = express

const randomRouter = Router();

randomRouter.get("/", (req, res)=>{
   

    const num = req.query.num || 10

    const child = fork("./sumar.js");
    
    child.send(num)
  
    child.on("message", (resultados) => {
      res.send(resultados);
    });
        
        
      });


export default randomRouter


