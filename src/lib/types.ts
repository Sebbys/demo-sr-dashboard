export interface Member {
  MemberID: string | number
  BMI: number
  BodyFat_Percent: number
  VO2max: number
  EnduranceScore: number // 0-100
  FlexibilityScore: number // 0-100
  WeeklyWorkouts: number // >= 0
}

export interface MemberWithProgram extends Member {
  Predicted_Cluster: number
  Program_Type: string
  Details: string
}

export interface WorkoutSession {
  type: string
  duration_min: number
  intensity: string
  notes: string
}

export interface DailyWorkout {
  day: string
  focus: string
  sessions: WorkoutSession[]
}

export interface BiometricsPlan {
  weekly_workout_plan: DailyWorkout[]
  training_guidelines: {
    warmup: string
    cooldown: string
    injury_prevention: string
  }
  personal_note: string
}

export interface MealItem {
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

export interface NutritionPlan {
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

export interface MemberWithPlans extends MemberWithProgram {
  Biometrics_Plan?: BiometricsPlan
  Nutrition_Plan?: NutritionPlan
}
