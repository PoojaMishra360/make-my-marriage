import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import LoginForm from "./login-form";
import { readSessionUserId } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db/mongodb";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mmm_session")?.value;
  if (session) {
    const request = new Request("http://localhost", { headers: { cookie: `mmm_session=${session}` } });
    const userId = readSessionUserId(request);
    if (userId) {
      const user = await (await getDb()).collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { _id: 1 } });
      if (user) redirect("/welcome");
    }
  }
  return <LoginForm />;
}
