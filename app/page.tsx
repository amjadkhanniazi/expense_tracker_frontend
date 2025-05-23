export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-center tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track Your Expenses with Ease
                </h1>
                <p className="mx-auto max-w-[700px] text-center text-muted-foreground md:text-xl">
                  Take control of your finances with our simple yet powerful expense tracking app.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button>
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
