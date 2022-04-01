const express = require('express');
const app = express();

app.use(express.static(__dirname));
const server = app.listen(5000);
