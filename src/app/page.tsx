import { redirect } from "next/navigation";

// Middleware already routes "/" based on session state; this is just the
// fallback if the route is ever reached directly.
export default function RootPage() {
  redirect("/login");
}
