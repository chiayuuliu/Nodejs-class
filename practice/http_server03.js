require('dotenv').config(); //載入.env的config 檔

const http = require('http')

const server = http.createServer((req,res)=>{
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    res.end(`<p>PORT:${process.env.PORT}</p>`)
})

console.log(`PORT:${process.env.PORT}`)
server.listen(process.env.PORT); //port號