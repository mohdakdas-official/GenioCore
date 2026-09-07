import { SunMoon } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
const HomePage = () => {
  const context = useContext(AuthContext);
  const { user } = context;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold tracking-tight text-text-primary"
            >
              NeuAspire
            </Link>
          </div>

          {/* Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Enterprise
            </Link>

            <Link
              to="#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Security
            </Link>

            <Link
              to="#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Customers
            </Link>

            <Link
              to="#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Pricing
            </Link>

            <Link
              to="#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Blog
            </Link>

            <Link
              to="#"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Resources
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to={"/v1/appearance"}
              className="flex gap-2 items-center text-sm font-medium text-text-secondary transition-colors hover:text-text-primary border-r border-border p-4"
            >
              <SunMoon size={18} />
              Theme
            </Link>
            {/* Actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  to="/v1/dashboard"
                  className="underline ml-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition-colors hover:bg-primary-hover active:bg-primary-active"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/v1/auth/login"
                    className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    Login
                  </Link>

                  <Link
                    to="/v1/auth/signup"
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-brand transition-colors hover:bg-primary-hover active:bg-primary-active"
                  >
                    Get started for free
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl">
            <span className="mb-6 inline-flex rounded-full border border-border-subtle bg-surface px-3 py-1 text-sm font-medium text-text-secondary">
              AI-powered code review
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
              Write better code.
              <span className="block text-primary">Build with confidence.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              NeuAspire helps developers understand, review, and improve their
              code with intelligent AI-powered feedback.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                to="/v1/auth/signup"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-brand transition-colors hover:bg-primary-hover active:bg-primary-active"
              >
                Get started for free
              </Link>

              <Link
                to="#"
                className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text-primary transition-colors hover:border-border-hover hover:bg-surface"
              >
                Learn more
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
