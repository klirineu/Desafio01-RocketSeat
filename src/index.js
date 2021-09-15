const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()

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
  const { title, deadline } = req.body

  const { user } = req

  const addTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(addTodos)

  return res.status(201).send()
})

app.put("/todos/:id", userAlreadyExists, (req, res) => {
  const { title, deadline } = req.body
  const { id } = req.params
  const { user } = req

  const todo = user.todos.filter((todo) => todo.id === id)

  if(id !== todo[0].id) {
    return res.status(400).json({error: "Todo not found"})
  }

  todo[0].title = title
  todo[0].deadline = new Date(deadline)

  return res.status(201).send()
})

app.post("/todos/:id/done", userAlreadyExists, (req, res) => {
  const { id } = req.params
  const { user } = req

  const todo = user.todos.filter((todo) => todo.id === id)

  if(id !== todo[0].id) {
    return res.status(400).json({error: "Todo not found"})
  }

  todo[0].done = true

  return res.status(201).send()
})

app.delete("/todos/:id", userAlreadyExists, (req, res) => {
  const { id } = req.params
  const { user } = req

  const todo = user.todos.filter((todo) => todo.id === id)

  if(id !== todo[0].id) {
    return res.status(400).json({error: "Todo not found"})
  }

  // splice
  var index = user.todos.indexOf(todo[0]);
  console.log(index)

  if (index > -1) {
    user.todos.splice(index, 1);
  }

  return res.status(200).json(user.todos)
})

app.listen(3333)