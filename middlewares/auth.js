const jwt = require('jsonwebtoken');

exports.LoginbyJWT = function(req,res,next){
    const token =req.headers.authorization
    jwt.verify(token,process.env.JWTKEY,function(err,decodedToken)
    {if(err){res.status(401).send({message:'auth failed, login to continue'})}
    
    else{req.body.id=decodedToken.user._id;
       
      
    next()
}

    })
}
