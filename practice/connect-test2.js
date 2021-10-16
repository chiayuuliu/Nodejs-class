//引用連線池, db= mfee19的資料庫內容
const db = require('./../modules/connect-mysql')

//這裡是一個promise()
db.query("SELECT * FROM address_book LIMIT 5")
//會回傳兩個東西, 寫r會拿到一個陣列,第一個值才是結果
    .then(([r])=>{
        console.log('log',r); //r是結果的陣列
        process.exit();
    })
    .catch(ex=>{
        console.log(ex)
    })