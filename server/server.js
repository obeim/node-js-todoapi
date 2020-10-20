require('./config/config')
const {mongoose}=require('./db/mongoose');
const express=require('express');
const bodyParser=require('body-parser');
const {Todo}=require('./models/Todo');
const {ObjectID}=require('mongodb');
const _=require('lodash');
const bcrypt=require('bcryptjs')
const {User} = require('./models/User');
const {authenticate}=require('./middlewares/authenicate')
const jwt =require('jsonwebtoken')
const app=express();

app.use(bodyParser.json());
const port = process.env.PORT
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
app.patch('/todos/:id',(req,res)=>{
    const id=req.params.id;
    const body=_.pick(req.body,['text','completed'])
    if( _.isBoolean(body.completed) && body.completed){
        body.completedAt=new Date().getTime();
    }else{
        body.completed=false;
        body.completedAt=null;
    }
    if(!ObjectID.isValid(id)){
        return res.status(400).send('id is not valid')
    }

    Todo.findByIdAndUpdate(id,{$set:body},{new:true ,useFindAndModify:false}).then((todo)=>{
        if(!todo){
            return res.status(404).send('todo does not exist')
        }
        res.send({todo})
    }).catch(err=>{
        res.status(400).send(err)
    })
})

app.post('/users',(req,res)=>{
    const body=_.pick(req.body,['email','password'])
    const user =new User(body);

    user.save().then(()=>{
        return user.generateAuthToken()
    }).then(token=>{
        res.header('x-auth',token).send(user)
    }).catch(err=>{
        res.status(400).send(err)
    })
})

app.get('/users/me',authenticate,(req,res)=>{
    res.send(req.user)
})

app.post('/login',(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    User.findOne({email}).then((user)=>{
        if(!user){
            return Promise.reject()
        }
        bcrypt.compare(password,user.password,(err,result)=>{
            if(result){
                return user.generateAuthToken().then((token)=>{
                    res.header('x-auth',token).send(user)
                })
            }
            else{
                res.status(400).send('wrong password')
            }
        })

    }).catch(err=>{
        res.status(404).send('not found')
    })
})

app.get('/logout',authenticate,(req,res)=>{
    const user=req.user;
    user.logout(req.token).then(()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    })
    
    
})
app.listen(port,()=>{
    console.log(`liseting on port ${port}`)
})

module.exports={app}