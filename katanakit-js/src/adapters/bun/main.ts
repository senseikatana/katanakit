import { useInitDummyJson } from "./dummyjson.service.js";
import { useBunStart } from "./server.js";

useInitDummyJson();

const server = useBunStart(Number(process.env.PORT ?? 3000), process.env.HOST ?? "localhost");
console.log(`Server running at ${server.url}`);
