const mongoose=require('mongoose')
const Todo=mongoose.model('Todo',{
    text:{
        type:String,
        required:true,
        minlength:1
    },
    completed:{
        type:Boolean,
        default:false,
        required:true
    },
    completedAt:{
        type:Number,
        default:null
    }

});

module.exports={Todo}