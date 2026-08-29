import { task } from "@trigger.dev/sdk";

export const helloWorldTask = task({
  id: "hello-world",
  run: async (payload: { name: string }) => {
    const message = `Hello, ${payload.name}!`;

    console.log(message);

    return { message };
  },
});
