const Biglet = require("../../packages/biglet")

module.exports = class BigletDemo extends Biglet {
    constructor () {
        super()
        this.root = __dirname
        this.name = 'pagelet2'
        this.data =  {
            domid : 'pagelet2',
            t: "测试",
            po: {
                name: this.name
            }
        }
        this.domid = 'pagelet2'
        this.tpl = 'p2.html'
    }
    
    fetch() {
        return this.sleep(4000)
    }
    
    sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time))
    }
}
