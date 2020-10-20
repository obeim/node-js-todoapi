const expect=require('expect');
const request =require('supertest');
const {Todo}=require('../models/Todo');
const {app}=require('../server')
const _=require('lodash')
const {User}=require('./../models/User');
const {ObjectID}=require('mongodb')
const {popluateTodos,todos,users, popluateUsers}=require('./seed/seed')

beforeEach(popluateUsers)
beforeEach(popluateTodos)

describe('POST /todos',()=>{
    it('should add new todo ',(done)=>{
        var text='the new todo we add'

        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res)=>{
            expect(res.body.text).toBe(text)
        })
        .end((err,res)=>{
            if(err){
                return done(err)
            }
            Todo.find({text:'the new todo we add'}).then(todos=>{
                expect(todos.length).toBe(1)
                expect(todos[0].text).toBe(text)
                done();
            }).catch(err=>done(err))
          
        })
    })
    it('should not create object with invalid data ',(done)=>{
        
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err,res)=>{
            if(err){
                return done()
            }
            Todo.find().then(todos=>{
                expect(todos.length).toBe(2)
                done()
            }).catch(err,done)
        })
    })
})

describe('GET /todos ',()=>{
    it('should return all the todos ',done=>{
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res)=>{
            expect(res.body.todos.length).toBe(2)
        })
      .end(done)  
    })

})
describe('GET /todos/:id',()=>{
    it('should return single doc',(done)=>{
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res)=>{
            expect(res.body.doc.text).toBe(todos[0].text)
        })
        .end(done)
    })

    it('should return 404 if id is not found',(done)=>{
        const id=new ObjectID()
        request(app)
        .get(`/todos/${id.toHexString()}`)  
        .expect(404)
        .end(done)
    })
    it('should return 400 if id isnt valid ',(done)=>{
        request(app)
        .get('/todos/5f888218cc72701274177b333')
        .expect(400)
        .end(done)
    })
})

describe('DELETE /todos/:id',()=>{
    it(' should delete a single item',(done)=>{
        request(app)
        .delete(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done)
    })
    it('should return 400 if id is not valid',(done)=>{
        request(app)
        .delete('/todos/5f888218cc72701274177b333')
        .expect(400)
        .end(done)
    })
    it('should return 404 if id is not found',(done)=>{
        const id =new ObjectID()
        request(app)
        .delete(`/todos/${id.toHexString()}`)
        .expect(404)
        .end(done)
    })
})

describe('PATCH /todos/id',()=>{
    const id =todos[0]._id.toHexString()
    const todoUpdate={
        text :"the first updated",
        completed:true
    }
    it('should update the todo and return the updated',(done)=>{
        request(app)
        .patch(`/todos/${id}`)
        .send(todoUpdate)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todoUpdate.text)
            expect(res.body.todo.completed).toBe(true)
            expect(_.isNumber(res.body.todo.completedAt)).toBe(true)
        })
        .end(done)
    })
    it('should clear completed at when todo is not completed',(done)=>{
        
        const id =todos[0]._id.toHexString()
        const todoUpdate={
            text :"the first updated second time",
            completed:false
        }
        request(app)
        .patch(`/todos/${id}`)
        .send(todoUpdate)
        .expect(200)
        .expect((res)=>{
            expect(res.body.todo.text).toBe(todoUpdate.text)
            expect(res.body.todo.completed).toBe(false)
            expect(res.body.todo.completedAt).toBe(null)
        })
        .end(done)
    })

})

describe(' POST /users',()=>{
    it('should create new user if data is valid ',(done)=>{
        var email='o@o.com';
        var password='123456';

        request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect((res)=>{

            expect(res.body.email).toBe(email);
        })
        .end((err)=>{
            if(err){
                return done(err)
            }
            User.findOne({email}).then(user=>{
                expect(user).toBeTruthy()
                expect(user.password).toBeTruthy()
                done();
            })
        })
   
    })
    it('should return 400 if data is not valid',(done)=>{
        request(app)
        .post('/users')
        .send({})
        .expect(400)
        .expect(res=>{
            expect(res.body).toBeTruthy()
        })
        .end(done)
    })
    it('it should not create a user if email alread exist',(done)=>{
        var email=users[0].email;
        var password=users[0].password;
        request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .end(done)

    })
})

describe('POST /login ',()=>{

    it('should login sucessfully when info is correct ',(done)=>{
        var email =users[0].email;
        var password=users[0].password
        request(app)
        .post('/login')
        .send({email,password})
        .expect(200)
        .expect((res)=>{
            expect(res.headers['x-auth']).toBeTruthy()
            expect(res.body.email).toBe(email)
        })
        .end(done)
    })
    it('should return 400 when password is incorrect ',(done)=>{
        var email=users[0].email
        var password='123333'
        request(app)
        .post('/login')
        .send({email,password})
        .expect(400)
        .expect((res)=>{
            expect(res.headers['x-auth']).toBeFalsy()
        })
        .end(done)
    })
    it('should return 404 when user does not exist ',(done)=>{
        request(app)
        .post('/login')
        .send({})
        .expect(404)
        .end(done)
    })
})