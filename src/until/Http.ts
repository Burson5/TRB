import axios from 'axios';
import apiConfig from '~/config/api';
import RootStore from '~/stores';
import { ConstValues } from './ConstValues';

let apiUrl = apiConfig.host;
let isEncode = apiConfig.encode;

// 创建axios实例
const instance = axios.create({
  timeout: 1000 * 60 * 3,
  baseURL: `${apiUrl}/`
});

instance.cancelToken = axios.CancelToken;

instance.interceptors.request.use(
  config => {
    // 增加固定请求参数
    let data = config.data;
    const userStore = RootStore.instance.userStore;
    let user = userStore.user;
    data = {
      ...data,
      ...{
        user_id: user && user.id.toString(),
        company_id: user && user.comId.toString(),
        oauth_string: user && user.oauth_string.toString(),
        language: { zh: '1', en: '0' }[userStore.language]
      }
    };
    if (process.env.LOG) {
      // 打印请求参数
      console.log('-----request logined------');
      console.log(config.url);
      console.log(JSON.stringify(data));
      console.log('----------------');
    }
    // 加密请求参数
    // 判断当前环境是否需要加解密
    if (isEncode) {
      data = RootStore.instance.coded.secretor.encode(
        JSON.stringify(data),
        RootStore.instance.userStore.codeKeys.key,
        RootStore.instance.userStore.codeKeys.iv
      );
    }
    config.data = {
      data: data,
      user_id: user && user.id.toString(),
      machine_string: user && user.machine_string.toString()
    };

    // 增加请求头
    config.headers['content-type'] = 'application/json;charset=utf-8';
    config.headers['super-version'] = apiConfig.version;
    config.headers['super-lang'] = RootStore.instance.userStore.apiUseLanguage;
    return config;
  },
  err => {
    console.log(err);
    return Promise.reject(err);
  }
);

instance.interceptors.response.use(
  response => {
    // 判断当前环境是否需要加解密
    let resultData;
    if (isEncode) {
      try {
        resultData = RootStore.instance.coded.secretor.decode(
          response.data.data,
          RootStore.instance.userStore.codeKeys.deKey,
          RootStore.instance.userStore.codeKeys.deIv
        );
        response.data.data = JSON.parse(resultData);
      } catch (e) {
        console.log(e);
        // response.data = resultData;
        response.data.data = {
          ...{
            msg: ConstValues.Notification.ServerError,
            reason: e.message
          } // 返回接口返回的错误信息 报错
        };
      }
    } else {
      resultData = response;
    }
    if (process.env.LOG) {
      // 打印结果
      console.warn('------response logined ------');
      console.log(response.config.url);
      console.log(response.data.data);
      console.warn('----------------');
    }
    resultData = response.data.data;
    return resultData;
  },
  error => {
    // 拦截错误
    if (error.response) {
      // switch (error.response.status) {
      // }
    }
    // console.log(error);
    const err = {
      ...error,
      ...error.response,
      ...{ msg: ConstValues.Notification.NetError } // 返回接口返回的错误信息 报错
    };
    return Promise.reject(err); //
  }
);
export default instance;
