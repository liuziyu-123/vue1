import Vue from 'vue';
import qs from "qs";
import axios from "axios";

import router from '@/router';
import message from 'ant-design-vue/lib/message';
import { Promise } from 'es6-promise';
import user from '@/store/index'

axios.defaults.timeout = 30000; // 1分钟
Vue.use(router);
Vue.use(message);
var loadingCount = 0;
function addStorageEvent(type, key, data) {
  if (type === 1) {
      // 创建一个StorageEvent事件
      let newStorageEvent = document.createEvent('StorageEvent');
      const storage = {
          setItem: function (k, val) {
              localStorage.setItem(k, val);
              // 初始化创建的事件
              newStorageEvent.initStorageEvent('setItem', false, false, k, null, val, null, null);
              // 派发对象
              window.dispatchEvent(newStorageEvent);
          }
      }
      return storage.setItem(key, data);
  } else {
      // 创建一个StorageEvent事件
      let newStorageEvent = document.createEvent('StorageEvent');
      const storage = {
          setItem: function (k, val) {
              sessionStorage.setItem(k, val);
              // 初始化创建的事件
              newStorageEvent.initStorageEvent('setItem', false, false, k, null, val, null, null);
              // 派发对象
              window.dispatchEvent(newStorageEvent);
          }
      }
      return storage.setItem(key, data);
  }
}
var apiList = ['/api/design/study/saveStudyCellInfo','/gatewayApi/resource/upload/getUploadInfo','/api/user/user/getPortal','/api/paper/paper/saveAnswer','/api/faceteach/questionnaire/saveQuestionAnswer']; //不要loading的接口集合
function instance(config) {
  let instance = axios.create({
    timeout: 10000, //10秒未响应则请求超时
    /**更改响应头 */
    headers: {
      "Content-Type": "application/json"
    },
    /**在发送前处理data数据 */
    transformRequest: [
      data => {
        if (!data || typeof data === "string") {
          return data;
        }

        // 如果是Form表单就直接跳过JSON转换
        if (data instanceof FormData) {
          return data;
        }

        return qs.stringify(data, {
          arrayFormat: "brackets",
          strictNullHandling: false
        });
      }
    ],
    ...config
  });
  let cancelToken = axios.CancelToken;
  instance.interceptors.request.use(function (config) {
    const upload = config.url.indexOf('192.168.23.156:90'); // 判断是否是上传文件的接口
    if (upload != -1) {
      config.timeout = null;
    }
    const sendEmailCode = config.url.indexOf('/user/updataInfo/sendEmailCode'); // 判断是否是上传文件的接口
    if (sendEmailCode != -1) {
      config.timeout = 10000; // 10s
    }
    if (apiList.indexOf(config.url) == -1 && config.LoadingShow != false) {
      // user.state.isLoading = true
      addStorageEvent(1, 'isLoading', 1)
      loadingCount = 0
      loadingCount = loadingCount + 1;
    }
    if (config.LoadingShow == false) {
      // user.state.isLoading = false
      addStorageEvent(1, 'isLoading', 0)
      loadingCount = 0
    }
    if (localStorage.getItem('Authorization') && config.withCredentials != false) {//用户登录时每次请求将token放入请求头中
      config.headers["Authorization"] = localStorage.getItem('Authorization');
    } else if (config.withCredentials != false) {
      router.push({
        name: 'home',
      });
    }
    config.cancelToken = new cancelToken((c) => {
      user.commit('PUSH_CANCEL', {
        cancelToken: c
      })
    });

    if (config.setTimeout) {
      config.timeout = config.setTimeout 
    }
    // if (config['Content-Type'] === 'application/x-www-form-urlencoded;') {
    //   config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    //   config['transformRequest'] = function(obj) {
    //     var str = [];
    //     for (var p in obj)
    //       str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    //     return str.join("&")
    //   };
    // }
    //config.header['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

    return config;
  }, function (error) {
    loadingCount = 0
    // user.state.isLoading = false
    addStorageEvent(1, 'isLoading', 0)
    return Promise.reject(error);
  });


  /**在请求或响应被 then 或 catch 处理前拦截它们。处理响应数据 */
  instance.interceptors.response.use(
    response => {
      if (apiList.indexOf(response.config.url) == -1) {
        loadingCount = loadingCount - 1;
        if (loadingCount == 0) {
          // user.state.isLoading = false
          addStorageEvent(1, 'isLoading', 0)
        }
      }
      if (response.status < 200 || response.status >= 300) {
        return Promise.reject(response.statusText);
      }
      // 服务器没有返回正确的JSON格式
      if (typeof response.data === "string" && !response.data) {
        return Promise.reject("服务器没有响应正确的数据, 请检查参数是否正确。");
      }
      return Promise.resolve(response.data);
    },
    error => {
      try {
        if (error && error.response.status && error.response.status != 401) {
          if (apiList.indexOf(error.response.config.url) == -1) {
            loadingCount -= 1
          }
        }
        if (apiList.indexOf(error.response.config.url) == -1) {
          if (loadingCount == 0) {
            setTimeout(() => {
              // user.state.isLoading = false
              addStorageEvent(1, 'isLoading', 0)
            }, 5000);
          }
        }
        if (error) {
          if (error.response.status == 401 && '/api/course/getSchoolCourseList' != error.response.config.url) {
            localStorage.removeItem('Authorization')
            user.state.Authorization = ''
          }
          // user.state.isLoading = false
          message.config({maxCount: 1})
          addStorageEvent(1, 'isLoading', 0)
          if ('/api/course/getSchoolCourseList' != error.response.config.url) {
            if (error.response.status == 401) {
              if (loadingCount > 0 ) {
                message.warning('登录过期，请重新登录')
              }
              loadingCount = 0
              router.push({
                name: 'home',
              });
            } else if (error.response.data.code == 403) {
              if (loadingCount > 0) {
                return message.warning('您没有权限访问，请退出登录后重试！')
              }
            }
            // if (error.response.config.getPortal != false) {
            //   message.warning('登录过期，请重新登录')
            //   router.push({
            //     name: 'home'
            //   });
            // }
          }
          if (error.response.data.code == 403) {
            if (loadingCount > 0) {
              return message.warning('您没有权限访问，请退出登录后重试！')
            }
          }
          if (apiList.indexOf(error.response.config.url) == -1) {
            loadingCount = 0
          }
        } else if (error && error.response) {
          return Promise.reject({
            status: error.response.status,
            statusText: error.response.statusText
          });
        } else {
          return Promise.reject({ status: 500, statusText: "服务器故障" });
        }
      } catch {
        // user.state.isLoading = false
        addStorageEvent(1, 'isLoading', 0)
        loadingCount = 0
        return false;
      }
    }
  );
  return instance;
}

