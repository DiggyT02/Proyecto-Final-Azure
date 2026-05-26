const express = require("express")
const router = express.Router()

const botdota2 = require("./controllers/botdota")
const resumen  = require("./controllers/resumen")

router.post("/api/chat",   botdota2.botdota2);
router.post("/api/resumen", resumen.resumirTexto);

module.exports = router;