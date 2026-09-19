import { useInitApis } from "katanakit-js";

const initialized = { value: false };

export function usePlaygroundApis() {
  if (!initialized.value) {
    useInitApis({
      pokeapi: {
        baseUri: "https://pokeapi.co/api/v2",
        endpoints: {
          pokemonById: "/pokemon/:id/",
          pokemonList: "/pokemon",
        },
      },
      jsonplaceholder: {
        baseUri: "https://jsonplaceholder.typicode.com",
        endpoints: {
          postById: "/posts/:id/",
          userList: "/users",
        },
      },
    });
    initialized.value = true;
  }
}
