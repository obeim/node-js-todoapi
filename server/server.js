const {mongoose}=require('./db/mongoose')
const express=require('express');
const bodyParser=require('body-parser');
const {Todo}=require('./models/Todo');
const {ObjectID}=require('mongodb')
const app=express();
app.use(bodyParser.json());
const port = 3000
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
app.delete('/todos/:id',(req,res)=>{
    const id =req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(400).send('id is not valid')
    }
    Todo.findByIdAndDelete(id).then(todo=>{
        if(!todo){
            return res.status(404).send('item does not exist')
        }
        res.status(200).send({todo})
    }).catch(err=>{
        res.send(err)
    })
})  
app.listen(port,()=>{
    console.log('liseting on port 3000')
})

module.exports={app}