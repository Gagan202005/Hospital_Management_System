const jwt = require("jsonwebtoken");
require("dotenv").config();

//authentication

exports.auth = async (req,res,next) =>{
    //console.log(req);
    try{
    const token = req.header("Authorization").replace("Bearer ", "") || req.body.token || req.cookies.token ;

    if(!token){
        return res.status(401).json({
            success: false,
            message:"token is missing",
        });
    }
    try{
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decode;
        req.token = token;
        //console.log(req.user);
    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:'token is invalid',
        });
    }

    next();
    }
    catch(err){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}

//authorization

exports.isPatient= async(req,res,next) => {
    try{
        if(req.user.accountType!=="Patient"){
            return res.status(401)({
                success:false,
                message:"this is a protected route for patients only",
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}


exports.isDoctor= async(req,res,next) => {
    try{
        if(req.user.accountType!=="Doctor"){
            return res.status(401)({
                success:false,
                message:"this is a protected route for doctors only",
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:'User role cannot be verified, please try again'
        })
    }
}

exports.isAdmin= async(req,res,next) => {
    try{
        console.log(req.user);
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"this is a protected route for Admin only",
            });
        }
        next();
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}