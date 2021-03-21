const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  if (!user) {
    return response.status(400).json({error: 'User does not exist'});
  }
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExists = users.find(u => u.username === username);
  if(userExists) {
    return response.status(400).json({error: 'User already exists'})
  }
  const user = { id: uuidv4(), name, username, todos: [] }
  users.push(user);
  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const user = users.find(u => u.username === username);
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const todo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date(),
  }
  const user = users.find(u => u.username === username);
  user.todos.push(todo);
  const index = users.findIndex(u => u.username === username);
  users[index] = user;
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const u = users.findIndex(u => u.username === username);
  const t = users[u].todos.findIndex(t => t.id === id);

  if(t === -1) {
    return response.status(404).json({error: 'Todo not found'});
  }

  users[u].todos[t].title = title;
  users[u].todos[t].deadline = deadline;
  
  return response.json(users[u].todos[t])
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const u = users.findIndex(u => u.username === username);
  const t = users[u].todos.findIndex(t => t.id === id);

  if(t === -1) {
    return response.status(404).json({error: 'Todo not found'});
  }

  users[u].todos[t].done = true;
  
  return response.json(users[u].todos[t])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const u = users.findIndex(u => u.username === username);
  const t = users[u].todos.findIndex(t => t.id === id);

  if(t === -1) {
    return response.status(404).json({error: 'Todo not found'});
  }

  users[u].todos.splice(t, 1);

  console.log(users[u].todos)

  return response.status(204).json(users[u].todos[t]);
});

module.exports = app;