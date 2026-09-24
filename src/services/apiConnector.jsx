import axios from "axios";

export const axiosInstance = axios.create({
    withCredentials: true, // Send cookies (refreshToken) with every request
});

// =================================================================
// RESPONSE INTERCEPTOR — Auto-refresh access token on 401
// =================================================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401, not a retry, and not the refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh")
        ) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const BASE_URL = process.env.REACT_APP_BASE_URL;
                const { data } = await axiosInstance.post(`${BASE_URL}/auth/refresh`);
                const newToken = data.accessToken;

                // Update localStorage
                localStorage.setItem("token", JSON.stringify(newToken));

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return axiosInstance(originalRequest);

            } catch (refreshError) {
                // Refresh failed — force logout
                processQueue(refreshError, null);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);


export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: method,
        url: url,
        data: bodyData?bodyData:null,
        headers: headers?headers:null,
        params: params?params:null
    })
};