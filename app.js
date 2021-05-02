// This is app.js
// ...

const routes = require('./routes/index');
const sso = require('./routes/sso');
const express = require('express');
const app = express();
const port = 3000;
// ...
app.use('/', routes);
app.use('/sso', sso);
// ...
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })