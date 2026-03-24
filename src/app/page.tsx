import { redirect } from "next/navigation"
import { APP_ROUTES } from "@/features/constants/routes"

export default function HomePage() {
  redirect(APP_ROUTES.defaults.authenticated)
}
