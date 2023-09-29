import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

const db = mongoose.connection;
// connection is for checking if the db is successfully connected to your server or not
const handleOpen = () => console.log("✅ Connected to DB"); 
db.on("error", (error) => console.log("DB Error", error)); // error case
db.once("open", handleOpen); // "connected(open)" case