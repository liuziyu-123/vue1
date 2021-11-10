<template>
<div id="demo">{{ fullName }}

    <input type="button" value="firstName" @click="first">

    <input type="button" value="lastName" @click="last">

    <input type="text" v-model="fullName">
</div>

    <h1>进来了</h1>
   

</template>


<!--
vue.config.vue


module.exports = {
 
    baseUrl: './'
   
};
 
注： 如果上面的 baseUrl: './' 这种写法报错，可以试试改为下面这种写法
 
    publicPath: './'
 
    或者根据运行环境判断来配置：
 
    publicPath: process.env.NODE_ENV === "production" ? "/正式环境目录" : "/开发环境目录"module.exports = {
 
    baseUrl: './'
   
};
 
注： 如果上面的 baseUrl: './' 这种写法报错，可以试试改为下面这种写法
 
    publicPath: './'
 
    或者根据运行环境判断来配置：
 
    publicPath: process.env.NODE_ENV === "production" ? "/正式环境目录" : "/开发环境目录"
-->

<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
const axios = require('axios');

function  HelloWorld()
{
   console.log("你烦不烦啊");
}

export { //很关键
  HelloWorld
}


export default {
    data() {
        return {
            firstName: 'Foo',
            lastName: 'Bar',
            fullName: 'Foo Bar'
        }
    },
  
    watch: {
        firstName: function (val) {
            this.fullName = val + ' ' + this.lastName
        },

        lastName: function (val) {
            this.fullName = this.firstName + ' ' + val
        }
    },
    methods: {
        first: function () {
            this.firstName = 'zhang'
            this.fullName=this.firstName+' '+this.lastName;
            console.log(this.fullName)
        },

        last: function () {
            this.lastName = 'yumin'
            this.fullName=this.firstName+' '+this.lastName;
            console.log(this.fullName)
        },


         getInfo() { // 发起get请求
              //  当发起get请求之后， 通过 .then 来设置成功的回调函数
               this.$http.get('api/one/hello?name=张三').then(function (result) {
                // 通过 result.body 拿到服务器返回的成功的数据
                 console.log(result.data.result)
              })
            },
            postInfo() { // 发起 post 请求   application/x-wwww-form-urlencoded
              //  手动发起的 Post 请求，默认没有表单格式，所以，有的服务器处理不了
              //  通过 post 方法的第三个参数， { emulateJSON: true } 设置 提交的内容类型 为 普通表单数据格式
              axios.post('api/one/hello?name=张三', {}, { emulateJSON: true }).then(result => {
                console.log(result.data.result)
              })
            },
    },
    computed: {
        fullname: {
            get: function () {
                console.log('get方法' + this.firstName + ' ' + this.lastName)
                return this.firstName + ' ' + this.lastName
            },

            set: function (newval) {
                var names = newval.split(' ')
                this.firstName = names[0]
                this.lastName = names[names.length - 1]
                console.log("我被执行了")
            }
        }
    }
}



</script>

<style>

</style>



