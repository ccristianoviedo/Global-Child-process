import express  from "express";
const router= express.Router()

import randomRouter from "./randoms/randoms.js"

router.use("/randoms", randomRouter);

export default router
