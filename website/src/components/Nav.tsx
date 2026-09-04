import Link from "next/link";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions";

export default async function Nav() {
  const session = await getSession();
  return (
    <header className="nav-bar">
      <nav className="site flex flex-wrap items-stretch justify-between">
        <Link href="/" className="title-font flex items-center gap-2 self-center py-3 text-lg sm:text-xl font-bold no-underline" style={{ color: "var(--gold)" }}>
          <img src="/icon.svg" alt="" className="h-7 w-7" />
          {process.env.NEXT_PUBLIC_REALM_NAME ?? "Elwynnkeep"}
        </Link>
        <div className="flex items-stretch">
          <Link href="/" className="nav-link flex items-center">Home</Link>
          <Link href="/armory" className="nav-link flex items-center">Armory</Link>
          {session ? (
            <>
              <Link href="/account" className="nav-link flex items-center">Account</Link>
              <form action={logoutAction} className="flex">
                <button className="nav-link" type="submit">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link flex items-center">Login</Link>
              <Link href="/register" className="nav-link flex items-center">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
