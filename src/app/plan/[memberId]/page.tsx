"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calendar, Target, Activity, Utensils, TrendingUp, Dumbbell, Download, User, BarChart3, Zap, Heart, Clock, Flame, Loader2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface WorkoutSession {
  type: string
  duration_min: number
  intensity: string
  notes: string
}

interface DailyWorkout {
  day: string
  focus: string
  sessions: WorkoutSession[]
}

interface BiometricsPlan {
  weekly_workout_plan: DailyWorkout[]
  training_guidelines: {
    warmup: string
    cooldown: string
    injury_prevention: string
  }
  personal_note: string
}

interface MealItem {
  time: string
  meal_type: string
  items: string[]
  calories: number
  macros: {
    protein_g: number
    carbs_g: number
    fat_g: number
  }
}

interface NutritionPlan {
  daily_meal_schedule: MealItem[]
  summary: {
    total_calories: number
    macro_targets_g: {
      protein: number
      carbs: number
      fat: number
    }
    hydration_ml: number
    supplements_note: string
  }
  personal_note: string
}

interface MemberWithPlans {
  MemberID: string | number
  BMI: number
  BodyFat_Percent: number
  VO2max: number
  EnduranceScore: number
  FlexibilityScore: number
  WeeklyWorkouts: number
  Predicted_Cluster: number
  Program_Type: string
  Details: string
  Biometrics_Plan?: BiometricsPlan
  Nutrition_Plan?: NutritionPlan
}

