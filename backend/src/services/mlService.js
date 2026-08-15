import axios from "axios";
import { env } from "../config/env.js";

const client = axios.create({
  baseURL: env.mlServiceUrl,
  timeout: 5000
});

export async function requestForecast(history) {
  const { data } = await client.post("/forecast", { history });
  return data;
}

export async function requestRecommendations(payload) {
  const { data } = await client.post("/recommend", payload);
  return data.recommendations;
}
