const express = require('express')
const app = express()
const port = 3000

//Bagian test
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/about', function(request, response){
	response.send('Ini adalah halaman About')
})

//1. Login
app.get('/login',(request, response)=>{
	response.render(__dirname + '/views/login.ejs')
})

//2. Logout
app.get('/logout', function(request, response){
	response.send('Ini adalah halaman Logout')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
