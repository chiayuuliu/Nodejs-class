const jwt = require('jsonwebtoken');

// 為什麼這邊重新改寫過的token 跟前面的一樣?
const secretKey = 'alkjsdalkjhskjflhoeiwh';
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZG9yaXMiLCJpYXQiOjE2MzE2ODU3Mjh9.CXS8RS37CdxwYh5ujz_jg1bx1l89ou0VlxsW2dfHjqw

(async()=>{
    // 加密(放資料跟key)
    const token =await jwt.sign({name:'doris'},secretKey);

    console.log(token)
    
    const token1 ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiZG9yaXMiLCJpYXQiOjE2MzE2ODU0ODZ9.La1SFpp4zqN5bl2GjEsKJr1QuUiqBJj5KwnmGo8ui7c';

    // 解密
    const decode = await jwt.verify(token,secretKey);

    console.log('decode',decode)
    // decode { name: 'doris', iat: 1631708311 }
})()

