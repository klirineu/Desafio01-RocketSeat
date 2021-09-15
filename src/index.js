const express = require("express")
const cors = require('cors');
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(cors())
app.use(express.json())

const users = []

// Middleware

function userAlreadyExists(req, res, next) {
  const { username } = req.headers

  const user = users.find(user => user.username === username)

  if(!user) {
    return res.status(400).json({error: "User not found"})
  }

  req.user = user

  return next()
}

app.post("/users", (req, res) => {
  const { name, username } = req.body

  const userAlreadyExists = users.some((user) => user.username === username)

  if(userAlreadyExists) {
    return res.status(400).json({error: "User already exists!"})
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: []
  })

  return res.status(201).send()

})

//app.use(userAlreadyExists)

app.get("/todos", userAlreadyExists, (req, res) => {
  const { user } = req

  return res.json(user.todos)
})

app.post("/todos", userAlreadyExists, (req, res) => {
  const { user } = req
  const { title, deadline } = req.body

  const addTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(addTodos)

  return res.status(201).json(addTodos)
})

app.put("/todos/:id", userAlreadyExists, (req, res) => {
  const { user } = req
  const { title, deadline } = req.body
  const { id } = req.params

  const todo = user.todos.find((todo) => todo.id === id)

  if(!todo) {
    return res.status(404).json({error: "Todo not found"})
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return res.json(todo)
})

app.post("/todos/:id/done", userAlreadyExists, (req, res) => {
  const { id } = req.params
  const { user } = req

  const todo = user.todos.find((todo) => todo.id === id)

  if(!todo) {
    return res.status(404).json({error: "Todo not found"})
  }

  todo.done = true

  return res.json(todo)
})

app.delete("/todos/:id", userAlreadyExists, (req, res) => {
  const { id } = req.params
  const { user } = req

  const todoIndex = user.todos.findIndex((todo) => todo.id === id)

  if(todoIndex === -1) {
    return res.status(404).json({error: "Todo not found"})
  }

  user.todos.splice(todoIndex, 1);
  

  return res.status(204).json()
})

module.exports = app