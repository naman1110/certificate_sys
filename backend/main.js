const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
const routes = require('./routes');


app.use(express.urlencoded());
app.use('/static', express.static('static')) 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



app.use('/', routes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
