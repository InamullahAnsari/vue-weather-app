import axios from "axios";
import { CURRENT_WEATHER, API_KEY } from "../constant";

const apiClient = axios.create({
    baseURL: CURRENT_WEATHER,
    withCredentials: false, // This is the default
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
});

export default {
    getWeather(city = 'Bhopal') {
        const url = `weather?q=${city}&appid=${API_KEY}`;
        return apiClient.get(url);
    },
    getWeatherByLatLong({ lat, lon }) {
        const url = `weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        return apiClient.get(url);
    }
};