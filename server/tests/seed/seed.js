const {Todo}=require('../../models/Todo');
const {ObjectID}=require('mongodb')
const {User}=require('../../models/User')
const jwt=require('jsonwebtoken')
const userOne=new ObjectID();
const userTwo=new ObjectID();
const users=[

    {
    _id:userOne,
    email:'obei@wai.com',
    password:'123456',
    tokens:[{
        access:'auth',
        token:jwt.sign({_id:userOne,access:'auth'},'secret')
    }]
    },
    {
        _id:userTwo,
        email:'obi@wai.com',
        password:'123456'
    }
]
const popluateUsers=function(done){
    User.deleteMany({}).then(()=>{
    var userOne=new User(users[0]).save()
    var userTwo=new User(users[1]).save()

    return Promise.all([userOne,userTwo])
    }).then(done())
}
const todos =[
    {
        _id:new ObjectID(),
        text:"first test todo"
    },
    {
        _id:new ObjectID(),   
        text:"second text todo",
    }
]
const popluateTodos=function(done){
    Todo.deleteMany({}).then(()=>{
        return Todo.insertMany(todos)
        
    }).then(()=>done())
}

module.exports={
    popluateTodos,todos,popluateUsers,users
}