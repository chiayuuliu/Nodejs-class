const express = require('express')
const app = express();
const moment = require('moment-timezone')

app.get('/',(req,res)=>{
    res.send('<h1>Express!</h1>')
})

app.get('/Doris',(req,res)=>{
    res.send('<h1>Hi Doris!</h1> ')
})

//http://localhost:3010/post/123456
// 在post 後面輸入的值帶入參數
app.get('/post/:abc', (req, res)=> {
    let params = req.params.abc
    res.send(`<h1>${params}</h1>`);}
  );

  app.get('/:name/:age', function(req, res) {
    //res.json(req.params)
    res.send('<h1>'+ req.params.name + ' is ' + req.params.age +' '+ ' years old </h1>');
    
  });

app.listen(3010, ()=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    console.log(`啟動: 3010`, moment().format(fm));

});