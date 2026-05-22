
require('dotenv').config();
const express = require('express');
const router = require("./router")

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", router)
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/index.html');
});

app.listen(PORT, () => {
  console.log(`servidor corriendo en http://localhost:${PORT}`);
});
