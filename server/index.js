const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
const messageRoute = require('./routes/messagesRoute')
const socket = require('socket.io')
const app = express()
require('dotenv').config()
mongoose
	.connect(
		'mongodb+srv://admin:12345@cluster0.3aci7uv.mongodb.net/chat?retryWrites=true&w=majority',
	)
	.then(() => {
		console.log('DB Connetion Successfull')
	})
	.catch(err => {
		console.log(err.message)
	})
app.use(cors())
app.use(express.json())

app.use('/api/auth', userRoutes)
app.use('/api/messages', messageRoute)

const server = app.listen(process.env.PORT, () => {
	console.log('server Started on Port')
})

const io = socket(server, {
	cors: {
		origin: 'http://localhost:3000',
		credentials: true,
	},
})

global.onlineUsers = new Map()

io.on('connection', socket => {
	global.chatSocket = socket
	socket.on('add-user', userId => {
		onlineUsers.set(userId, socket.id)
	})

	socket.on('send-msg', data => {
		const sendUserSocket = onlineUsers.get(data.to)
		if (sendUserSocket) {
			socket.to(sendUserSocket).emit('msg-recieve', data.msg)
		}
	})
})
