'use client'

import { useState, useMemo } from 'react'
import { MemberWithPlans, MemberWithProgram } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MemberReportDownload } from '@/components/MemberReport'
import { UploadForm, GeneratePlansButton } from '@/components/ClientComponents'
import { DashboardStats } from '@/components/ServerComponents'
import {
  ListChecks,
  Upload,
  FileSpreadsheet,
  Download,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DashboardClient() {
  const [rows, setRows] = useState<(MemberWithProgram | MemberWithPlans)[]>([])
  const [loading, setLoading] = useState(false)

  const hasPlans = useMemo(() => rows.some(r => 'Biometrics_Plan' in r || 'Nutrition_Plan' in r), [rows])
  const assignedCount = rows.length
  const plansCount = rows.filter(r => 'Biometrics_Plan' in r || 'Nutrition_Plan' in r).length

  const handleDataUpdate = (data: (MemberWithProgram | MemberWithPlans)[]) => {
    setRows(data)
  }

  const handleClear = () => {
    setRows([])
  }

  const handleDownloadSample = () => {
    const link = document.createElement('a')
    link.href = '/example_data.csv'
    link.download = 'example_data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-background via-background to-muted/10 min-h-screen">
      {/* Dashboard KPIs */}
      <section id="dashboard" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <p className="text-muted-foreground">Monitor your member management activities</p>
          </div>
        </div>
        
        <DashboardStats
          assignedCount={assignedCount}
          plansCount={plansCount}
          hasPlans={hasPlans}
          loading={loading}
        />
      </section>

      {/* Upload Section */}
      <section id="upload" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Management</h2>
          <p className="text-muted-foreground">Upload member data and generate personalized fitness programs</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
              <CardTitle className="flex mt-4 items-center gap-3 text-xl">
                <div className="w-10 h-10  bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                Upload & Process Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <UploadForm 
                onDataUpdate={handleDataUpdate}
                loading={loading}
                setLoading={setLoading}
              />
              
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="default" onClick={handleClear} disabled={loading}>
                  Clear All
                </Button>
                
                {!hasPlans && assignedCount > 0 && (
                  <GeneratePlansButton
                    members={rows as MemberWithProgram[]}
                    onDataUpdate={handleDataUpdate}
                    loading={loading}
                    setLoading={setLoading}
                  />
                )}
              </div>
              
              {loading && (
                <div className="space-y-2">
                  <Progress value={45} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">Processing member data and generating personalized programs...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-b">
              <CardTitle className="text-lg mt-4">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">
                    {assignedCount > 0 ? `${plansCount}/${assignedCount}` : '0/0'}
                  </span>
                </div>
                <Progress 
                  value={assignedCount > 0 ? (plansCount / assignedCount) * 100 : 0} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex justify-between text-sm ">
                  <span className="text-muted-foreground">Members Uploaded</span>
                  <span className="font-medium">{assignedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plans Generated</span>
                  <span className="font-medium text-green-600">{plansCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate</span>
                  <span className="font-medium">
                    {assignedCount > 0 ? Math.round((plansCount / assignedCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Member Results</h2>
          <p className="text-muted-foreground">View and download personalized fitness programs for each member</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b">
            <CardTitle className="flex items-center gap-3 text-xl mt-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <ListChecks className="h-5 w-5 text-white" />
              </div>
              Member Programs & Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
                <p className="text-muted-foreground mb-4">Upload a CSV file to get started with member management</p>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadSample}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Sample Data
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">MEMBER ID</th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">PROGRAM TYPE</th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">PROGRAM DETAILS</th>
                        <th className="text-left p-4 font-semibold text-sm text-muted-foreground">STATUS</th>
                        <th className="text-right p-4 font-semibold text-sm text-muted-foreground">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/10 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                                  {String(r.MemberID).slice(-2)}
                                </span>
                              </div>
                              <span className="font-medium text-foreground">{String(r.MemberID)}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            {'Program_Type' in r ? (
                              <Badge variant="secondary" className="font-normal">
                                {r.Program_Type}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 max-w-md">
                            {'Details' in r ? (
                              <p className="text-sm text-muted-foreground line-clamp-2" title={r.Details}>
                                {r.Details}
                              </p>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            {'Biometrics_Plan' in r || 'Nutrition_Plan' in r ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                  Plans Generated
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                  Pending
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            {'Biometrics_Plan' in r || 'Nutrition_Plan' in r ? (
                              <MemberReportDownload member={r as MemberWithPlans} />
                            ) : (
                              <GeneratePlansButton
                                members={[r as MemberWithProgram]}
                                onDataUpdate={handleDataUpdate}
                                loading={loading}
                                setLoading={setLoading}
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {rows.length > 0 && (
                  <div className="p-4 border-t bg-muted/10">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Showing {rows.length} member{rows.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {plansCount} plans generated
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                          {assignedCount - plansCount} pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
