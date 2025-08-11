import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Wand2,
  Activity,
  ArrowUpRight,
} from 'lucide-react'

type DashboardStatsProps = {
  assignedCount: number
  plansCount: number
  hasPlans: boolean
  loading: boolean
}

export function DashboardStats({ assignedCount, plansCount, hasPlans, loading }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-md flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{assignedCount}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <ArrowUpRight className="h-3 w-3 text-green-500" />
            from latest upload
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-600"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Generated Plans</CardTitle>
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-md flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-3xl font-bold text-foreground">
            {plansCount}
            {hasPlans && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Activity className="h-3 w-3 text-emerald-500" />
            personalized programs
          </div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-md flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {assignedCount > 0 ? Math.round((plansCount / assignedCount) * 100) : 0}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">completion rate</div>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className={`absolute top-0 left-0 w-full h-1 ${loading ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-green-500 to-green-600'}`}></div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
          <div className={`w-8 h-8 ${loading ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-green-100 dark:bg-green-900/20'} rounded-md flex items-center justify-center`}>
            {loading ? (
              <Wand2 className="h-4 w-4 text-purple-600 animate-pulse" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-semibold text-foreground">
            {loading ? 'Processing' : 'Ready'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {loading ? 'AI analysis in progress' : 'System operational'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-gradient-to-r from-background to-muted/20 px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-md flex items-center justify-center">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage member fitness programs</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-normal">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Badge>
      </div>
    </header>
  )
}
