import dotenv from 'dotenv'
import app from './app'
import prisma from './lib/prisma'

dotenv.config()

const PORT = parseInt(`${process.env.PORT || 3000}`)

app.listen(PORT, () => console.log(`Server rodando na ${PORT}`))