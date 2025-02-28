const mongoose = require ('mongoose')
const connectdb = async()=>{
try {
   await mongoose.connect(process.env.DATABASE)
}
catch{
    console.log('error')
}
}

module.exports= {connectdb};