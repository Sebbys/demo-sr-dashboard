"use client"

import { Document, Page, PDFDownloadLink, StyleSheet, Text, View, Svg, Path, G } from '@react-pdf/renderer'
import React from 'react'
import tinycolor from 'tinycolor2'
import type { MemberWithPlans } from '@/lib/api'

// Color palette
const colors = {
  primary: '#1f6feb',
  accent: '#12b981',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  panel: '#f8fafc',
  bg: '#ffffff',
}

// Charting Components
function PieChart({ data, size = 80 }: { data: { label: string, value: number, color: string }[], size?: number }) {
  const radius = size / 2
  let cumulative = 0

  const paths = data.map((slice) => {
    const startAngle = (cumulative / 100) * 360
    cumulative += slice.value
    const endAngle = (cumulative / 100) * 360
    const largeArcFlag = slice.value > 50 ? 1 : 0

    const x1 = radius + radius * Math.cos((Math.PI * startAngle) / 180)
    const y1 = radius + radius * Math.sin((Math.PI * startAngle) / 180)
    const x2 = radius + radius * Math.cos((Math.PI * endAngle) / 180)
    const y2 = radius + radius * Math.sin((Math.PI * endAngle) / 180)

    return (
      <Path
        key={slice.label}
        d={`M${radius},${radius} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`}
        fill={slice.color}
      />
    )
  })

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {data.map(slice => (
          <View key={slice.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: slice.color }} />
            <Text style={{ fontSize: 9, color: colors.muted }}>{slice.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

function RadarChart({ data, size = 100 }: { data: { label: string, value: number }[], size?: number }) {
  const numAxes = data.length
  const radius = size / 3 // Smaller radius to ensure labels fit
  const labelOffset = radius + 20 // More space for labels
  const totalSize = size + 60 // Total size including label space
  const center = totalSize / 2

  const angleSlice = (Math.PI * 2) / numAxes

  // Grid lines (circles)
  const gridLevels = 4
  const gridLines = Array.from({ length: gridLevels }, (_, i) => {
    const r = radius * ((i + 1) / gridLevels)
    return (
      <Path 
        key={i} 
        d={`M ${center + r} ${center} A ${r} ${r} 0 1 0 ${center - r} ${center} A ${r} ${r} 0 1 0 ${center + r} ${center}`} 
        stroke={colors.border} 
        strokeWidth={0.5} 
        fill="none" 
      />
    )
  })

  // Axes and labels
  const axes = data.map((item, i) => {
    const angle = angleSlice * i - Math.PI / 2
    const x1 = center + radius * Math.cos(angle)
    const y1 = center + radius * Math.sin(angle)
    const labelX = center + labelOffset * Math.cos(angle)
    const labelY = center + labelOffset * Math.sin(angle)
    
    return (
      <G key={item.label}>
        <Path 
          d={`M${center},${center} L${x1},${y1}`} 
          stroke={colors.border} 
          strokeWidth={0.5} 
        />
        <Text 
          x={labelX} 
          y={labelY} 
          style={{ fontSize: 9, color: colors.muted, fontWeight: 'bold' }} 
          textAnchor="middle" 
          dominantBaseline="central"
        >
          {item.label}
        </Text>
      </G>
    )
  })

  // Data shape
  const dataPoints = data.map((item, i) => {
    const r = (item.value / 100) * radius
    const angle = angleSlice * i - Math.PI / 2
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')

  const dataShape = (
    <Path 
      d={`M${dataPoints} Z`} 
      fill={tinycolor(colors.primary).setAlpha(0.3).toString()} 
      stroke={colors.primary} 
      strokeWidth={2} 
    />
  )

  // Data points
  const dataPoints2 = data.map((item, i) => {
    const r = (item.value / 100) * radius
    const angle = angleSlice * i - Math.PI / 2
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return (
      <G key={`point-${i}`}>
        <Path
          d={`M ${x} ${y} m -3 0 a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
          fill={colors.primary}
        />
      </G>
    )
  })

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}>
        {gridLines}
        {axes}
        {dataShape}
        {dataPoints2}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  page: { 
    padding: 30, 
    paddingBottom: 50, // Extra space for footer
    fontSize: 10, 
    color: colors.text, 
    backgroundColor: colors.bg,
    lineHeight: 1.4
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  titleBlock: {},
  title: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 11, color: colors.muted },
  logo: { fontSize: 14, fontWeight: 'bold', color: colors.primary },

  grid: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 16,
    minHeight: 120 // Ensure minimum height for consistency
  },
  col: { flex: 1 },
  col2: { flex: 2 },

  card: { 
    backgroundColor: colors.panel, 
    borderColor: colors.border, 
    borderWidth: 1, 
    borderRadius: 6, 
    padding: 12, 
    minHeight: 100 // Ensure consistent card heights
  },
  cardTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: colors.muted, 
    marginBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border, 
    paddingBottom: 4 
  },

  metricRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 3,
    minHeight: 18
  },
  metricLabel: { color: colors.muted, fontSize: 9 },
  metricValue: { fontWeight: 'bold', color: colors.text, fontSize: 10 },
  metricBar: { 
    height: 6, 
    backgroundColor: tinycolor(colors.primary).setAlpha(0.2).toString(), 
    borderRadius: 3, 
    flex: 1, 
    marginLeft: 8 
  },
  metricBarFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },

  section: { 
    marginTop: 24,
    pageBreakInside: 'avoid' // Prevent sections from breaking awkwardly
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: colors.primary, 
    marginBottom: 12, 
    borderBottomWidth: 2, 
    borderBottomColor: colors.primary, 
    paddingBottom: 6,
    pageBreakAfter: 'avoid' // Keep title with content
  },

  dayCard: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 6,
    pageBreakInside: 'avoid',
    minHeight: 24
  },
  dayTitleBlock: { width: 100, flexShrink: 0 },
  dayTitle: { fontSize: 11, fontWeight: 'bold', color: colors.primary },
  dayFocus: { fontSize: 9, color: colors.muted, marginTop: 2 },
  daySessions: { flex: 1 },
  session: { 
    fontSize: 9, 
    color: colors.text, 
    marginBottom: 2,
    lineHeight: 1.3
  },

  guidelines: { 
    borderLeftColor: colors.accent, 
    borderLeftWidth: 3, 
    paddingLeft: 12, 
    backgroundColor: tinycolor(colors.accent).setAlpha(0.1).toString(), 
    borderRadius: 4, 
    padding: 12, 
    marginTop: 12,
    pageBreakInside: 'avoid'
  },
  note: { 
    marginTop: 8, 
    fontStyle: 'italic', 
    color: colors.muted, 
    fontSize: 9,
    lineHeight: 1.3
  },

  table: { 
    borderColor: colors.border, 
    borderWidth: 1, 
    borderRadius: 6, 
    overflow: 'hidden', 
    marginTop: 12,
    pageBreakInside: 'avoid'
  },
  tr: { 
    flexDirection: 'row', 
    borderBottomColor: colors.border, 
    borderBottomWidth: 1,
    minHeight: 24
  },
  th: { 
    flex: 1, 
    backgroundColor: colors.panel, 
    padding: 8, 
    fontSize: 9, 
    fontWeight: 'bold',
    borderRightWidth: 0.5,
    borderRightColor: colors.border
  },
  td: { 
    flex: 1, 
    padding: 8, 
    fontSize: 9,
    lineHeight: 1.3,
    borderRightWidth: 0.5,
    borderRightColor: colors.border
  },

  nutritionGrid: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 12,
    pageBreakInside: 'avoid'
  },
  nutritionCol: { flex: 1 },

  footer: { 
    position: 'absolute', 
    bottom: 20, 
    left: 30, 
    right: 30, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    color: colors.muted, 
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8
  },

  // New page break utilities
  pageBreak: {
    pageBreakBefore: 'always'
  },
  avoidBreak: {
    pageBreakInside: 'avoid'
  }
})

function fmt(n: any, digits = 0) {
  const v = Number(n)
  return Number.isFinite(v) ? v.toFixed(digits) : '-'
}

function MemberReportDoc({ member }: { member: MemberWithPlans }) {
  const bio = (member.Biometrics_Plan || {}) as any
  const weekly = Array.isArray(bio.weekly_workout_plan) ? bio.weekly_workout_plan : []
  const guide = (bio.training_guidelines || {}) as any
  const wNote = bio.personal_note as string | undefined

  const nut = (member.Nutrition_Plan || {}) as any
  const meals = Array.isArray(nut.daily_meal_schedule) ? nut.daily_meal_schedule : []
  const summary = (nut.summary || {}) as any
  const nNote = nut.personal_note as string | undefined

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const macroData = summary.macro_targets_g
    ? [
        { label: 'Protein', value: summary.macro_targets_g.protein, color: '#3b82f6' },
        { label: 'Carbs', value: summary.macro_targets_g.carbs, color: '#10b981' },
        { label: 'Fat', value: summary.macro_targets_g.fat, color: '#f97316' },
      ]
    : []
  const totalMacros = macroData.reduce((sum, item) => sum + item.value, 1)
  const macroPercentages = macroData.map(item => ({ ...item, value: (item.value / totalMacros) * 100 }))

  const radarData = [
    { label: 'Endurance', value: Number(member.EnduranceScore) || 0 },
    { label: 'Flexibility', value: Number(member.FlexibilityScore) || 0 },
    { label: 'Strength', value: Number(member.StrengthScore) || 0 },
  ]

  return (
    <Document author="Nightfall Fitness" title={`Fitness Plan for Member ${member.MemberID}`}>
      {/* Page 1: Overview and Health Metrics */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Personalized Fitness & Nutrition Plan</Text>
            <Text style={styles.subtitle}>For Member #{String(member.MemberID)} • Generated {today}</Text>
          </View>
          <Text style={styles.logo}>Nightfall Fitness</Text>
        </View>

        {/* Overview Section */}
        <View style={styles.grid}>
          <View style={styles.col2}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Program Overview: {member.Program_Type}</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{member.Details}</Text>
            </View>
          </View>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Health Snapshot</Text>
              <View style={styles.metricRow}><Text style={styles.metricLabel}>BMI:</Text><Text style={styles.metricValue}>{fmt(member.BMI, 1)}</Text></View>
              <View style={styles.metricRow}><Text style={styles.metricLabel}>Body Fat:</Text><Text style={styles.metricValue}>{fmt(member.BodyFat_Percent, 1)}%</Text></View>
              <View style={styles.metricRow}><Text style={styles.metricLabel}>VO2max:</Text><Text style={styles.metricValue}>{fmt(member.VO2max, 1)}</Text></View>
              <View style={styles.metricRow}><Text style={styles.metricLabel}>Workouts/Wk:</Text><Text style={styles.metricValue}>{fmt(member.WeeklyWorkouts)}</Text></View>
            </View>
          </View>
        </View>

        {/* Fitness Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Profile</Text>
          <View style={styles.grid}>
            <View style={styles.col}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Performance Radar</Text>
                <RadarChart data={radarData} />
              </View>
            </View>
            <View style={styles.col2}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Key Metrics Analysis</Text>
                <Text style={{ fontSize: 10, lineHeight: 1.4, marginBottom: 8 }}>
                  Your fitness profile shows balanced development across key areas:
                </Text>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Endurance Score:</Text>
                  <Text style={styles.metricValue}>{Number(member.EnduranceScore) || 0}/100</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Flexibility Score:</Text>
                  <Text style={styles.metricValue}>{Number(member.FlexibilityScore) || 0}/100</Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={styles.metricLabel}>Strength Score:</Text>
                  <Text style={styles.metricValue}>{Number(member.StrengthScore) || 0}/100</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text>This is a personalized plan. Consult a professional before making changes.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: Workout Plan */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Weekly Workout Plan</Text>
            <Text style={styles.subtitle}>Member #{String(member.MemberID)} • {member.Program_Type}</Text>
          </View>
          <Text style={styles.logo}>Nightfall Fitness</Text>
        </View>

        {weekly.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Workout Schedule</Text>
            <Text>No workout plan available. Please contact your trainer for a customized plan.</Text>
          </View>
        ) : (
          <View style={styles.avoidBreak}>
            <Text style={styles.sectionTitle}>Your Weekly Schedule</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>7-Day Training Program</Text>
              {weekly.map((day: any, i: number) => (
                <View key={i} style={styles.dayCard}>
                  <View style={styles.dayTitleBlock}>
                    <Text style={styles.dayTitle}>{day.day}</Text>
                    <Text style={styles.dayFocus}>{day.focus}</Text>
                  </View>
                  <View style={styles.daySessions}>
                    {(day.sessions || []).map((s: any, j: number) => (
                      <Text key={j} style={styles.session}>
                        • {s.type} ({s.duration_min} min) - {s.intensity}
                        {s.notes ? ` - ${s.notes}` : ''}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Training Guidelines */}
        {(guide.warmup || guide.cooldown || guide.injury_prevention || wNote) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Guidelines</Text>
            <View style={styles.guidelines}>
              {guide.warmup && (
                <Text style={{ marginBottom: 6 }}>
                  <Text style={{ fontWeight: 'bold' }}>Warmup Protocol: </Text>
                  {guide.warmup}
                </Text>
              )}
              {guide.cooldown && (
                <Text style={{ marginBottom: 6 }}>
                  <Text style={{ fontWeight: 'bold' }}>Cooldown Protocol: </Text>
                  {guide.cooldown}
                </Text>
              )}
              {guide.injury_prevention && (
                <Text style={{ marginBottom: 6 }}>
                  <Text style={{ fontWeight: 'bold' }}>Injury Prevention: </Text>
                  {guide.injury_prevention}
                </Text>
              )}
              {wNote && <Text style={styles.note}>Personal Note: {wNote}</Text>}
            </View>
          </View>
        )}

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text>This is a personalized plan. Consult a professional before making changes.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 3: Nutrition Plan */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Daily Nutrition Plan</Text>
            <Text style={styles.subtitle}>Member #{String(member.MemberID)} • Personalized Meal Schedule</Text>
          </View>
          <Text style={styles.logo}>Nightfall Fitness</Text>
        </View>

        <Text style={styles.sectionTitle}>Nutritional Overview</Text>
        
        {/* Macro Distribution and Daily Totals */}
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionCol}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Macro Distribution</Text>
              {macroPercentages.length > 0 ? (
                <PieChart data={macroPercentages} />
              ) : (
                <Text style={{ fontSize: 10, color: colors.muted }}>
                  No macro distribution data available.
                </Text>
              )}
            </View>
          </View>
          <View style={styles.nutritionCol}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Daily Targets</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Total Calories:</Text>
                <Text style={styles.metricValue}>
                  {summary.total_calories ? `${summary.total_calories} kcal` : '-'}
                </Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Daily Hydration:</Text>
                <Text style={styles.metricValue}>
                  {summary.hydration_ml ? `${summary.hydration_ml} ml` : '-'}
                </Text>
              </View>
              {summary.macro_targets_g && (
                <>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Protein:</Text>
                    <Text style={styles.metricValue}>{summary.macro_targets_g.protein}g</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Carbohydrates:</Text>
                    <Text style={styles.metricValue}>{summary.macro_targets_g.carbs}g</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Fat:</Text>
                    <Text style={styles.metricValue}>{summary.macro_targets_g.fat}g</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Meal Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Meal Schedule</Text>
          {meals.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tr}>
                <Text style={[styles.th, { flex: 0.8 }]}>Time</Text>
                <Text style={[styles.th, { flex: 1 }]}>Meal Type</Text>
                <Text style={[styles.th, { flex: 2.2 }]}>Food Items</Text>
                <Text style={[styles.th, { flex: 0.6, textAlign: 'center' }]}>Calories</Text>
              </View>
              {meals.map((m: any, i: number) => (
                <View key={i} style={[styles.tr, i === meals.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                  <Text style={[styles.td, { flex: 0.8 }]}>{m.time}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{m.meal_type}</Text>
                  <Text style={[styles.td, { flex: 2.2 }]}>
                    {Array.isArray(m.items) ? m.items.join(', ') : (m.items || '')}
                  </Text>
                  <Text style={[styles.td, { flex: 0.6, textAlign: 'center' }]}>
                    {m.calories ?? '-'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text>No meal schedule available. Please contact your nutritionist for a personalized meal plan.</Text>
            </View>
          )}
        </View>

        {/* Supplements and Notes */}
        {summary.supplements_note && (
          <View style={[styles.guidelines, { 
            marginTop: 16, 
            backgroundColor: tinycolor(colors.primary).setAlpha(0.1).toString(), 
            borderLeftColor: colors.primary 
          }]}>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>Supplement Recommendations: </Text>
              {summary.supplements_note}
            </Text>
          </View>
        )}
        
        {nNote && (
          <View style={[styles.guidelines, { marginTop: 12 }]}>
            <Text style={styles.note}>Personal Nutrition Note: {nNote}</Text>
          </View>
        )}

        {/* Footer */}
        <View fixed style={styles.footer}>
          <Text>This is a personalized plan. Consult a professional before making changes.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export function MemberReportDownload({ member }: { member: MemberWithPlans }) {
  if (!member) return null
  return (
    <PDFDownloadLink document={<MemberReportDoc member={member} />} fileName={`Member_${String(member.MemberID)}_Report.pdf`}>
      {({ loading }) => (
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          {loading ? 'Preparing Report…' : 'Download PDF Report'}
        </button>
      )}
    </PDFDownloadLink>
  )
}

// Test Preview Component - Use this to test changes quickly
export function MemberReportTestPreview() {
  // Mock data for testing - modify this to test different scenarios
  const mockMember: MemberWithPlans = {
    MemberID: 12345,
    Predicted_Cluster: 2,
    Program_Type: "Weight Loss",
    Details: "Comprehensive weight loss program focusing on cardio and strength training with nutritional guidance. Designed for sustainable results over 12 weeks.",
    BMI: 28.5,
    BodyFat_Percent: 22.3,
    VO2max: 45.2,
    WeeklyWorkouts: 4,
    EnduranceScore: 75,
    FlexibilityScore: 60,
    StrengthScore: 68,
    
    Biometrics_Plan: {
      weekly_workout_plan: [
        {
          day: "Monday",
          focus: "Upper Body",
          sessions: [
            { type: "Strength Training", duration_min: 45, intensity: "Moderate", notes: "Focus on form" },
            { type: "Cardio", duration_min: 20, intensity: "High", notes: "HIIT session" }
          ]
        },
        {
          day: "Tuesday",
          focus: "Cardio",
          sessions: [
            { type: "Running", duration_min: 30, intensity: "Moderate", notes: "Steady pace" }
          ]
        },
        {
          day: "Wednesday",
          focus: "Lower Body",
          sessions: [
            { type: "Strength Training", duration_min: 50, intensity: "High", notes: "Compound movements" }
          ]
        },
        {
          day: "Thursday",
          focus: "Recovery",
          sessions: [
            { type: "Yoga", duration_min: 30, intensity: "Low", notes: "Active recovery" }
          ]
        },
        {
          day: "Friday",
          focus: "Full Body",
          sessions: [
            { type: "Circuit Training", duration_min: 40, intensity: "High", notes: "Mixed exercises" }
          ]
        }
      ],
      training_guidelines: {
        warmup: "5-10 minutes light cardio followed by dynamic stretching",
        cooldown: "10 minutes static stretching and breathing exercises",
        injury_prevention: "Focus on proper form, progressive overload, adequate rest between sessions"
      },
      personal_note: "Remember to listen to your body and adjust intensity as needed. Stay consistent!"
    },

    Nutrition_Plan: {
      daily_meal_schedule: [
        {
          time: "7:00 AM",
          meal_type: "Breakfast",
          items: ["Oatmeal with berries", "Greek yogurt", "Green tea"],
          calories: 350
        },
        {
          time: "10:00 AM",
          meal_type: "Snack",
          items: ["Apple", "Almonds (15 pieces)"],
          calories: 180
        },
        {
          time: "1:00 PM",
          meal_type: "Lunch",
          items: ["Grilled chicken breast", "Quinoa salad", "Mixed vegetables"],
          calories: 450
        },
        {
          time: "4:00 PM",
          meal_type: "Snack",
          items: ["Protein shake", "Banana"],
          calories: 220
        },
        {
          time: "7:00 PM",
          meal_type: "Dinner",
          items: ["Baked salmon", "Sweet potato", "Steamed broccoli"],
          calories: 420
        }
      ],
      summary: {
        total_calories: 1620,
        hydration_ml: 2500,
        macro_targets_g: {
          protein: 120,
          carbs: 180,
          fat: 60
        },
        supplements_note: "Consider adding Omega-3 and Vitamin D supplements. Whey protein post-workout."
      },
      personal_note: "Focus on whole foods and proper meal timing. Prepare meals in advance when possible."
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">PDF Test Preview</h2>
      <p className="text-sm text-muted-foreground">
        Use this component to test PDF changes without regenerating through LLM. 
        Modify the mockMember data above to test different scenarios.
      </p>
      <div className="flex gap-2">
        <MemberReportDownload member={mockMember} />
        <button 
          onClick={() => {
            console.log('Mock Member Data:', mockMember)
          }}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          Log Test Data
        </button>
      </div>
      
      <div className="border rounded-lg p-4 bg-muted/50">
        <h3 className="font-semibold mb-2">Quick Test Scenarios:</h3>
        <p className="text-sm text-muted-foreground">
          • Modify mockMember data above to test:<br/>
          • Empty workout plans (set weekly_workout_plan: [])<br/>
          • Empty nutrition plans (set daily_meal_schedule: [])<br/>
          • Missing macro data (remove macro_targets_g)<br/>
          • Long text content (extend Details or notes)<br/>
          • Different score values for radar chart
        </p>
      </div>
    </div>
  )
}
