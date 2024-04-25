import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import router from './router'

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



app.get('/', (req:express.Request, res:express.Response) => {
  res.send('Hello World!')
})

app.use('/api', router)

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})