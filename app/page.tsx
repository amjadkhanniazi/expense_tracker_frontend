"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import AuthService from "@/lib/auth-service"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    try {
      await AuthService.forgotPassword({ email: data.email })
      setIsSubmitted(true)
      toast({
        title: "Reset email sent",
        description: "If an account with that email exists, we've sent password reset instructions.",
      })
    } catch (error) {
      // Don't show specific errors for security reasons
      toast({
        title: "Reset email sent",
        description: "If an account with that email exists, we've sent password reset instructions.",
      })
      setIsSubmitted(true)
    } finally {
      setIsLoading(false)
    }
  }

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
