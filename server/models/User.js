const mongoose=require('mongoose')
const {isEmail}=require('validator')
const jwt=require('jsonwebtoken')
const _=require('lodash')
const bcrypt=require('bcryptjs');
const userSchema=new mongoose.Schema(
    {
        email:{
            type:String,
            required:[true,'email is required'],
            validate:[isEmail,'enter a valid email'],
            minlength:3,
            unique:true
        },
        password:{
            type:String,
            required:[true,'password is required'],
            minlength:6
        },
        tokens:[{
            access:{
                type:String,
                required:true
            },
            token:{
             type:String,
             required:true
         }
        }]
     }
)
userSchema.pre('save',function (next){
    const user=this
    if(user.isModified){
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                user.password=hash;
                next();
            })
        })
    }
    

})
userSchema.methods.toJSON=function(){
    var user =this;
    var objUser=user.toObject();
    return _.pick(objUser,['_id','email'])
}
userSchema.methods.generateAuthToken=function (){
    var user =this;
    var access='auth';
    var token=jwt.sign({_id:user._id.toHexString(),access},'secret').toString();
    user.tokens.push({access,token});
   return user.save().then(()=>{
        return token;
    })
}
userSchema.statics.findByToken=function(token){
    var User=this;
    try{
    var decoded=jwt.verify(token,'secret');
}catch(err){
    return Promise.reject('user is not authenticated')
} 
   return User.findOne({
        '_id': decoded._id,
        'tokens.token':token,
        'tokens.access':'auth'
    })
}
const User=mongoose.model('User',userSchema);

module.exports={User};