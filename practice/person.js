class Person {
    constructor(name='Doris',age=28){
        this.name = name;
        this.age=age;
    }
    toJSON(){
        return{
            name:this.name,
            age:this.age,
        }
    }
    toString(){
        // return JSON.stringify(this.toJSON(), null,2)
        return JSON.stringify(this)

        //null,2 格式化設定 前面空兩格
    }
}

module.exports = Person