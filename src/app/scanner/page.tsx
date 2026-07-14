import { redirect } from "next/navigation";

/** The scan step now lives inside the Activation Console on /dashboard. */
export default function Page() {
  redirect("/dashboard");
}
