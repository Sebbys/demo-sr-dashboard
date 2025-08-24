import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Users, Target, Zap, Star, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="new-container relative !border-none sm:!border-dashed bg-background">
      {/* Hero Section */}
      <section className="relative flex h-[calc(100svh-64px-150px)] flex-row items-center overflow-hidden border-b border-border">
        {/* Background Pattern */}
        <div className="absolute inset-0 h-full w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.15),transparent_50%)]" />
        </div>

        {/* Hero Content */}
        <div className="z-10 flex flex-col gap-4">
          {/* Rating Badge */}
          <div className="flex flex-row items-center gap-2 px-6">
            <div className="bg-muted/30 relative flex h-7 w-16 flex-row items-center gap-2 rounded-md border border-border px-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="urbanist absolute right-3 text-sm font-semibold text-foreground">4.9</span>
            </div>
            <div className="flex flex-row items-center">
              <div className="bg-muted/30 h-1.5 w-1.5 border border-border"></div>
              <div className="from-muted h-px w-40 bg-gradient-to-r to-transparent"></div>
            </div>
          </div>

          {/* Main Headlines */}
          <div className="instrument-serif flex flex-col gap-2 px-6 hero-title">
            <h1 className="text-foreground/60">
              Transform Your <span className="text-primary-foreground">Wellness Journey</span>
            </h1>
            <h2 className="text-foreground/60">
              With <span className="text-primary-foreground">AI-Powered</span> Plans
            </h2>
          </div>

          {/* CTA Buttons */}
          <div className="mt-4 flex flex-row gap-4 px-6">
            <Link href="/dashboard">
              <Button className="button-highlighted-shadow h-8 px-4 py-2 transition-all-smooth hover:cursor-pointer">
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <div className="relative">
              <Link href="/dashboard/global">
                <Button variant="secondary" className="h-8 px-4 py-2 transition-all-smooth hover:cursor-pointer">
                  <span>View Analytics</span>
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-flow-row sm:h-[150px] sm:grid-cols-3 bg-card">
        <div className="flex h-40 flex-col gap-3 border-b border-border p-4 sm:h-auto">
          <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Personalized Workouts
          </h2>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            AI-powered workout plans adapted to your fitness level, goals, and available equipment for maximum results.
          </p>
        </div>
        <div className="flex h-40 flex-col gap-3 border-b border-border p-4 sm:h-auto sm:border-l">
          <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Nutrition Guidance
          </h2>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Personalized meal plans with macro tracking and recipe suggestions tailored to your dietary preferences and goals.
          </p>
        </div>
        <div className="flex h-40 flex-col gap-3 border-b border-border p-4 sm:h-auto sm:border-l">
          <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight text-foreground">
            <Shield className="h-4 w-4 text-primary" />
            Expert Support
          </h2>
          <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
            Connect with certified trainers and nutritionists for personalized guidance and continuous support on your journey.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="flex w-full flex-col">
        {/* Stats Header */}
        <div className="flex flex-col items-center border-b border-border py-4 bg-background">
          <div className="flex flex-row items-center gap-2 px-6">
            <div className="flex flex-row items-center">
              <div className="from-muted h-px w-24 bg-gradient-to-l to-transparent sm:w-40"></div>
              <div className="bg-muted/30 h-1.5 w-1.5 border border-border"></div>
            </div>
            <div className="bg-muted/20 jetbrains-mono relative flex h-7 flex-row items-center gap-2 rounded-md border px-4 text-sm font-medium">
              <span>Platform Stats</span>
            </div>
            <div className="flex flex-row items-center">
              <div className="bg-muted/20 h-1.5 w-1.5 border"></div>
              <div className="from-muted h-px w-24 bg-gradient-to-r to-transparent sm:w-40"></div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col">
          {/* Active Users */}
          <div className="grid grid-flow-row grid-cols-1 border-b border-dashed sm:grid-cols-3 md:h-[150px]">
            <div className="gap-2 flex flex-col p-6 sm:col-span-2 sm:order-1">
              <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight">
                Active Users
                <span className="text-muted-foreground bg-muted/30 rounded-sm px-2 py-0.5 text-[10px]">Growing Community</span>
              </h2>
              <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
                Join thousands of users who have transformed their fitness journey with our AI-powered platform. Our community continues to grow as more people discover the benefits of personalized wellness plans.
              </p>
            </div>
            <div className="gap-2 sm:border-r flex flex-col items-center justify-center border-none p-6 sm:border-dashed">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="grid grid-flow-row grid-cols-1 border-b border-dashed sm:grid-cols-3 md:h-[150px]">
            <div className="gap-2 flex flex-col p-6 sm:col-span-2">
              <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight">
                Success Rate
                <span className="text-muted-foreground bg-muted/30 rounded-sm px-2 py-0.5 text-[10px]">Proven Results</span>
              </h2>
              <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
                Our AI-powered approach has helped users achieve remarkable results. With personalized plans and expert guidance, users see significant improvements in their fitness and wellness goals.
              </p>
            </div>
            <div className="gap-2 sm:border-l flex flex-col items-center justify-center border-none p-6 sm:border-dashed">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {/* Support */}
          <div className="grid grid-flow-row grid-cols-1 border-b border-dashed sm:grid-cols-3 md:h-[150px]">
            <div className="gap-2 flex flex-col p-6 sm:col-span-2 sm:order-1">
              <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight">
                Expert Support
                <span className="text-muted-foreground bg-muted/30 rounded-sm px-2 py-0.5 text-[10px]">Always Available</span>
              </h2>
              <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
                Our team of certified trainers and nutritionists are available 24/7 to provide guidance, answer questions, and help you stay on track with your wellness journey.
              </p>
            </div>
            <div className="gap-2 sm:border-r flex flex-col items-center justify-center border-none p-6 sm:border-dashed">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-xs text-muted-foreground">Support</div>
            </div>
          </div>

          {/* Get Started */}
          <div className="grid grid-flow-row grid-cols-1 border-b border-dashed sm:grid-cols-3 md:h-[150px]">
            <div className="gap-2 flex flex-col p-6 sm:col-span-2">
              <h2 className="jetbrains-mono flex items-center gap-2 text-sm font-medium tracking-tight">
                Ready to Start?
                <span className="text-muted-foreground bg-muted/30 rounded-sm px-2 py-0.5 text-[10px]">Free Trial</span>
              </h2>
              <p className="jetbrains-mono text-muted-foreground text-xs tracking-tight">
                Start your wellness journey today with our free trial. Upload your data, get personalized plans, and see the difference AI-powered fitness can make in your life.
              </p>
              <Link href="/dashboard" className="mt-1">
                <Button
                  variant="outline"
                  className="bg-white text-white hover:cursor-pointer hover:bg-white/80 h-5 gap-1.5 px-2 text-xs rounded-sm"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
            <div className="gap-2 !p-2 sm:border-l flex flex-col items-center justify-center border-none p-6 sm:border-dashed">
              <div className="bg-dashed flex h-full w-full items-center justify-center rounded-md px-10 py-5">
                <span className="jetbrains-mono bg-background text-muted-foreground rounded-sm px-2 py-1 text-center text-xs">
                  Upload CSV
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex h-[130px] items-center overflow-hidden px-4 sm:h-auto sm:px-0">
        <div className="w-full text-center">
          <div className="jetbrains-mono text-muted-foreground text-sm py-2">
            © 2024 Uroboros. Transform your wellness journey with AI-powered fitness plans.
          </div>
        </div>
      </footer>
    </div>
  )
}
