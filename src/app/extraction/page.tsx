import { redirect } from "next/navigation";

/** The target/claim step now lives inside the Activation Console on /dashboard. */
export default function Page() {
  redirect("/dashboard");
}
