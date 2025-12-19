/* // this is already done in auth.ts
import { handlers } from "@/auth"
export const { GET, POST } = handlers */

// but this file has to exist to catch all auth related
export { GET, POST } from "@/auth";
