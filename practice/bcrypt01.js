const bcrypt = require('bcryptjs');

(async ()=>{
    const salt = await bcrypt.genSalt(8); //加鹽的次數
    console.log(`salt:${salt}`);

    // ''裡面放要加密的字串
    const hash1 = await bcrypt.hash('doris',salt)
    console.log(`hash1:${hash1}`);

    const hash2 = await bcrypt.hash('doris',10)
    console.log(`hash2:${hash2}`);

    // 會跟hash1一樣
    const hash3 = await bcrypt.hash('doris',salt)
    console.log(`hash3:${hash3}`);

    // 判斷doris跟hash2 是不是一樣
    console.log(await bcrypt.compare('doris',hash2))
})();