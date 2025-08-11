'use client'

import { useState } from 'react'
import { MemberWithProgram, MemberWithPlans } from '@/lib/api'

type UploadFormProps = {
  onDataUpdate: (data: (MemberWithProgram | MemberWithPlans)[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function UploadForm({ onDataUpdate, loading, setLoading }: UploadFormProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get('csvFile') as File
    
    if (!file) {
      setError('Please select a file')
      return
    }
    
    setError(null)
    setLoading(true)
    
    try {
      const response = await fetch('/api/upload-csv', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        onDataUpdate(result.data)
      } else {
        setError(result.error || 'Failed to upload CSV')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV')
    } finally {
      setLoading(false)
    }
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Member Data File</h3>
            <p className="text-sm text-muted-foreground">Upload a CSV file containing member fitness data</p>
          </div>
          <button 
            type="button"
            onClick={handleDownloadSample}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200 dark:border-blue-800 gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Sample Data
          </button>
        </div>
        
        <div className="space-y-3">
          <input 
            name="csvFile"
            type="file" 
            accept=".csv" 
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
          />
          
          <button 
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-md disabled:opacity-50 gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload & Assign
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}

type GeneratePlansButtonProps = {
  members: MemberWithProgram[]
  onDataUpdate: (data: MemberWithPlans[]) => void
  loading: boolean
  setLoading: (loading: boolean) => void
}

export function GeneratePlansButton({ members, onDataUpdate, loading, setLoading }: GeneratePlansButtonProps) {
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePlans = async () => {
    setError(null)
    setLoading(true)
    
    try {
      const response = await fetch('/api/generate-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ members }),
      })
      
      const result = await response.json()
      
      if (result.success && result.data) {
        onDataUpdate(result.data)
      } else {
        setError(result.error || 'Failed to generate plans')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate plans')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button 
        onClick={handleGeneratePlans} 
        disabled={loading || members.length === 0}
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-md disabled:opacity-50 gap-2"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Generate Plans ({members.length})
      </button>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
