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

// let persons = [
//     { 
//       "id": "1",
//       "name": "Arto Hellas", 
//       "number": "040-123456"
//     },
//     { 
//       "id": "2",
//       "name": "Ada Lovelace", 
//       "number": "39-44-5323523"
//     },
//     { 
//       "id": "3",
//       "name": "Dan Abramov", 
//       "number": "12-43-234345"
//     },
//     { 
//       "id": "4",
//       "name": "Mary Poppendieck", 
//       "number": "39-23-6423122"
//     },
//     { 
//       "id": "5",
//       "name": "May Poppendieck", 
//       "number": "38-23-6423122"
//     }
// ]


app.get('/info', (request, response) => {
  const dateTime=new Date()
  response.send(`<p>PhoneBook has info for people</p> <p>${dateTime}</p>`)
})

app.get('/api/persons', (request, response) => {
  Entry.find({}).then(entries=>response.json(entries))
})

// const generateID=()=>{
//     const maxId = persons.length > 0
//         ? Math.max(...persons.map(n => Number(n.id)))
//         : 0
//     return String(maxId + 1)
// }

app.post('/api/persons', (request, response) => {
    const body=request.body
    
    if (!body.name || !body.number){
        return response.status(400).json({error:`content missing`})
    }
    const entry= new Entry({
        name: body.name,
        number: body.number
    })
    entry
    .save()
    .then(savedEntry=>response.json(savedEntry))
})

app.put('/api/persons/:id', (request,response)=>{
  const id=request.params.id
  const body=request.body
  Entry
  .findById(id)
  .then(entry=>{
    if(!entry){
      return response.status(404).end()
    }
    entry.number=body.number
    return entry.save().then((updatedEntry)=>response.json(updatedEntry))
  })
  .catch(error=>next(error))
})

app.get('/api/persons/:id', (request, response) => {
    const id=request.params.id
    Entry
    .findById(id)
    .then((entry)=>{
      entry ? response.json(entry) : response.status(404).end()
    })
    .catch(error=>{
      console.log(error)
      response.status(400).send({error: `malformatted id`})
    })
    
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id=request.params.id

    Entry
    .findByIdAndDelete(id)
    .then(result=>{
      response.status(204).end()
    })
    .catch(error=>next(error))
    
    
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT ||3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})