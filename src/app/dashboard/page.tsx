"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Users, ArrowLeft, Search, Filter, Download, BarChart3, User } from "lucide-react"
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
        const errorData = await generateResponse.json().catch(() => ({}))

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

    const avgBMI = displayMembers.reduce((sum, m) => sum + m.BMI, 0) / displayMembers.length
    const avgVO2 = displayMembers.reduce((sum, m) => sum + m.VO2max, 0) / displayMembers.length
    const programTypes = [...new Set(displayMembers.map((m) => m.Program_Type))]
    const clusters = [...new Set(displayMembers.map((m) => m.Predicted_Cluster))]

    return {
      totalMembers: displayMembers.length,
      avgBMI: avgBMI.toFixed(1),
      avgVO2: avgVO2.toFixed(1),
      programTypes,
      clusters: clusters.sort((a, b) => a - b),
    }
  }, [displayMembers])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-800" />
              <span className="text-2xl font-bold text-white">Vitality Dashboard</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {displayMembers.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">Upload Member Data</h1>
              <p className="text-gray-400">
                Upload a CSV file with member fitness data to generate personalized workout programs
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`border-2 border-dashed p-12 text-center transition-colors ${
                dragActive ? "border-white bg-gray-900/20" : "border-gray-800 hover:border-gray-700"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-16 w-16 text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">{file ? file.name : "Drop your CSV file here"}</h3>
              <p className="text-gray-400 mb-6">
                {loading
                  ? "Processing CSV and generating programs..."
                  : generatingPlans
                    ? "Generating AI-powered personalized plans... (this may take up to 5 minutes)"
                    : file
                      ? "File ready to upload"
                      : "or click to browse files"}
              </p>

              <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="file-upload" />

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <label htmlFor="file-upload">
                  <Button
                    variant="outline"
                    className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white cursor-pointer"
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
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {loading ? "Processing CSV..." : generatingPlans ? "Generating Plans..." : "Generate Programs"}
                  </Button>
                )}
              </div>

              {(loading || generatingPlans) && (
                <div className="mt-4 text-sm text-gray-400">
                  {loading && "Step 1/2: Processing member data..."}
                  {generatingPlans &&
                    "Step 2/2: AI is creating personalized workout and nutrition plans... (up to 5 minutes)"}
                </div>
              )}
            </div>

            {/* CSV Format Info */}
            <div className="mt-12 border border-gray-800 p-6 bg-gray-900/20">
              <h3 className="text-lg font-semibold text-white mb-4">Required CSV Format</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>Your CSV file should include these columns:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>MemberID</li>
                  <li>BMI</li>
                  <li>BodyFat_Percent</li>
                  <li>VO2max</li>
                  <li>EnduranceScore (0-100)</li>
                  <li>FlexibilityScore (0-100)</li>
                  <li>WeeklyWorkouts</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {stats && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="border border-gray-800 p-6 bg-gray-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Members</p>
                        <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
                      </div>
                      <Users className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div className="border border-gray-800 p-6 bg-gray-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Avg BMI</p>
                        <p className="text-2xl font-bold text-white">{stats.avgBMI}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div className="border border-gray-800 p-6 bg-gray-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Avg VO2 Max</p>
                        <p className="text-2xl font-bold text-white">{stats.avgVO2}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  <div className="border border-gray-800 p-6 bg-gray-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Program Types</p>
                        <p className="text-2xl font-bold text-white">{stats.programTypes.length}</p>
                      </div>
                      <Filter className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">Member Programs</h1>
                <p className="text-gray-400">
                  <Users className="h-4 w-4 inline mr-2" />
                  {filteredMembers.length} of {displayMembers.length} members shown
                  {detailedMembers.length > 0 && (
                    <span className="ml-2 text-green-400">• Detailed plans generated</span>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 text-white placeholder-gray-400 focus:border-white focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCluster || ""}
                  onChange={(e) => setSelectedCluster(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 text-white focus:border-white focus:outline-none"
                >
                  <option value="">All Clusters</option>
                  {stats?.clusters.map((cluster) => (
                    <option key={cluster} value={cluster}>
                      Cluster {cluster}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProgramType || ""}
                  onChange={(e) => setSelectedProgramType(e.target.value || null)}
                  className="px-4 py-2 bg-gray-900 border border-gray-800 text-white focus:border-white focus:outline-none"
                >
                  <option value="">All Programs</option>
                  {stats?.programTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
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
                  className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
                >
                  Upload New File
                </Button>
              </div>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredMembers.map((member) => (
                <div key={member.MemberID} className="bg-gray-900 border border-gray-800 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-white">Member {member.MemberID}</h3>
                    <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1">
                      Cluster {member.Predicted_Cluster}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-white mb-2">{member.Program_Type}</h4>
                    <p className="text-gray-400 text-sm">{member.Details}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">BMI:</span>
                      <span className="text-white ml-2">{member.BMI}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Body Fat:</span>
                      <span className="text-white ml-2">{member.BodyFat_Percent}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">VO2 Max:</span>
                      <span className="text-white ml-2">{member.VO2max}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Weekly Workouts:</span>
                      <span className="text-white ml-2">{member.WeeklyWorkouts}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <Link href={generatingPlans ? "#" : `/plan/${member.MemberID}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={generatingPlans}
                        className={`bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white ${
                          generatingPlans ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {generatingPlans ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-2" />
                            View Plan
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {filteredMembers.length === 0 && displayMembers.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No members match your current filters.</p>
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCluster(null)
                    setSelectedProgramType(null)
                  }}
                  variant="outline"
                  className="mt-4 bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
                >
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
