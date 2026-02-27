import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to CMS App",
};

export default function HomePage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            CMS App
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A robust, scalable and secure CMS built with Next.js, TypeScript,
            Tailwind CSS, and Shadcn/UI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    title: "Next.js 15 + App Router",
    description:
      "Built with the latest Next.js App Router for optimal performance and DX.",
  },
  {
    title: "Type-Safe",
    description:
      "TypeScript strict mode with Zod validation for end-to-end type safety.",
  },
  {
    title: "Secure by Default",
    description:
      "CSP headers, CSRF protection, and secure environment variable handling.",
  },
];
