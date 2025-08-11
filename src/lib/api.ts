export type Member = {
  MemberID: string | number
  BMI: number
  BodyFat_Percent: number
  VO2max: number
  EnduranceScore: number
  FlexibilityScore: number
  StrengthScore: number
  WeeklyWorkouts: number
}

export type MemberWithProgram = Member & {
  Predicted_Cluster: number
  Program_Type: string
  Details: string
}

export type MemberWithPlans = MemberWithProgram & {
  Biometrics_Plan?: Record<string, any> | null
  Nutrition_Plan?: Record<string, any> | null
}

const STORAGE_KEY = 'apiBase'

export function getDefaultApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || 'https://sebbys15-demo-ai-recommendations.hf.space'
}

export function getApiBase() {
  if (typeof window === 'undefined') return getDefaultApiBase()
  return localStorage.getItem(STORAGE_KEY) || getDefaultApiBase()
}

export function setApiBase(url: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, url)
}

export async function assignProgramsJson(members: Member[]): Promise<MemberWithProgram[]> {
  const res = await fetch(`${getApiBase()}/assign-programs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ members }),
  })
  if (!res.ok) throw new Error(`assign-programs failed: ${res.status}`)
  return res.json()
}

export async function assignProgramsCsv(file: File): Promise<MemberWithProgram[]> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${getApiBase()}/assign-programs/csv`, { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`assign-programs/csv failed: ${res.status}`)
  return res.json()
}

export async function generatePlans(members: MemberWithProgram[]): Promise<MemberWithPlans[]> {
  const res = await fetch(`${getApiBase()}/generate-plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ members }),
  })
  if (!res.ok) throw new Error(`generate-plans failed: ${res.status}`)
  return res.json()
}

export async function processMembers(members: Member[], generatePlansFlag = false): Promise<{ members: MemberWithProgram[] | MemberWithPlans[] }> {
  const url = new URL(`${getApiBase()}/process`)
  if (generatePlansFlag) url.searchParams.set('generatePlans', 'true')
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ members }),
  })
  if (!res.ok) throw new Error(`process failed: ${res.status}`)
  return res.json()
}
