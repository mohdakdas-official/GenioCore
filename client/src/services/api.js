import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
})

let accessToken = null
let refreshPromise = null

export const setAccessToken = (token) => {
    accessToken = token
}

export const clearAccessToken = () => {
    accessToken = null
}

api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        return config;
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            error.response?.status !== 401 ||
            originalRequest?._retry ||
            originalRequest?.url?.includes("/auth/refresh-token")
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        try {
            if (!refreshPromise) {
                refreshPromise = api.post("/auth/refresh-token").then((response) => {
                    const newAccessToken = response.data.data.accessToken

                    setAccessToken(newAccessToken)

                    return newAccessToken
                }).finally(() => {
                    refreshPromise = null
                })
            }

            const newAccessToken = await refreshPromise;

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

            return api(originalRequest)
        } catch (refreshError) {
            clearAccessToken();

            return Promise.reject(refreshError)
        }
    }
)

export default api