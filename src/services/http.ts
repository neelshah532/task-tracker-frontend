import axios from "axios";

// const abortControllers = new Map<string, AbortController>();

// const generateRequestToken = (config: InternalAxiosRequestConfig) => {
//   const { method, url, params, data } = config;
//   return `${String(method)}-${String(url)}-${JSON.stringify(
//     params
//   )}-${JSON.stringify(data)}`;
// };

const http = axios.create({
  baseURL: `${import.meta.env.VITE_LOCAL_HOST}`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// http.interceptors.request.use(
//   async (config) => {
//     // Attach an AbortController to the request
//     const requestToken = generateRequestToken(config);
//     const abortController = new AbortController();
//     abortControllers.set(requestToken, abortController);
//     config.signal = abortController.signal;

//     // Set timeout for the request
//     // config.timeout = 5000

//     // Set Authorization header
//     const data = localStorage.getItem("user") || null;
//     const token = data && JSON.parse(data || "");
//     config.headers.Authorization = `Bearer ${token.token} `;
//     // console.log(token.token);
//     // console.log(config.headers)
//     return config;
//   },
//   async (error) => {
//     console.log("Global Error 2", error);
//     return await Promise.reject(error);
//   }
// );

export default http;
