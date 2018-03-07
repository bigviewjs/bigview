# 存放所有的pagelets，无父子级别的

存放所有的pagelets，无父子级别的
this.allPagelets = [];

递归实现深度遍历，这是由于pagelet有子pagelet的原因
       function getPagelets(pagelet) {
           re.push(pagelet);

           if (pagelet.children) {
               pagelet.children.forEach(function(child) {
                   child.parent = pagelet.name;
                   re.push(child);

                   if (child.children && child.children.length > 0) {
                       getPagelets(child)
                   }
               });
           }
       }

getPagelets(pagelet);

this.allPagelets = this.allPagelets.concat(re);

## run

    // when this.add(pagelet.immediately=false)
    // then only used in afterRenderLayout ()
    //
    // example
    //    afterRenderLayout () {
    //      let self = this
    //
    //      if (self.showPagelet === '1') {
    //        self.run('pagelet1')
    //      } else {
    //        self.run('pagelet2')
    //      }
    //
    //      // console.log('afterRenderLayout')
    //      return Promise.resolve(true)
    //    }
    //
    // Note: you can do this when datastore changed
    //
    // run(pageletName) {
    //     this.pagelets.forEach(function(pagelet) {
    //         if (pagelet.name === pageletName) {
    //             pagelet.immediately = true
    //         }
    //     })
    // }

