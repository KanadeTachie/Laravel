import type React from "react"
import { Link, usePage } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Users, Settings, Home, LogOut } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  is_admin: boolean
}

interface Props {
  children: React.ReactNode
  auth: {
    user: User
  }
}

export default function AdminLayout({ children, auth }: Props) {
  const { url } = usePage()

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Welcome, {auth.user.name}</p>
          </div>

          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = url.startsWith(item.href)
              return (
                <Link key={item.name} href={item.href}>
                  <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Link href="/logout" method="post">
              <Button variant="ghost" className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
