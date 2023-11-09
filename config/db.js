const mongoose = require("mongoose"); 

const connection = mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true
})
.then(() => {
    console.log("MongoDB has connected successfully")
})
.catch(error => {  
    console.log(`Logged Error: ${error}`)
})

module.exports = connection; 