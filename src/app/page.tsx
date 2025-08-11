import { Separator } from '@/components/ui/separator'
import { AppHeader } from '@/components/ServerComponents'
import { AppSidebar } from '@/components/AppSidebar'
import DashboardClient from '@/components/DashboardClient'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <AppHeader />
        </header>
        <main>
          <DashboardClient />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
