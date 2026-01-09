import { createRouter } from "@tanstack/react-router"
import routes from "./routes"

export const router = createRouter({ routeTree: routes })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}