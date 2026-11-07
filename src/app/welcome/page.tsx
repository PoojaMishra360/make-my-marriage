import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { LogoutButton } from "@/app/components/logout-button";
import { readSessionUserId } from "@/lib/auth/credentials";
import { getDb } from "@/lib/db/mongodb";

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mmm_session")?.value;
  const request = new Request("http://localhost", { headers: { cookie: session ? `mmm_session=${session}` : "" } });
  const userId = readSessionUserId(request);
  if (!userId) redirect("/login");

  const user = await (await getDb()).collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { displayName: 1, email: 1 } });
  if (!user) redirect("/login");
  const currentUser = user;
  const workspace = await (await getDb()).collection("memberships").findOne({ userId: new ObjectId(userId), status: "active" }, { projection: { _id: 1 } });
  if (workspace) redirect("/dashboard");
  redirect("/workspace/new");

  return <main className="welcome-page">
    <header className="welcome-topbar"><Link className="welcome-brand" href="/">Make My Marriage</Link><LogoutButton /></header>
    <section className="welcome-content">
      <p className="landing-kicker">Your private wedding workspace</p>
      <h1>Welcome, {currentUser.displayName}.</h1>
      <p className="welcome-lede">Your account is connected to MongoDB and ready for your celebration.</p>
      <div className="welcome-actions"><Link className="landing-button" href="/dashboard">Open your dashboard <span aria-hidden="true">→</span></Link><Link className="landing-button landing-button-quiet" href="/workspace/new">Create a wedding workspace</Link></div>
      <p className="welcome-email">Signed in as {currentUser.email}</p>
    </section>
  </main>;
}
