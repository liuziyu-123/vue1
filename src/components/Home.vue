<template>
    <div id="home">  

        <label>用户名 </label><input v-model="name" type="text" placeholder="请填写用户名">  
         <br>
        <label>文件 </label><input  type="file" ref="readFile">

        <input type="submit" value="注册" @click="read">


        <button @click="selectFile">选择图片</button>
        <img :src="img" v-show="img">
        <input type="file" ref="file" style="display:none;" @change="fileChange">
  
<br>
<!--
       <img :src='../assets/logo.png' width="200px" height="400px" >
     -->
    </div>
</template>
<script>
import axios from 'axios';

//import logo from '../assets/logo.png'
    export default {
        data(){
            return {
                name:'',

                img:''
              
            }
        },
        methods: {
             read(){
                // 通过DOM取文件数据
                const file = this.$refs.file.files[0];
                // 计算文件大小 KB
                const size = Math.floor(file.size / 1024)
                console.log("size===="+size)
                // 显示本地图片
                this.iamge = window.URL.createObjectURL(file)

                        axios.get("api/one/upload",{ params: {
                              file:file
                },}).then((res)=>{
                    if(res.code==200)
                    {
                        console.log(res.result)
                    }
                })
             }


             
        }
    }
</script>
<style>

</style>
