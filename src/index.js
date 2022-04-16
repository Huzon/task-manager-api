const express = require("express");
require("./db/mongoose"); //this calling just makes sure that mongoose.js runs
const userRoute = require("./routers/user");
const taskRoute = require("./routers/task");

const app = express();
const port = process.env.PORT;

//configuring express to automatically parse the incoming data in JSON format
app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => {
    console.log(`App Started on ${port}`);
});