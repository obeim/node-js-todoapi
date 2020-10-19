const {User}=require('../models/User')
const authenticate = function(req,res,next){
const token =req.header('x-auth');
     User.findByToken(token).then(user =>{
         if(!user){
            return Promise.reject('user is not authenticated');
         }
    
         req.token=token;
           req.user=user;
            next()
    }).catch(err=>{
    res.status(401).send(err)
    })
}
module.exports={
    authenticate
}