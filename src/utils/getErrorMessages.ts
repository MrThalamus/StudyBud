import { isAxiosError } from "axios";

export function getErrorMessages(error: unknown): string[] {
  if (isAxiosError(error)) {
    if (!error.response) return ["Cannot reach the server."];
    const data = error.response.data;
    if (data && typeof data === "object") {
      const messages = Object.values(data).flat().map(String);
      if (messages.length > 0) return messages;
    }
  }
  return ["Something went wrong. Please try again."];
}
