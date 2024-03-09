/* Start Import And Create Express App */

const express = require("express");

const app = express();

/* End Import And Create Express App */

/* Start Config The Server */

const cors = require("cors"),
    bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json());

require("dotenv").config();

/* End Config The Server */

/* Start direct the browser to statics files path */

const path = require("path");

app.use("/assets", express.static(path.join(__dirname, "assets")));

/* End direct the browser to statics files path */

const mongoose = require("mongoose");

/* Start Running The Server */

const PORT = process.env.PORT || 5300;

app.listen(PORT, () => {
        console.log(`The Server Is Running On: http://localhost:${PORT}`)
        mongoose.connect(process.env.DB_URL)
        .then(() => console.log("mongoose is connection with db !!"))
        .catch(err => console.log(err));
    }
);

/* End Running The Server */

/* Start Handle The Routes */

const   usersRouter = require("./routes/users.router"),
        currenciesRouter = require("./routes/currencies.router");

app.use("/users", usersRouter);

app.use("/currencies", currenciesRouter);

/* End Handle The Routes */

/* Start Handling Events */

mongoose.connection.on("connected", () => console.log("connected"));
mongoose.connection.on("disconnected", () => console.log("disconnected"));
mongoose.connection.on("reconnected", () => console.log("reconnected"));
mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
mongoose.connection.on("close", () => console.log("close"));

process.on("SIGINT", () => {
    mongoose.connection.close();
});

/* End Handling Events */

module.exports = {
    mongoose,
}