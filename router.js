const express = require("express")
const router = express.Router()

const botdota2 = require("./controllers/botdota")

router.post("/api/chat", botdota2.botdota2);

module.exports = router;