const dotenv = require('dotenv');
dotenv.config();


const Access = (req,res) => {

    const accesskey = process.env.ACCESSKEY || "sumit"

    let {accessToken} = req.query;
    
    if(accessToken == accesskey){
        res.status(200).send("Authorized")
    }
    else{
        res.status(400).send("Not Authorized")
    }
}

module.exports = Access