export function uploadFile (url,payload,cancelToken,callback1) {
  axios.defaults.timeout = null;
  return new Promise(function(resolve,reject){
    axios({
      url:url,
      method:'post',
      data:payload,
      onUploadProgress:function(progressEvent){
        if(progressEvent.lengthComputable && callback1){
          callback1(progressEvent);
        }
      },
      cancelToken: cancelToken.withCredentials
    }).then(res =>{
      resolve(res);
    }).catch(thrown => { 
      if (axios.isCancel(thrown)) {
        reject('-2')
      } else {
        reject(thrown)
      }
    })
  })
}
// ObsCallBack
export function ObsCallBack (url,params) {
  axios.defaults.timeout = null;
  return new Promise(function(resolve,reject){
    axios({
      url:url,
      method:'post',
      data:params,
      withCredentials: false,
      headers: { 
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, HEAD',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '100',
      }
    }).then(res =>{
      resolve(res);
    }).catch(thrown => { 
      if (axios.isCancel(thrown)) {
        reject('-2')
      } else {
        reject(thrown)
      }
    })
  })
}

export function getExport(url,params,title,RequestType) {
  axios.defaults.timeout = null;
  if(!RequestType){
    RequestType = 'get'
  }
  let all = {}
  if(RequestType == 'post'){
    all={
      url:url,
      method: RequestType,
      data:params,
      headers: { 'Content-Type': 'application/json','Authorization': localStorage.getItem('Authorization') },
      responseType: 'blob'
    }
  }else{
    all = {
      url:url,
      method:RequestType,
      params:params,
      headers: { 'Content-Type': 'application/x-download','Authorization': localStorage.getItem('Authorization') },
      responseType: 'blob'
    }
  }
  return new Promise(function(){
    axios(all).then((res) =>{
      if(res.headers['content-type'].indexOf('application/octet-stream') > -1){
        let fileName = decodeURI(res.headers['content-disposition'].split(';')[1].split('=')[1])
        let blob = new Blob([res.data], {type: 'application/vnd.ms-excel'})
        let url = window.URL.createObjectURL(blob);
        let aLink = document.createElement("a");
        aLink.style.display = "none";
        aLink.href = url;
        aLink.setAttribute("download", fileName);
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink); //下载完成移除元素
        window.URL.revokeObjectURL(url); //释放掉blob对象
      } else if(res.headers['content-type'].indexOf('application/x-xls') > -1) {
        let fileName = res.headers['content-disposition'].split('.')[1]
        let blob = new Blob([res.data], {type: 'application/vnd.ms-excel'})
        let url = window.URL.createObjectURL(blob);
        let aLink = document.createElement("a");
        aLink.style.display = "none";
        aLink.href = url;
        aLink.setAttribute("download", title + '.' + fileName);
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink); //下载完成移除元素
        window.URL.revokeObjectURL(url); //释放掉blob对象
      }else{
        message.warning('导出信息异常')
      }
    }).catch(() => {
      message.warning('下载失败！')
    })
  })
}

export default instance();
