const mongoose=require('mongoose')
const {isEmail}=require('validator')
const jwt=require('jsonwebtoken')
const _=require('lodash')
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
const User=new mongoose.model('User',userSchema);

module.exports={User};