const http = require('http') 

//建立server
const server = http.createServer((req,res)=>{
    //設定狀態碼+擋頭 文字形式 
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    //設定成純文字擋頭
    // res.writeHead(200, {
    //     'Content-Type': 'text/plain'
    // });

    //設定頁面內容會show出url上的內容
    res.end(`<h1>Hello Doris, ${req.url}</h1>`)
})

server.listen(3000); //port號