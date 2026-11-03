import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <section className="flex flex-col items-center justify-center text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to Attendies
          </h1>
          <p className="text-muted-foreground max-w-md">
            Global Workforce Management Platform for Multi-Tenant SaaS
          </p>

          <div className="grid gap-4 mt-8">
            <Link href="/login" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Sign In
            </Link>

            <a
              href="/platform/register-company"
              className="inline-flex items-center px-6 py-3 border border-input rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Register Company
            </a>
          </div>

          <div className="mt-12 text-sm text-muted-foreground">
            Powered by Next.js, Supabase & Tailwind CSS
          </div>
        </section>
      </main>
    </div>
  );
}
