import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Users, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-white">Vitality</span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a
                  href="#features"
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  How it Works
                </a>
                <a
                  href="#pricing"
                  className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                >
                  Pricing
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
                >
                  Dashboard
                </Button>
              </Link>
              <Button className="bg-white text-black hover:bg-gray-200 border-0">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl lg:text-8xl font-bold text-white leading-tight mb-8">
              Transform Your
              <span className="block">Wellness Journey</span>
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-12">
              Personalized workout plans, nutrition guidance, and wellness coaching tailored specifically for your goals
              and lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 border-0">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 bg-transparent border-gray-800 text-gray-400 hover:text-white hover:border-white"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="border border-gray-800 p-8 bg-gray-900/20">
                <div className="text-4xl font-bold text-white mb-2">50K+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Active Users</div>
              </div>
              <div className="border border-gray-800 p-8 bg-gray-900/20">
                <div className="text-4xl font-bold text-white mb-2">95%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Success Rate</div>
              </div>
              <div className="border border-gray-800 p-8 bg-gray-900/20">
                <div className="text-4xl font-bold text-white mb-2">24/7</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">Everything You Need</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge technology with expert guidance to deliver personalized
              wellness solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-gray-800 p-8 bg-gray-900/20 hover:bg-gray-900/40 transition-colors">
              <div className="w-12 h-12 bg-white flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Custom Workouts</h3>
              <p className="text-gray-400">
                AI-powered workout plans adapted to your fitness level, goals, and available equipment.
              </p>
            </div>

            <div className="border border-gray-800 p-8 bg-gray-900/20 hover:bg-gray-900/40 transition-colors">
              <div className="w-12 h-12 bg-white flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Nutrition Plans</h3>
              <p className="text-gray-400">
                Personalized meal plans with macro tracking and recipe suggestions for your dietary needs.
              </p>
            </div>

            <div className="border border-gray-800 p-8 bg-gray-900/20 hover:bg-gray-900/40 transition-colors">
              <div className="w-12 h-12 bg-white flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Expert Coaching</h3>
              <p className="text-gray-400">
                Connect with certified trainers and nutritionists for personalized guidance and support.
              </p>
            </div>

            <div className="border border-gray-800 p-8 bg-gray-900/20 hover:bg-gray-900/40 transition-colors">
              <div className="w-12 h-12 bg-white flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
              <p className="text-gray-400">
                Advanced analytics and insights to monitor your progress and optimize your results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">Simple Steps to Better Health</h2>
            <p className="text-xl text-gray-400">Get started in minutes with our streamlined onboarding process</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white text-black flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Complete Assessment</h3>
              <p className="text-gray-400">
                Tell us about your goals, fitness level, dietary preferences, and lifestyle to create your profile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white text-black flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Get Your Plan</h3>
              <p className="text-gray-400">
                Receive personalized workout routines, meal plans, and wellness recommendations tailored just for you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white text-black flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Track Progress</h3>
              <p className="text-gray-400">
                Monitor your achievements, adjust your plans, and celebrate milestones on your wellness journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Transform Your Life?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of people who have already started their wellness journey with Vitality.
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-200 px-8 py-4 border-0">
            <Link href="/dashboard" className="flex items-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4 text-white">Vitality</div>
              <p className="text-gray-400">Empowering your wellness journey with personalized health solutions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Vitality. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
