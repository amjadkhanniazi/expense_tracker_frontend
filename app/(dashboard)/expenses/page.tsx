"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useExpense } from "@/lib/expense-context"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Edit, Loader2, Plus, Trash2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

const expenseSchema = z.object({
  description: z.string().min(1, { message: "Description is required" }),
  amount: z.coerce.number().positive({ message: "Amount must be positive" }),
  category: z.string().min(1, { message: "Category is required" }),
  date: z.date(),
  notes: z.string().optional(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

const categorySchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  color: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

const budgetSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.coerce.number().positive({ message: "Budget must be positive" }),
})

type BudgetFormValues = z.infer<typeof budgetSchema>

export default function ExpensesPage() {
  const {
    categories,
    transactions,
    budgets,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    loading,
    error,
  } = useExpense()

  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("transactions")
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false)
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false)
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize forms
  const expenseForm = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "",
      date: new Date(),
      notes: "",
    },
  })

  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: "#4f46e5",
    },
  })

  const budgetForm = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: "",
      amount: 0,
    },
  })

  // Set active tab from URL if provided
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && (tab === "transactions" || tab === "categories" || tab === "budget")) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isAddExpenseOpen) {
      expenseForm.reset({
        description: "",
        amount: 0,
        category: "",
        date: new Date(),
        notes: "",
      })
    }
  }, [isAddExpenseOpen, expenseForm])

  useEffect(() => {
    if (!isAddCategoryOpen) {
      categoryForm.reset({
        name: "",
        color: "#4f46e5",
      })
    }
  }, [isAddCategoryOpen, categoryForm])

  useEffect(() => {
    if (!isAddBudgetOpen) {
      budgetForm.reset({
        category: "",
        amount: 0,
      })
    }
  }, [isAddBudgetOpen, budgetForm])

  // Set form values when editing
  useEffect(() => {
    if (selectedTransaction && isEditExpenseOpen) {
      const transaction = transactions.find((t) => t._id === selectedTransaction)
      if (transaction) {
        expenseForm.reset({
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          date: new Date(transaction.date),
          notes: transaction.description,
        })
      }
    }
  }, [selectedTransaction, isEditExpenseOpen, expenseForm, transactions])

  useEffect(() => {
    if (selectedCategory && isEditCategoryOpen) {
      const category = categories.find((c) => c._id === selectedCategory)
      if (category) {
        categoryForm.reset({
          name: category.name,
          color: category.color || "#4f46e5",
        })
      }
    }
  }, [selectedCategory, isEditCategoryOpen, categoryForm, categories])

  useEffect(() => {
    if (selectedBudget && isEditBudgetOpen) {
      const budget = budgets.find((b) => b._id === selectedBudget)
      if (budget) {
        budgetForm.reset({
          category: budget.category,
          amount: budget.amount,
        })
      }
    }
  }, [selectedBudget, isEditBudgetOpen, budgetForm, budgets])

  // Handle form submissions
  const onAddExpense = async (data: ExpenseFormValues) => {
    setIsSubmitting(true)
    try {
      await addTransaction({
        description: data.description,
        amount: data.amount,
        category: data.category,
        type: "expense",
        date: data.date.toISOString(),
      })

      toast({
        title: "Expense added",
        description: "Your expense has been added successfully",
      })

      setIsAddExpenseOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add expense",
        description: error.message || "There was an error adding your expense",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onEditExpense = async (data: ExpenseFormValues) => {
    if (!selectedTransaction) return

    setIsSubmitting(true)
    try {
      await updateTransaction(selectedTransaction, {
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date.toISOString(),
      })

      toast({
        title: "Expense updated",
        description: "Your expense has been updated successfully",
      })

      setIsEditExpenseOpen(false)
      setSelectedTransaction(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update expense",
        description: error.message || "There was an error updating your expense",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDeleteExpense = async (id: string) => {
    try {
      await deleteTransaction(id)

      toast({
        title: "Expense deleted",
        description: "Your expense has been deleted successfully",
      })

      if (selectedTransaction === id) {
        setIsEditExpenseOpen(false)
        setSelectedTransaction(null)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete expense",
        description: error.message || "There was an error deleting your expense",
      })
    }
  }

  const onAddCategory = async (data: CategoryFormValues) => {
    setIsSubmitting(true)
    try {
      await addCategory(data.name, data.color)

      toast({
        title: "Category added",
        description: "Your category has been added successfully",
      })

      setIsAddCategoryOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add category",
        description: error.message || "There was an error adding your category",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onEditCategory = async (data: CategoryFormValues) => {
    if (!selectedCategory) return

    setIsSubmitting(true)
    try {
      await updateCategory(selectedCategory, data.name, data.color)

      toast({
        title: "Category updated",
        description: "Your category has been updated successfully",
      })

      setIsEditCategoryOpen(false)
      setSelectedCategory(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update category",
        description: error.message || "There was an error updating your category",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)

      toast({
        title: "Category deleted",
        description: "Your category has been deleted successfully",
      })

      if (selectedCategory === id) {
        setIsEditCategoryOpen(false)
        setSelectedCategory(null)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete category",
        description: error.message || "There was an error deleting your category",
      })
    }
  }

  const onAddBudget = async (data: BudgetFormValues) => {
    setIsSubmitting(true)
    try {
      const now = new Date()
      await addBudget({
        category: data.category,
        amount: data.amount,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      })

      toast({
        title: "Budget added",
        description: "Your budget has been added successfully",
      })

      setIsAddBudgetOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add budget",
        description: error.message || "There was an error adding your budget",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onEditBudget = async (data: BudgetFormValues) => {
    if (!selectedBudget) return

    setIsSubmitting(true)
    try {
      await updateBudget(selectedBudget, {
        amount: data.amount,
      })

      toast({
        title: "Budget updated",
        description: "Your budget has been updated successfully",
      })

      setIsEditBudgetOpen(false)
      setSelectedBudget(null)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update budget",
        description: error.message || "There was an error updating your budget",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDeleteBudget = async (id: string) => {
    try {
      await deleteBudget(id)

      toast({
        title: "Budget deleted",
        description: "Your budget has been deleted successfully",
      })

      if (selectedBudget === id) {
        setIsEditBudgetOpen(false)
        setSelectedBudget(null)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete budget",
        description: error.message || "There was an error deleting your budget",
      })
    }
  }

  if (loading.categories || loading.transactions || loading.budgets) {
    return (
      <div className="flex h-full w-full items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
        <p className="text-muted-foreground">Manage your expenses, categories, and budget.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>
          {activeTab === "transactions" && (
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Expense</DialogTitle>
                  <DialogDescription>Add a new expense to track your spending.</DialogDescription>
                </DialogHeader>
                <form onSubmit={expenseForm.handleSubmit(onAddExpense)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        placeholder="Groceries, Rent, etc."
                        {...expenseForm.register("description")}
                      />
                      {expenseForm.formState.errors.description && (
                        <p className="text-sm text-destructive">{expenseForm.formState.errors.description.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...expenseForm.register("amount")}
                      />
                      {expenseForm.formState.errors.amount && (
                        <p className="text-sm text-destructive">{expenseForm.formState.errors.amount.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        onValueChange={(value) => expenseForm.setValue("category", value)}
                        value={expenseForm.watch("category")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {expenseForm.formState.errors.category && (
                        <p className="text-sm text-destructive">{expenseForm.formState.errors.category.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expenseForm.watch("date") ? (
                              format(expenseForm.watch("date"), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={expenseForm.watch("date")}
                            onSelect={(date) => date && expenseForm.setValue("date", date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea id="notes" placeholder="Additional details..." {...expenseForm.register("notes")} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Expense"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {activeTab === "categories" && (
            <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                  <DialogDescription>Add a new category to organize your expenses.</DialogDescription>
                </DialogHeader>
                <form onSubmit={categoryForm.handleSubmit(onAddCategory)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Food, Transportation, etc." {...categoryForm.register("name")} />
                      {categoryForm.formState.errors.name && (
                        <p className="text-sm text-destructive">{categoryForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color</Label>
                      <div className="flex gap-2">
                        <Input id="color" type="color" className="w-12 h-10 p-1" {...categoryForm.register("color")} />
                        <Input
                          type="text"
                          value={categoryForm.watch("color")}
                          onChange={(e) => categoryForm.setValue("color", e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Category"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
          {activeTab === "budget" && (
            <Dialog open={isAddBudgetOpen} onOpenChange={setIsAddBudgetOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Budget</DialogTitle>
                  <DialogDescription>Set a budget for a category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={budgetForm.handleSubmit(onAddBudget)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        onValueChange={(value) => budgetForm.setValue("category", value)}
                        value={budgetForm.watch("category")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {budgetForm.formState.errors.category && (
                        <p className="text-sm text-destructive">{budgetForm.formState.errors.category.message}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Budget Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...budgetForm.register("amount")}
                      />
                      {budgetForm.formState.errors.amount && (
                        <p className="text-sm text-destructive">{budgetForm.formState.errors.amount.message}</p>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Budget"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.filter((t) => t.type === "expense").length > 0 ? (
            <div className="grid gap-4">
              {transactions
                .filter((t) => t.type === "expense")
                .map((transaction) => {
                  const category = categories.find((c) => c._id === transaction.category)

                  return (
                    <Card key={transaction._id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="p-2 rounded-full"
                              style={{
                                backgroundColor: category?.color ? `${category.color}20` : "#4f46e520",
                              }}
                            >
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{
                                  backgroundColor: category?.color || "#4f46e5",
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-medium">${transaction.amount.toFixed(2)}</p>
                            <div className="rounded-full px-2 py-1 text-xs bg-muted">
                              {category?.name || "Uncategorized"}
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedTransaction(transaction._id)
                                  setIsEditExpenseOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => onDeleteExpense(transaction._id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div>
                  <h3 className="text-lg font-medium">No expenses yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start tracking your expenses by adding your first transaction.
                  </p>
                </div>
                <Button onClick={() => setIsAddExpenseOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Edit Expense Dialog */}
          <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Expense</DialogTitle>
                <DialogDescription>Update your expense details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={expenseForm.handleSubmit(onEditExpense)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Groceries, Rent, etc."
                      {...expenseForm.register("description")}
                    />
                    {expenseForm.formState.errors.description && (
                      <p className="text-sm text-destructive">{expenseForm.formState.errors.description.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...expenseForm.register("amount")}
                    />
                    {expenseForm.formState.errors.amount && (
                      <p className="text-sm text-destructive">{expenseForm.formState.errors.amount.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) => expenseForm.setValue("category", value)}
                      value={expenseForm.watch("category")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {expenseForm.formState.errors.category && (
                      <p className="text-sm text-destructive">{expenseForm.formState.errors.category.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expenseForm.watch("date") ? (
                            format(expenseForm.watch("date"), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expenseForm.watch("date")}
                          onSelect={(date) => date && expenseForm.setValue("date", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea id="notes" placeholder="Additional details..." {...expenseForm.register("notes")} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Expense"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.length > 0 ? (
              categories.map((category) => {
                const categoryTransactions = transactions.filter(
                  (t) => t.category === category._id && t.type === "expense",
                )
                const total = categoryTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

                return (
                  <Card key={category._id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: category.color || "#4f46e5" }}
                          />
                          <CardTitle className="text-base">{category.name}</CardTitle>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(category._id)
                              setIsEditCategoryOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDeleteCategory(category._id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
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
                  <Button onClick={() => setIsAddCategoryOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Edit Category Dialog */}
          <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update your category details.</DialogDescription>
              </DialogHeader>
              <form onSubmit={categoryForm.handleSubmit(onEditCategory)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Food, Transportation, etc." {...categoryForm.register("name")} />
                    {categoryForm.formState.errors.name && (
                      <p className="text-sm text-destructive">{categoryForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input id="color" type="color" className="w-12 h-10 p-1" {...categoryForm.register("color")} />
                      <Input
                        type="text"
                        value={categoryForm.watch("color")}
                        onChange={(e) => categoryForm.setValue("color", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Category"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          {budgets.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgets.map((budget) => {
                const category = categories.find((c) => c._id === budget.category)
                const categoryTransactions = transactions.filter(
                  (t) =>
                    t.category === budget.category &&
                    t.type === "expense" &&
                    new Date(t.date).getMonth() + 1 === budget.month &&
                    new Date(t.date).getFullYear() === budget.year,
                )
                const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0)
                const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100)

                return (
                  <Card key={budget._id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{category?.name || "Unknown Category"}</CardTitle>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedBudget(budget._id)
                              setIsEditBudgetOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => onDeleteBudget(budget._id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {new Date(budget.year, budget.month - 1).toLocaleDateString(undefined, {
                          month: "long",
                          year: "numeric",
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Budget</span>
                        <span className="text-sm font-medium">${budget.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Spent</span>
                        <span className="text-sm font-medium">${spent.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Remaining</span>
                        <span className="text-sm font-medium">${(budget.amount - spent).toFixed(2)}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Progress</span>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full ${percentage > 90 ? "bg-destructive" : percentage > 70 ? "bg-warning" : "bg-primary"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div>
                  <h3 className="text-lg font-medium">No budgets yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Set budgets for your categories to track your spending.
                  </p>
                </div>
                <Button onClick={() => setIsAddBudgetOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Budget
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Edit Budget Dialog */}
          <Dialog open={isEditBudgetOpen} onOpenChange={setIsEditBudgetOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Budget</DialogTitle>
                <DialogDescription>Update your budget amount.</DialogDescription>
              </DialogHeader>
              <form onSubmit={budgetForm.handleSubmit(onEditBudget)}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Budget Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...budgetForm.register("amount")}
                    />
                    {budgetForm.formState.errors.amount && (
                      <p className="text-sm text-destructive">{budgetForm.formState.errors.amount.message}</p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Budget"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}
