"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { useExpense } from "@/lib/expense-context"
import { ArrowUpRight, DollarSign, LineChart, PiggyBank, Wallet } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { transactions = [], categories = [], budgetSummary, loading } = useExpense()

  const [totalExpenses, setTotalExpenses] = useState(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)
  const [budgetAmount, setBudgetAmount] = useState(0)
  const [budgetPercentage, setBudgetPercentage] = useState(0)

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      // Calculate total expenses
      const total = transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0)
      setTotalExpenses(total)

      // Calculate monthly expenses (current month)
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      const monthly = transactions
        .filter((transaction) => {
          if (!transaction.date) return false
          const transactionDate = new Date(transaction.date)
          return (
            transaction.type === "expense" &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, transaction) => sum + transaction.amount, 0)

      setMonthlyExpenses(monthly)
    }
  }, [transactions])

  useEffect(() => {
    if (budgetSummary) {
      setBudgetAmount(budgetSummary.budget || 0)

      // Calculate budget percentage
      if (budgetSummary.budget > 0) {
        setBudgetPercentage(Math.min(Math.round((budgetSummary.spent / budgetSummary.budget) * 100), 100))
      }
    }
  }, [budgetSummary])

  if (loading.categories || loading.transactions || loading.budgetSummary) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username || "User"}! Here's an overview of your expenses.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${budgetAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Monthly budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetPercentage}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-muted">
              <div
                className={`h-2 rounded-full ${budgetPercentage > 90 ? "bg-destructive" : budgetPercentage > 70 ? "bg-warning" : "bg-primary"}`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4">
            {transactions && transactions.length > 0 ? (
              transactions
                .filter((transaction) => transaction.type === "expense")
                .slice(0, 5)
                .map((transaction) => (
                  <Card key={transaction._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full bg-primary/10`}>
                            <DollarSign className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.date ? new Date(transaction.date).toLocaleDateString() : "No date"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                          <div className="rounded-full px-2 py-1 text-xs bg-muted">
                            {(categories && categories.find((c) => c._id === transaction.category)?.name) ||
                              "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                  <Wallet className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">No expenses yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Start tracking your expenses by adding your first transaction.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/expenses">Add Expense</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
            {transactions && transactions.length > 0 && (
              <Button variant="outline" asChild>
                <Link href="/expenses" className="flex items-center gap-2">
                  View all transactions
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories && categories.length > 0 ? (
              categories.map((category) => {
                const categoryTransactions = transactions.filter(
                  (t) => t.category === category._id && t.type === "expense",
                )
                const total = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

                return (
                  <Card key={category._id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{category.name}</CardTitle>
                      <CardDescription>{categoryTransactions.length} transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${total.toFixed(2)}</div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <Card className="sm:col-span-2 lg:col-span-3">
                <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                  <div>
                    <h3 className="text-lg font-medium">No categories yet</h3>
                    <p className="text-sm text-muted-foreground">Create categories to better organize your expenses.</p>
                  </div>
                  <Button asChild>
                    <Link href="/expenses?tab=categories">Add Category</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
