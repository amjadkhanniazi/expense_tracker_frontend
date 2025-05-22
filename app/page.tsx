export default function Home() {
  return (
    <div className="flex flex-col justify-center min-h-[100dvh] w-full ">
      <div className="w-full max-w-4xl mx-auto px-4 text-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
            Track Your Expenses with Ease
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Take control of your finances with our simple yet powerful expense tracking app.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Get Started
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 h-4 w-4"
              >
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </a>
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
