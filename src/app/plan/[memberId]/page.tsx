"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Target, Activity, Utensils, TrendingUp, Dumbbell, Download } from "lucide-react"
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading personalized plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-gray-200">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Member not found</p>
          <Link href="/dashboard">
            <Button className="bg-white text-black hover:bg-gray-200">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-800" />
              <span className="text-2xl font-bold text-white">Member {member.MemberID}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Personalized Wellness Plan</h1>
          <div className="flex items-center space-x-4 text-gray-400">
            <span className="bg-gray-800 px-3 py-1 text-sm">Cluster {member.Predicted_Cluster}</span>
            <span className="bg-gray-800 px-3 py-1 text-sm">{member.Program_Type}</span>
          </div>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Current Metrics */}
          <div className="border border-gray-800 p-6 bg-gray-900/20">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Current Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">BMI</span>
                <span className="text-white">{member.BMI}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Body Fat</span>
                <span className="text-white">{member.BodyFat_Percent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VO2 Max</span>
                <span className="text-white">{member.VO2max}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Endurance Score</span>
                <span className="text-white">{member.EnduranceScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Flexibility Score</span>
                <span className="text-white">{member.FlexibilityScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Weekly Workouts</span>
                <span className="text-white">{member.WeeklyWorkouts}</span>
              </div>
            </div>
          </div>

          {member.Nutrition_Plan && (
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Utensils className="h-5 w-5 mr-2" />
                Daily Nutrition
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Calories</span>
                  <span className="text-white">{member.Nutrition_Plan.summary.total_calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Protein</span>
                  <span className="text-white">{member.Nutrition_Plan.summary.macro_targets_g.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Carbs</span>
                  <span className="text-white">{member.Nutrition_Plan.summary.macro_targets_g.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fat</span>
                  <span className="text-white">{member.Nutrition_Plan.summary.macro_targets_g.fat}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Water</span>
                  <span className="text-white">{(member.Nutrition_Plan.summary.hydration_ml / 1000).toFixed(1)}L</span>
                </div>
              </div>
            </div>
          )}

          {member.Biometrics_Plan && (
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Training Guidelines
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400 block mb-1">Warm-up:</span>
                  <span className="text-white">{member.Biometrics_Plan.training_guidelines.warmup}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Cool-down:</span>
                  <span className="text-white">{member.Biometrics_Plan.training_guidelines.cooldown}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Injury Prevention:</span>
                  <span className="text-white">{member.Biometrics_Plan.training_guidelines.injury_prevention}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Program Details */}
        <div className="mb-12">
          <div className="border border-gray-800 p-6 bg-gray-900/20">
            <h3 className="text-xl font-semibold text-white mb-4">Program Overview</h3>
            <p className="text-gray-400 mb-4">{member.Details}</p>
            {member.Biometrics_Plan?.personal_note && (
              <div className="border-t border-gray-800 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-white mb-2">Personal Note:</h4>
                <p className="text-gray-400 text-sm">{member.Biometrics_Plan.personal_note}</p>
              </div>
            )}
          </div>
        </div>

        {member.Biometrics_Plan?.weekly_workout_plan && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Dumbbell className="h-8 w-8 mr-3" />
              Weekly Workout Plan
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {member.Biometrics_Plan.weekly_workout_plan.map((day) => (
                <div key={day.day} className="border border-gray-800 p-6 bg-gray-900/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{day.day}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{day.focus}</p>
                  <div className="space-y-3">
                    {day.sessions.map((session, index) => (
                      <div key={index} className="border-l-2 border-gray-800 pl-3">
                        <div className="font-medium text-white text-sm">{session.type}</div>
                        <div className="text-gray-400 text-xs">
                          {session.duration_min} min • {session.intensity}
                        </div>
                        {session.notes && <div className="text-gray-500 text-xs mt-1">{session.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {member.Nutrition_Plan?.daily_meal_schedule && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Utensils className="h-8 w-8 mr-3" />
              Daily Meal Plan
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {member.Nutrition_Plan.daily_meal_schedule.map((meal, index) => (
                <div key={index} className="border border-gray-800 p-6 bg-gray-900/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">{meal.meal_type}</h3>
                    <span className="text-gray-400 text-sm">{meal.time}</span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {meal.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="text-gray-400 text-sm">
                        • {item}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-800 pt-3 text-xs">
                    <div className="flex justify-between text-gray-400">
                      <span>Calories: {meal.calories}</span>
                      <span>
                        P: {meal.macros.protein_g}g | C: {meal.macros.carbs_g}g | F: {meal.macros.fat_g}g
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {member.Nutrition_Plan.personal_note && (
              <div className="mt-6 border border-gray-800 p-6 bg-gray-900/20">
                <h4 className="text-lg font-semibold text-white mb-2">Nutrition Notes:</h4>
                <p className="text-gray-400">{member.Nutrition_Plan.personal_note}</p>
                {member.Nutrition_Plan.summary.supplements_note && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <h5 className="text-sm font-semibold text-white mb-2">Supplements:</h5>
                    <p className="text-gray-400 text-sm">{member.Nutrition_Plan.summary.supplements_note}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Progress Tracking */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
            <TrendingUp className="h-8 w-8 mr-3" />
            Progress Tracking
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Check-ins</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-800">
                  <span className="text-gray-400">Week 1</span>
                  <span className="text-white">Baseline Measurements</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-800">
                  <span className="text-gray-400">Week 2</span>
                  <span className="text-gray-500">Pending</span>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-800">
                  <span className="text-gray-400">Week 3</span>
                  <span className="text-gray-500">Pending</span>
                </div>
              </div>
            </div>
            <div className="border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-lg font-semibold text-white mb-4">Key Metrics to Track</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-white mr-3"></div>
                  Body weight (weekly)
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-white mr-3"></div>
                  Body fat percentage (bi-weekly)
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-white mr-3"></div>
                  Workout performance
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-white mr-3"></div>
                  Energy levels (daily)
                </div>
                <div className="flex items-center text-gray-400">
                  <div className="w-2 h-2 bg-white mr-3"></div>
                  Sleep quality (daily)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="bg-white text-black hover:bg-gray-200">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Session
          </Button>
          <Button
            onClick={generatePDF}
            variant="outline"
            className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Plan PDF
          </Button>
          <Button
            variant="outline"
            className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
          >
            Contact Trainer
          </Button>
        </div>
      </div>
    </div>
  )
}
