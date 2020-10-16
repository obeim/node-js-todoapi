const mongoose=require('mongoose')
const {isEmail}=require('validator')
const User=new mongoose.model('User',{
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
});

module.exports={User};