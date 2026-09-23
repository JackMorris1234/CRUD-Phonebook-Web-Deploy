const express = require('express')
require('dotenv').config()
const morgan=require('morgan')
const cors=require('cors')
const Entry=require('./models/entry')
const app = express()

morgan.token(`details`,function(req,res){
  return JSON.stringify(req.body)
})

app.use(express.static('dist'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length]- :response-time ms :details'))
app.use(cors())

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    { 
      "id": "5",
      "name": "May Poppendieck", 
      "number": "38-23-6423122"
    }
]


app.get('/info', (request, response) => {
  const dateTime=new Date()
  response.send(`<p>PhoneBook has info for ${persons.length} people</p> <p>${dateTime}</p>`)
})

app.get('/api/persons', (request, response) => {
  Entry.find({}).then(entries=>response.json(entries))
})

const generateID=()=>{
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => Number(n.id)))
        : 0
    return String(maxId + 1)
}

app.post('/api/persons', (request, response) => {
    const body=request.body
    
    if (!body.name || !body.number){
        return response.status(400).json({error:`content missing`})
    }
    if(persons.find(person=>body.name==person.name)){
        return response.status(400).json({error:`Name Already Entered`})
    }
    const entry= new Entry({
        name: body.name,
        number: body.number,
        id: generateID()
    })
    entry
    .save()
    .then(savedEntry=>response.json(savedEntry))
})

app.put('/api/persons/:id', (request,response)=>{
  const id=request.params.id
  const body=request.body
  persons=persons.map((person)=>person.id===id?{id:id,name:body.name, number:body.number}:person)
  const person={
        name: body.name,
        number: body.number,
        id: id
    }
  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
    const id=request.params.id
    const person=persons.find(person=>person.id===id)
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
    
})

app.delete('/api/persons/:id', (request, response) => {
    const id=request.params.id
    persons=persons.filter(person=> person.id !== id)
    response.status(204).end()
    
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT ||3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})