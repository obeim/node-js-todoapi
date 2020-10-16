const {mongoose}=require('./db/mongoose')
const express=require('express');
const bodyParser=require('body-parser');
const {Todo}=require('./models/Todo');
const {ObjectID}=require('mongodb')
const app=express();
app.use(bodyParser.json());

app.post('/todos',(req,res)=>{
    const todo=new Todo({
        text :req.body.text
    })
    todo.save().then(doc=>{
        res.send(doc)
    },err=>{
        res.status(400).send(err);
    })
})
app.get('/todos',(req,res)=>{
    Todo.find().then(todos=>{
        res.send({todos})
    }).catch(err=>{
        res.status(400).send(err)
    })
})

app.get('/todos/:id',(req,res)=>{
const id=req.params.id
if(!ObjectID.isValid(id)){
return res.status(400).send('id is not valid')
}
Todo.findById(id).then((doc)=>{
    if(!doc){
      return  res.status(404).send('not found')   
     }
    res.send({doc})
    }).catch((err)=>{
        res.send('error :',err)
    })


})
app.listen(3000,()=>{
    console.log('liseting on port 3000')
})

module.exports={app}