export default function PlanPage() {
  const params = useParams()
  const memberId = params.memberId as string
  const [member, setMember] = useState<MemberWithPlans | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMemberFromStorage = () => {
      try {
        const storedPlans = localStorage.getItem("memberPlans")
        if (!storedPlans) {
          setError("No member data found. Please upload CSV data first.")
          setLoading(false)
          return
        }

        const memberPlans: MemberWithPlans[] = JSON.parse(storedPlans)
        const foundMember = memberPlans.find((m) => m.MemberID.toString() === memberId.toString())

        if (!foundMember) {
          setError("Member not found in current data set.")
          setLoading(false)
          return
        }

        setMember(foundMember)
        setLoading(false)
      } catch (err) {
        console.error("Error loading member data:", err)
        setError("Failed to load member data. Please try again.")
        setLoading(false)
      }
    }

    loadMemberFromStorage()
  }, [memberId])

  const generatePDF = () => {
    if (!member) return

    // Create a new window for printing
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Wellness Plan - Member ${member.MemberID}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #1a1a1a;
              background: white;
              margin: 0;
              padding: 40px;
            }
            
            .document-container {
              max-width: 210mm;
              margin: 0 auto;
              background: white;
            }
            
            .header { 
              text-align: center;
              margin-bottom: 40px;
              padding: 30px 0;
              border-bottom: 3px solid #000;
              position: relative;
            }
            
            .header::after {
              content: '';
              position: absolute;
              bottom: -6px;
              left: 50%;
              transform: translateX(-50%);
              width: 60px;
              height: 3px;
              background: #666;
            }
            
            .header h1 { 
              font-size: 28pt;
              font-weight: 700;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            
            .header h2 { 
              font-size: 18pt;
              font-weight: 500;
              color: #666;
              margin-bottom: 12px;
            }
            
            .header p {
              font-size: 12pt;
              color: #888;
              font-weight: 400;
            }
            
            .section { 
              margin-bottom: 35px;
              page-break-inside: avoid;
            }
            
            .section h2 { 
              font-size: 16pt;
              font-weight: 600;
              color: #000;
              margin-bottom: 20px;
              padding-bottom: 8px;
              border-bottom: 2px solid #e5e5e5;
              position: relative;
            }
            
            .section h2::before {
              content: '';
              position: absolute;
              bottom: -2px;
              left: 0;
              width: 40px;
              height: 2px;
              background: #000;
            }
            
            .metrics-grid { 
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            
            .metric-card {
              background: #f8f9fa;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 16px;
              text-align: center;
            }
            
            .metric-label {
              font-size: 9pt;
              color: #666;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            
            .metric-value {
              font-size: 18pt;
              font-weight: 700;
              color: #000;
            }
            
            .program-overview {
              background: #f8f9fa;
              border-left: 4px solid #000;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 8px 8px 0;
            }
            
            .program-overview p {
              margin-bottom: 12px;
              font-size: 11pt;
              line-height: 1.6;
            }
            
            .personal-note {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 8px;
              padding: 16px;
              margin-top: 16px;
              font-style: italic;
            }
            
            .workout-day { 
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              margin-bottom: 20px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            
            .workout-day h3 {
              background: #000;
              color: white;
              padding: 12px 20px;
              margin: 0;
              font-size: 12pt;
              font-weight: 600;
            }
            
            .workout-content {
              padding: 20px;
            }
            
            .workout-focus {
              font-size: 10pt;
              color: #666;
              margin-bottom: 16px;
              font-weight: 500;
            }
            
            .workout-session { 
              background: #f8f9fa;
              border-left: 4px solid #000;
              margin: 12px 0;
              padding: 16px;
              border-radius: 0 6px 6px 0;
            }
            
            .session-header {
              font-weight: 600;
              font-size: 11pt;
              margin-bottom: 8px;
              color: #000;
            }
            
            .session-notes {
              font-size: 10pt;
              color: #666;
              line-height: 1.5;
              font-style: italic;
            }
            
            .nutrition-summary {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            
            .nutrition-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 12px;
              margin-top: 16px;
            }
            
            .nutrition-item {
              text-align: center;
              padding: 12px;
              background: white;
              border-radius: 6px;
              border: 1px solid #e9ecef;
            }
            
            .nutrition-label {
              font-size: 9pt;
              color: #666;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .nutrition-value {
              font-size: 14pt;
              font-weight: 700;
              color: #000;
            }
            
            .meal-item { 
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              margin-bottom: 16px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            
            .meal-header {
              background: #000;
              color: white;
              padding: 12px 20px;
              font-weight: 600;
              font-size: 11pt;
            }
            
            .meal-content {
              padding: 16px 20px;
            }
            
            .meal-items {
              list-style: none;
              margin-bottom: 12px;
            }
            
            .meal-items li {
              padding: 4px 0;
              border-bottom: 1px dotted #e9ecef;
              font-size: 10pt;
            }
            
            .meal-items li:last-child {
              border-bottom: none;
            }
            
            .meal-macros { 
              background: #f8f9fa;
              padding: 8px 12px;
              border-radius: 4px;
              font-size: 9pt;
              color: #666;
              font-weight: 500;
            }
            
            .guidelines-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 16px;
              margin: 20px 0;
            }
            
            .guideline-item {
              background: #f8f9fa;
              border-left: 4px solid #000;
              padding: 16px;
              border-radius: 0 6px 6px 0;
            }
            
            .guideline-title {
              font-weight: 600;
              font-size: 11pt;
              margin-bottom: 8px;
              color: #000;
            }
            
            .tracking-list {
              list-style: none;
              margin: 16px 0;
            }
            
            .tracking-list li {
              padding: 8px 0;
              border-bottom: 1px dotted #e9ecef;
              font-size: 10pt;
              position: relative;
              padding-left: 20px;
            }
            
            .tracking-list li::before {
              content: '•';
              position: absolute;
              left: 0;
              color: #000;
              font-weight: bold;
            }
            
            .tracking-list li:last-child {
              border-bottom: none;
            }
            
            @media print {
              body { 
                margin: 0;
                padding: 20px;
                font-size: 10pt;
              }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .workout-day { page-break-inside: avoid; }
              .meal-item { page-break-inside: avoid; }
            }
            
            @page {
              margin: 20mm;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="header">
              <h1>Personalized Wellness Plan</h1>
              <h2>Member ${member.MemberID}</h2>
              <p><strong>Program:</strong> ${member.Program_Type} | <strong>Cluster:</strong> ${member.Predicted_Cluster}</p>
            </div>

            <div class="section">
              <h2>Current Metrics</h2>
              <div class="metrics-grid">
                <div class="metric-card">
                  <div class="metric-label">BMI</div>
                  <div class="metric-value">${member.BMI}</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Body Fat</div>
                  <div class="metric-value">${member.BodyFat_Percent}%</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">VO2 Max</div>
                  <div class="metric-value">${member.VO2max}</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Endurance</div>
                  <div class="metric-value">${member.EnduranceScore}/100</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Flexibility</div>
                  <div class="metric-value">${member.FlexibilityScore}/100</div>
                </div>
                <div class="metric-card">
                  <div class="metric-label">Weekly Workouts</div>
                  <div class="metric-value">${member.WeeklyWorkouts}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Program Overview</h2>
              <div class="program-overview">
                <p>${member.Details}</p>
                ${member.Biometrics_Plan?.personal_note ? `<div class="personal-note"><strong>Personal Note:</strong> ${member.Biometrics_Plan.personal_note}</div>` : ""}
              </div>
            </div>

            ${
              member.Biometrics_Plan?.weekly_workout_plan
                ? `
              <div class="section">
                <h2>Weekly Workout Plan</h2>
                ${member.Biometrics_Plan.weekly_workout_plan
                  .map(
                    (day) => `
                  <div class="workout-day">
                    <h3>${day.day}</h3>
                    <div class="workout-content">
                      <div class="workout-focus"><strong>Focus:</strong> ${day.focus}</div>
                      ${day.sessions
                        .map(
                          (session) => `
                        <div class="workout-session">
                          <div class="session-header">${session.type} - ${session.duration_min} min, ${session.intensity}</div>
                          ${session.notes ? `<div class="session-notes">${session.notes}</div>` : ""}
                        </div>
                      `,
                        )
                        .join("")}
                    </div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              member.Nutrition_Plan
                ? `
              <div class="section">
                <h2>Nutrition Summary</h2>
                <div class="nutrition-summary">
                  <div class="nutrition-grid">
                    <div class="nutrition-item">
                      <div class="nutrition-label">Daily Calories</div>
                      <div class="nutrition-value">${member.Nutrition_Plan.summary.total_calories}</div>
                    </div>
                    <div class="nutrition-item">
                      <div class="nutrition-label">Protein</div>
                      <div class="nutrition-value">${member.Nutrition_Plan.summary.macro_targets_g.protein}g</div>
                    </div>
                    <div class="nutrition-item">
                      <div class="nutrition-label">Carbs</div>
                      <div class="nutrition-value">${member.Nutrition_Plan.summary.macro_targets_g.carbs}g</div>
                    </div>
                    <div class="nutrition-item">
                      <div class="nutrition-label">Fat</div>
                      <div class="nutrition-value">${member.Nutrition_Plan.summary.macro_targets_g.fat}g</div>
                    </div>
                    <div class="nutrition-item">
                      <div class="nutrition-label">Water</div>
                      <div class="nutrition-value">${(member.Nutrition_Plan.summary.hydration_ml / 1000).toFixed(1)}L</div>
                    </div>
                  </div>
                </div>
              </div>

              ${
                member.Nutrition_Plan.daily_meal_schedule
                  ? `
                <div class="section">
                  <h2>Daily Meal Plan</h2>
                  ${member.Nutrition_Plan.daily_meal_schedule
                    .map(
                      (meal) => `
                    <div class="meal-item">
                      <div class="meal-header">${meal.meal_type} (${meal.time})</div>
                      <div class="meal-content">
                        <ul class="meal-items">
                          ${meal.items.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                        <div class="meal-macros">
                          Calories: ${meal.calories} | Protein: ${meal.macros.protein_g}g | Carbs: ${meal.macros.carbs_g}g | Fat: ${meal.macros.fat_g}g
                        </div>
                      </div>
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              `
                  : ""
              }

              ${
                member.Nutrition_Plan.personal_note
                  ? `
                <div class="section">
                  <h2>Nutrition Notes</h2>
                  <div class="program-overview">
                    <p>${member.Nutrition_Plan.personal_note}</p>
                    ${member.Nutrition_Plan.summary.supplements_note ? `<p><strong>Supplements:</strong> ${member.Nutrition_Plan.summary.supplements_note}</p>` : ""}
                  </div>
                </div>
              `
                  : ""
              }
            `
                : ""
            }

            ${
              member.Biometrics_Plan
                ? `
              <div class="section">
                <h2>Training Guidelines</h2>
                <div class="guidelines-grid">
                  <div class="guideline-item">
                    <div class="guideline-title">Warm-up</div>
                    <div>${member.Biometrics_Plan.training_guidelines.warmup}</div>
                  </div>
                  <div class="guideline-item">
                    <div class="guideline-title">Cool-down</div>
                    <div>${member.Biometrics_Plan.training_guidelines.cooldown}</div>
                  </div>
                  <div class="guideline-item">
                    <div class="guideline-title">Injury Prevention</div>
                    <div>${member.Biometrics_Plan.training_guidelines.injury_prevention}</div>
                  </div>
                </div>
              </div>
            `
                : ""
            }

            <div class="section">
              <h2>Progress Tracking</h2>
              <div class="program-overview">
                <p><strong>Key Metrics to Track:</strong></p>
                <ul class="tracking-list">
                  <li>Body weight (weekly)</li>
                  <li>Body fat percentage (bi-weekly)</li>
                  <li>Workout performance</li>
                  <li>Energy levels (daily)</li>
                  <li>Sleep quality (daily)</li>
                </ul>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" role="status" aria-live="polite">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" aria-hidden="true" />
          <div className="space-y-2">
            <p className="text-foreground font-medium">Loading personalized plan...</p>
            <p className="text-muted-foreground text-sm">Preparing your wellness journey</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center" role="alert" aria-live="assertive">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium mb-2">Unable to load plan</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 transition-all duration-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Member not found</p>
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="new-container relative !border-none sm:!border-dashed bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Plan navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 px-2 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Return to dashboard"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline ml-2">Back to Dashboard</span>
                <span className="sm:hidden ml-1">Back</span>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" aria-hidden="true" />
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold text-foreground">Member {member.MemberID}</h1>
                {member.Biometrics_Plan && (
                  <span className="hidden sm:inline text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded-full">
                    AI Plan
                  </span>
                )}
              </div>
            </div>
            <Button
              onClick={generatePDF}
              size="sm"
              variant="outline"
              className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:shadow-md"
              aria-label="Export plan as PDF document"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-3">Personalized Wellness Plan</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              Cluster {member.Predicted_Cluster}
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-medium">
              {member.Program_Type}
            </Badge>
            {member.Biometrics_Plan && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm font-medium">
                AI-Generated Plan
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
            Comprehensive fitness and nutrition program tailored for your goals and current fitness level
          </p>
        </header>

                 {/* Overview Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
           {/* Current Metrics */}
           <Card className="lg:col-span-2 xl:col-span-2 hover:shadow-md transition-shadow duration-200 border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
                Current Metrics
              </CardTitle>
              <CardDescription className="text-sm">Your current fitness measurements</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="p-3 bg-red-950/20 rounded-lg border border-red-800 hover:bg-red-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium">BMI</span>
                      </div>
                      <Badge variant="secondary" className="bg-red-900/30 text-red-400 self-start sm:self-auto">{member.BMI}</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-800 hover:bg-blue-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm font-medium">Body Fat</span>
                      </div>
                      <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 self-start sm:self-auto">{member.BodyFat_Percent}%</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-950/20 rounded-lg border border-yellow-800 hover:bg-yellow-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <span className="text-sm font-medium">VO2 Max</span>
                      </div>
                      <Badge variant="secondary" className="bg-yellow-900/30 text-yellow-400 self-start sm:self-auto">{member.VO2max}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-green-950/20 rounded-lg border border-green-800 hover:bg-green-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm font-medium">Endurance</span>
                      </div>
                      <Badge variant="secondary" className="bg-green-900/30 text-green-400 self-start sm:self-auto">{member.EnduranceScore}/100</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-800 hover:bg-purple-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm font-medium">Flexibility</span>
                      </div>
                      <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 self-start sm:self-auto">{member.FlexibilityScore}/100</Badge>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-950/20 rounded-lg border border-orange-800 hover:bg-orange-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium">Workouts</span>
                      </div>
                      <Badge variant="secondary" className="bg-orange-900/30 text-orange-400 self-start sm:self-auto">{member.WeeklyWorkouts}/week</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {member.Nutrition_Plan && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Utensils className="h-5 w-5 mr-2 text-primary" />
                  Daily Nutrition
                </CardTitle>
                <CardDescription>Your macro and calorie targets</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-orange-950/20 to-orange-900/20 rounded-lg border border-orange-800 hover:from-orange-900/30 hover:to-orange-800/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <Flame className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span className="font-medium text-orange-100">Calories</span>
                      </div>
                      <Badge className="bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200 self-start sm:self-auto">
                        {member.Nutrition_Plan.summary.total_calories}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                      <div className="text-xs text-muted-foreground mb-1">Protein</div>
                      <div className="font-semibold text-sm">{member.Nutrition_Plan.summary.macro_targets_g.protein}g</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                      <div className="text-xs text-muted-foreground mb-1">Carbs</div>
                      <div className="font-semibold text-sm">{member.Nutrition_Plan.summary.macro_targets_g.carbs}g</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                      <div className="text-xs text-muted-foreground mb-1">Fat</div>
                      <div className="font-semibold text-sm">{member.Nutrition_Plan.summary.macro_targets_g.fat}g</div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-800 hover:bg-blue-900/30 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500 flex-shrink-0" />
                        <span className="font-medium text-blue-100">Hydration</span>
                      </div>
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 self-start sm:self-auto">
                        {(member.Nutrition_Plan.summary.hydration_ml / 1000).toFixed(1)}L
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {member.Biometrics_Plan && (
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Training Guidelines
                </CardTitle>
                <CardDescription>Essential training principles</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-900 dark:text-green-100">Warm-up</span>
                    </div>
                    <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                      {member.Biometrics_Plan.training_guidelines.warmup}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Cool-down</span>
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                      {member.Biometrics_Plan.training_guidelines.cooldown}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors duration-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">Injury Prevention</span>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      {member.Biometrics_Plan.training_guidelines.injury_prevention}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Program Details */}
        <Card className="mb-8 hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Program Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4 text-base">{member.Details}</p>
            {member.Biometrics_Plan?.personal_note && (
              <>
                <Separator className="my-4" />
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 hover:bg-primary/10 transition-colors duration-200">
                  <h4 className="flex items-center text-sm font-semibold text-primary mb-2">
                    <User className="h-4 w-4 mr-2" />
                    Personal Note
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.Biometrics_Plan.personal_note}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {member.Biometrics_Plan?.weekly_workout_plan && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Dumbbell className="h-6 w-6 mr-3 text-primary" />
                Weekly Workout Plan
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {member.Biometrics_Plan.weekly_workout_plan.length} Days
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {member.Biometrics_Plan.weekly_workout_plan.map((day) => (
                <Card key={day.day} className="hover:shadow-md transition-shadow duration-200" role="article" aria-label={`Workout plan for ${day.day}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">{day.day}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {day.sessions.length} {day.sessions.length === 1 ? 'Session' : 'Sessions'}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{day.focus}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {day.sessions.map((session, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg border-l-2 border-primary/30 hover:bg-muted/70 hover:border-l-4 transition-colors duration-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{session.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {session.intensity}
                            </Badge>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <Clock className="h-3 w-3 mr-1" />
                            {session.duration_min} minutes
                          </div>
                          {session.notes && (
                            <p className="text-xs text-muted-foreground italic leading-relaxed">
                              {session.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {member.Nutrition_Plan?.daily_meal_schedule && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center">
                <Utensils className="h-6 w-6 mr-3 text-primary" />
                Daily Meal Plan
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {member.Nutrition_Plan.daily_meal_schedule.length} Meals
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {member.Nutrition_Plan.daily_meal_schedule.map((meal, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow duration-200" role="article" aria-label={`Meal plan for ${meal.meal_type} at ${meal.time}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-semibold">{meal.meal_type}</CardTitle>
                      <Badge variant="secondary" className="text-xs">{meal.time}</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      {meal.calories} calories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        {meal.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 mr-2 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-red-50 dark:bg-red-950/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200">
                          <div className="font-semibold text-red-700 dark:text-red-300">P</div>
                          <div className="text-red-600 dark:text-red-400">{meal.macros.protein_g}g</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
                          <div className="font-semibold text-blue-700 dark:text-blue-300">C</div>
                          <div className="text-blue-600 dark:text-blue-400">{meal.macros.carbs_g}g</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors duration-200">
                          <div className="font-semibold text-yellow-700 dark:text-yellow-300">F</div>
                          <div className="text-yellow-600 dark:text-yellow-400">{meal.macros.fat_g}g</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(member.Nutrition_Plan.personal_note || member.Nutrition_Plan.summary.supplements_note) && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Utensils className="h-5 w-5 mr-2 text-primary" />
                    Nutrition Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {member.Nutrition_Plan.personal_note && (
                    <p className="text-muted-foreground leading-relaxed mb-4">{member.Nutrition_Plan.personal_note}</p>
                  )}
                  {member.Nutrition_Plan.summary.supplements_note && (
                    <>
                      <Separator className="my-4" />
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <h5 className="flex items-center text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                          <div className="h-4 w-4 rounded-full bg-amber-500 mr-2" />
                          Supplements
                        </h5>
                        <p className="text-sm text-amber-800 dark:text-amber-200">{member.Nutrition_Plan.summary.supplements_note}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Progress Tracking */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-primary" />
              Progress Tracking
            </h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
              Active Plan
            </Badge>
          </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Weekly Check-ins
                </CardTitle>
                <CardDescription>Track your progress milestones</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">1</span>
                      </div>
                      <span className="font-medium">Week 1</span>
                    </div>
                    <Badge className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200">
                      Baseline Measurements
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm font-semibold">2</span>
                      </div>
                      <span className="font-medium text-muted-foreground">Week 2</span>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm font-semibold">3</span>
                      </div>
                      <span className="font-medium text-muted-foreground">Week 3</span>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Key Metrics to Track
                </CardTitle>
                <CardDescription>Monitor these important indicators</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mr-3" />
                    <span className="text-sm font-medium mr-auto">Body weight</span>
                    <Badge variant="outline" className="text-xs">Weekly</Badge>
                  </div>
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-3" />
                    <span className="text-sm font-medium mr-auto">Body fat percentage</span>
                    <Badge variant="outline" className="text-xs">Bi-weekly</Badge>
                  </div>
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                    <div className="h-2 w-2 bg-purple-500 rounded-full mr-3" />
                    <span className="text-sm font-medium mr-auto">Workout performance</span>
                    <Badge variant="outline" className="text-xs">Per session</Badge>
                  </div>
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mr-3" />
                    <span className="text-sm font-medium mr-auto">Energy levels</span>
                    <Badge variant="outline" className="text-xs">Daily</Badge>
                  </div>
                  <div className="flex items-center p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-200">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full mr-3" />
                    <span className="text-sm font-medium mr-auto">Sleep quality</span>
                    <Badge variant="outline" className="text-xs">Daily</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 hover:from-primary/10 hover:to-primary/15 transition-colors duration-200">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-foreground mb-3">Ready to Start Your Journey?</h3>
              <p className="text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">Take the next step with your personalized wellness plan and begin your transformation today</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-md hover:shadow-lg"
                aria-label="Schedule a training session"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
              <Button
                onClick={generatePDF}
                variant="outline"
                className="bg-background hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:shadow-md"
                aria-label="Download plan as PDF document"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Plan PDF
              </Button>
              <Button
                variant="outline"
                className="bg-background hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm hover:shadow-md"
                aria-label="Contact your personal trainer"
              >
                <User className="h-4 w-4 mr-2" />
                Contact Trainer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
