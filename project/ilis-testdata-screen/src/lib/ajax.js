import axios from "axios";

// const isProd = process.env.NODE_ENV === "production";

const ajax = axios.create({
  timeout: 1000*60*60
});

ajax.interceptors.request.use((config) => {
  return config;
}, function (error) {
  return Promise.reject(error);
});

ajax.interceptors.response.use(function (respon) {
  const { data } = respon;

  return data;
}, function (error) {
  console.log(error);
  const errRespon = error.response;

  if (errRespon) {
    return Promise.reject(errRespon.data);
  } else {
    return Promise.reject(error.message);
  }
});

export default ajax;