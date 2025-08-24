"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Users, Search, Filter, Download, BarChart3, User, Zap, Target, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Member {
  MemberID: string | number
  BMI: number
  BodyFat_Percent: number
  VO2max: number
  EnduranceScore: number
  FlexibilityScore: number
  WeeklyWorkouts: number
}

interface MemberWithProgram extends Member {
  Predicted_Cluster: number
  Program_Type: string
  Details: string
}

interface MemberWithPlans extends MemberWithProgram {
  Biometrics_Plan?: {
    workout_plan: any
    exercise_details: any
  }
  Nutrition_Plan?: {
    meal_plan: any
    nutrition_guidelines: any
  }
}

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null)
  const [members, setMembers] = useState<MemberWithProgram[]>([])
  const [detailedMembers, setDetailedMembers] = useState<MemberWithPlans[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingPlans, setGeneratingPlans] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)
  const [selectedProgramType, setSelectedProgramType] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const processResponse = await fetch("/api/process", {
        method: "POST",
        body: formData,
      })

      if (!processResponse.ok) {
        let errorMessage = "Upload failed"
        const contentType = processResponse.headers.get("content-type")

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await processResponse.json()
            errorMessage = errorData.error || errorMessage
          } catch (jsonError) {
            console.error("Failed to parse error response as JSON:", jsonError)
            errorMessage = `HTTP ${processResponse.status}: ${processResponse.statusText}`
          }
        } else {
          try {
            const errorText = await processResponse.text()
            errorMessage = errorText || `HTTP ${processResponse.status}: ${processResponse.statusText}`
          } catch (textError) {
            console.error("Failed to read error response as text:", textError)
            errorMessage = `HTTP ${processResponse.status}: ${processResponse.statusText}`
          }
        }

        throw new Error(errorMessage)
      }

      let basicMemberData
      const contentType = processResponse.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        try {
          basicMemberData = await processResponse.json()
        } catch (jsonError) {
          console.error("Failed to parse success response as JSON:", jsonError)
          throw new Error("Invalid response format from server")
        }
      } else {
        throw new Error("Server returned non-JSON response")
      }

      const processedMembers = basicMemberData.members || basicMemberData

      if (!Array.isArray(processedMembers)) {
        throw new Error("Invalid response format: expected array of members")
      }

      setMembers(processedMembers)

      setGeneratingPlans(true)
      console.log(`🚀 Starting plan generation for ${processedMembers.length} members...`)
      const generateStartTime = performance.now()

      const generateResponse = await fetch("/api/generate-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ members: processedMembers }),
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => {})

        if (generateResponse.status === 408) {
          console.warn("⏰ AI plan generation timed out - this can happen with large datasets")
          alert(
            "AI plan generation is taking longer than expected. Using basic program assignments for now. You can try again with fewer members.",
          )
        } else {
          console.warn(
            `❌ Failed to generate detailed plans (${generateResponse.status}):`,
            errorData.error || "Unknown error",
          )
        }

        console.log("📋 Using basic program data only")
        setDetailedMembers(processedMembers)
        localStorage.setItem("memberPlans", JSON.stringify(processedMembers))
      } else {
        const detailedData = await generateResponse.json()
        const detailedPlans = detailedData.data || detailedData.members || detailedData

        if (Array.isArray(detailedPlans)) {
          const generateEndTime = performance.now()
          const totalTime = (generateEndTime - generateStartTime) / 1000
          console.log(`✅ Generated ${detailedPlans.length} detailed AI plans in ${totalTime.toFixed(2)}s`)
          console.log(`⚡ Average: ${(totalTime / detailedPlans.length).toFixed(2)}s per member`)

          setDetailedMembers(detailedPlans)
          localStorage.setItem("memberPlans", JSON.stringify(detailedPlans))
          console.log(`💾 Stored ${detailedPlans.length} AI-generated plans in localStorage`)
        } else {
          console.warn("Invalid detailed plans format, using basic data")
          setDetailedMembers(processedMembers)
          localStorage.setItem("memberPlans", JSON.stringify(processedMembers))
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      alert(error instanceof Error ? error.message : "Failed to upload file. Please try again.")
    } finally {
      setLoading(false)
      setGeneratingPlans(false)
    }
  }

  const handleExport = () => {
    const csvContent = [
      [
        "MemberID",
        "BMI",
        "BodyFat%",
        "VO2max",
        "EnduranceScore",
        "FlexibilityScore",
        "WeeklyWorkouts",
        "Cluster",
        "ProgramType",
        "Details",
      ],
      ...detailedMembers.map((m) => [
        m.MemberID,
        m.BMI,
        m.BodyFat_Percent,
        m.VO2max,
        m.EnduranceScore,
        m.FlexibilityScore,
        m.WeeklyWorkouts,
        m.Predicted_Cluster,
        m.Program_Type,
        m.Details,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "member-programs.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Use detailed members for display if available, otherwise use basic members
  const displayMembers = detailedMembers.length > 0 ? detailedMembers : members

  const filteredMembers = useMemo(() => {
    return displayMembers.filter((member) => {
      const matchesSearch =
        member.MemberID.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.Program_Type.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCluster = selectedCluster === null || member.Predicted_Cluster === selectedCluster
      const matchesProgram = selectedProgramType === null || member.Program_Type === selectedProgramType

      return matchesSearch && matchesCluster && matchesProgram
    })
  }, [displayMembers, searchTerm, selectedCluster, selectedProgramType])

  const stats = useMemo(() => {
    if (displayMembers.length === 0) return null

    try {
      // Filter out invalid members and ensure all required properties exist
      const validMembers = displayMembers.filter(member =>
        member &&
        typeof member.BMI === 'number' &&
        typeof member.VO2max === 'number' &&
        typeof member.Program_Type === 'string' &&
        typeof member.Predicted_Cluster === 'number'
      )

      if (validMembers.length === 0) return null

      const avgBMI = validMembers.reduce((sum, m) => sum + m.BMI, 0) / validMembers.length
      const avgVO2 = validMembers.reduce((sum, m) => sum + m.VO2max, 0) / validMembers.length
      const programTypes = [...new Set(validMembers.map((m) => m.Program_Type))]
      const clusters = [...new Set(validMembers.map((m) => m.Predicted_Cluster))]

      return {
        totalMembers: validMembers.length,
        avgBMI: isNaN(avgBMI) ? '0.0' : avgBMI.toFixed(1),
        avgVO2: isNaN(avgVO2) ? '0.0' : avgVO2.toFixed(1),
        programTypes: programTypes.filter(type => type && type.trim() !== ''),
        clusters: clusters.filter(cluster => typeof cluster === 'number' && !isNaN(cluster)).sort((a, b) => a - b),
      }
    } catch (error) {
      console.error('Error calculating stats:', error)
      return null
    }
  }, [displayMembers])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        {displayMembers.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="instrument-serif text-4xl font-bold text-foreground mb-4">Upload Member Data</h1>
              <p className="jetbrains-mono text-muted-foreground text-sm">
                Upload a CSV file with member fitness data to generate personalized workout programs
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed p-8 sm:p-12 text-center transition-all-smooth rounded-xl shadow-sm hover:shadow-md ${
                dragActive
                  ? "border-primary bg-primary/10 shadow-lg scale-[1.02]"
                  : file
                    ? "border-green-400 bg-green-950/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/20"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              role="region"
              aria-label="File upload area"
              tabIndex={0}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl opacity-50" />

              <div className="relative z-10">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 rounded-full flex items-center justify-center transition-all-smooth ${
                  file
                    ? "bg-green-900/30 text-green-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {loading || generatingPlans ? (
                    <div className="animate-spin w-8 h-8 sm:w-10 sm:h-10 border-2 border-current border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                  {file ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-green-600">✓</span>
                      {file.name}
                    </span>
                  ) : (
                    "Drop your CSV file here"
                  )}
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md mx-auto">
                  {loading
                    ? "Processing CSV and generating programs..."
                    : generatingPlans
                      ? "Generating AI-powered personalized plans... (this may take up to 5 minutes)"
                      : file
                        ? `File size: ${(file.size / 1024).toFixed(1)} KB • Ready to upload`
                        : "or click to browse files • Supports CSV format only"}
                </p>

                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  aria-describedby="file-requirements"
                />

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-transparent hover:bg-muted/70 hover:scale-105 hover:shadow-md transition-all-smooth cursor-pointer min-w-[140px] transform"
                      disabled={loading || generatingPlans}
                      asChild
                    >
                      <span>
                        <FileText className="h-4 w-4 mr-2" />
                        Choose File
                      </span>
                    </Button>
                  </label>

                  {file && (
                    <Button
                      onClick={handleUpload}
                      disabled={loading || generatingPlans}
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-105 transition-all-smooth min-w-[140px] shadow-lg hover:shadow-2xl transform"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full mr-2" />
                          Processing...
                        </>
                      ) : generatingPlans ? (
                        <>
                          <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Programs
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Progress indicator */}
                {(loading || generatingPlans) && (
                  <div className="mt-6">
                    <div className="w-full max-w-xs mx-auto bg-muted rounded-full h-2 mb-2">
                      <div className="bg-primary h-2 rounded-full animate-pulse transition-all duration-300" style={{width: generatingPlans ? '75%' : '45%'}} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {loading && "Step 1/2: Processing member data..."}
                      {generatingPlans && "Step 2/2: AI is creating personalized workout and nutrition plans..."}
                    </p>
                  </div>
                )}

                {/* File requirements */}
                <p id="file-requirements" className="text-xs text-muted-foreground mt-4">
                  CSV should include: MemberID, BMI, BodyFat_Percent, VO2max, EnduranceScore, FlexibilityScore, WeeklyWorkouts
                </p>
              </div>
            </div>

            {/* CSV Format Info */}
            <div className="mt-12 border border-border p-6 bg-card rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Required CSV Format
              </h3>
              <div className="text-sm text-muted-foreground space-y-3">
                <p>Your CSV file should include these columns:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center p-2 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">MemberID</span>
                    <span className="text-xs text-muted-foreground ml-auto">Required</span>
                  </div>
                  <div className="flex items-center p-2 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">BMI</span>
                    <span className="text-xs text-muted-foreground ml-auto">Number</span>
                  </div>
                  <div className="flex items-center p-2 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">BodyFat_Percent</span>
                    <span className="text-xs text-muted-foreground ml-auto">0-100</span>
                  </div>
                  <div className="flex items-center p-2 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">VO2max</span>
                    <span className="text-xs text-muted-foreground ml-auto">Number</span>
                  </div>
                  <div className="flex items-center p-2 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">EnduranceScore</span>
                    <span className="text-xs text-muted-foreground ml-auto">0-100</span>
                  </div>
                  <div className="flex items-center p-2 bg-muted/50 rounded-md">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">FlexibilityScore</span>
                    <span className="text-xs text-muted-foreground ml-auto">0-100</span>
                  </div>
                  <div className="flex items-center p-2 bg-muted/50 rounded-md sm:col-span-2">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0" />
                    <span className="font-mono text-xs">WeeklyWorkouts</span>
                    <span className="text-xs text-muted-foreground ml-auto">Integer ≥ 0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="border border-border p-4 sm:p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="jetbrains-mono text-muted-foreground text-xs font-medium tracking-tight">Total Members</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.totalMembers}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="border border-border p-4 sm:p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="jetbrains-mono text-muted-foreground text-xs font-medium tracking-tight">Avg BMI</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.avgBMI}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </div>
                <div className="border border-border p-4 sm:p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="jetbrains-mono text-muted-foreground text-xs font-medium tracking-tight">Avg VO2 Max</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.avgVO2}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="border border-border p-4 sm:p-6 bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="jetbrains-mono text-muted-foreground text-xs font-medium tracking-tight">Program Types</p>
                      <p className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{stats.programTypes.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <Filter className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="instrument-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">Member Programs</h1>
                <div className="text-muted-foreground flex items-center flex-wrap gap-2">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="jetbrains-mono text-sm">
                      {filteredMembers.length} of {displayMembers.length} members shown
                    </span>
                  </div>
                  {detailedMembers.length > 0 && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-2 text-green-500" />
                      <span className="jetbrains-mono text-sm text-green-600 dark:text-green-400 font-medium">AI plans generated</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 bg-card border border-border text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none rounded-lg transition-colors"
                  />
                </div>

                <select
                  value={selectedCluster || ""}
                  onChange={(e) => setSelectedCluster(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 bg-card border border-border text-foreground focus:border-primary focus:outline-none rounded-lg transition-colors"
                  disabled={!stats || !stats.clusters || stats.clusters.length === 0}
                >
                  <option value="">All Clusters</option>
                  {stats?.clusters?.map((cluster) => (
                    <option key={`cluster-${cluster}`} value={cluster}>
                      Cluster {cluster}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProgramType || ""}
                  onChange={(e) => setSelectedProgramType(e.target.value || null)}
                  className="px-4 py-2 bg-card border border-border text-foreground focus:border-primary focus:outline-none rounded-lg transition-colors"
                  disabled={!stats || !stats.programTypes || stats.programTypes.length === 0}
                >
                  <option value="">All Programs</option>
                  {stats?.programTypes?.map((type) => (
                    <option key={`program-${type}`} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="bg-transparent hover:bg-muted/70 hover:scale-105 hover:shadow-md transition-all-smooth transform"
                  disabled={displayMembers.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>

                <Button
                  onClick={() => {
                    setMembers([])
                    setDetailedMembers([])
                    setFile(null)
                    setSearchTerm("")
                    setSelectedCluster(null)
                    setSelectedProgramType(null)
                    localStorage.removeItem("memberPlans")
                  }}
                  variant="outline"
                  className="bg-transparent hover:bg-muted/70 hover:scale-105 hover:shadow-md transition-all-smooth transform"
                >
                  <span className="hidden sm:inline">Upload New File</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredMembers.map((member) => (
                <article key={member.MemberID} className="bg-card border border-border p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-md transition-all-smooth hover:border-primary/20 group" role="article" aria-label={`Member ${member.MemberID} information`}>
                  <header className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">Member {member.MemberID}</h3>
                      <div className="flex items-center gap-2">
                        <span className="jetbrains-mono text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
                          Cluster {member.Predicted_Cluster}
                        </span>
                        {detailedMembers.length > 0 && (
                          <span className="jetbrains-mono text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                            AI Plan
                          </span>
                        )}
                      </div>
                    </div>
                  </header>

                  <div className="mb-4 p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg border border-primary/30">
                    <div className="mb-3">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-primary" />
                        {member.Program_Type}
                      </h4>
                      <p className="jetbrains-mono text-muted-foreground text-xs leading-relaxed">{member.Details}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between p-2 bg-background/20 rounded-md">
                        <span className="jetbrains-mono text-muted-foreground text-xs font-medium">BMI:</span>
                        <span className="text-foreground font-semibold">{member.BMI}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/20 rounded-md">
                        <span className="jetbrains-mono text-muted-foreground text-xs font-medium">Body Fat:</span>
                        <span className="text-foreground font-semibold">{member.BodyFat_Percent}%</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/20 rounded-md">
                        <span className="jetbrains-mono text-muted-foreground text-xs font-medium">VO2 Max:</span>
                        <span className="text-foreground font-semibold">{member.VO2max}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/20 rounded-md">
                        <span className="jetbrains-mono text-muted-foreground text-xs font-medium">Workouts:</span>
                        <span className="text-foreground font-semibold">{member.WeeklyWorkouts}/week</span>
                      </div>
                    </div>
                  </div>

                  <footer className="pt-4 border-t border-border">
                    <Link href={generatingPlans ? "#" : `/plan/${member.MemberID}`} className="w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={generatingPlans}
                        className={`w-full bg-transparent transition-all-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:bg-primary group-hover:text-primary-foreground hover:scale-105 transform ${
                          generatingPlans ? "opacity-50 cursor-not-allowed" : "hover:bg-primary hover:text-primary-foreground hover:shadow-md"
                        }`}
                        aria-label={generatingPlans ? "Generating plan..." : `View detailed plan for Member ${member.MemberID}`}
                      >
                        {generatingPlans ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-2" aria-hidden="true"></div>
                            Generating Plan...
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-2" />
                            View Detailed Plan
                          </>
                        )}
                      </Button>
                    </Link>
                  </footer>
                </article>
              ))}
            </div>

            {filteredMembers.length === 0 && displayMembers.length > 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No matching members</h3>
                <p className="jetbrains-mono text-muted-foreground mb-6 text-sm">No members match your current filters. Try adjusting your search criteria.</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCluster(null)
                    setSelectedProgramType(null)
                  }}
                  variant="outline"
                  className="bg-transparent hover:bg-muted/70 hover:scale-105 hover:shadow-md transition-all-smooth transform"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

