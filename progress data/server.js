//SERVER
//importing app
const app = require('./app');
//creating the server
const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port} ...`);
});