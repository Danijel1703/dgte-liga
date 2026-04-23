import {
  Home,
  Users,
  UserPlus,
  LayoutGrid,
  Clock,
  History,
  BarChart2,
  CalendarDays,
  CreditCard,
  BookOpen,
  User,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "../utils/supabase";
import { useUsers } from "../providers/UsersProvider";
import { useAuth } from "../providers/AuthProvider";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

const menuItems = [
  { text: "Početna", icon: Home, path: "/" },
  { text: "Igrači", icon: Users, path: "/players" },
  { text: "Dodaj igrača", icon: UserPlus, path: "/add-player", adminOnly: true as const },
  { text: "Grupe", icon: LayoutGrid, path: "/groups" },
  { text: "Raspored", icon: Clock, path: "/matches" },
  { text: "Povijest mečeva", icon: History, path: "/match-history" },
  { text: "Rang lista", icon: BarChart2, path: "/rankings" },
  { text: "Članarine", icon: CalendarDays, path: "/clanarine" },
  { text: "Uplate", icon: CreditCard, path: "/payment" },
  { text: "Pravila", icon: BookOpen, path: "/rules" },
  { text: "Profil", icon: User, path: "/profile" },
];

function NavContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { pathname } = useLocation();
  const { users } = useUsers();
  const { user } = useAuth();
  const currentUser = users.find((u) => u.user_id === user?.id);

  return (
    <div className="h-full flex flex-col" style={{ background: "oklch(0.12 0.010 85)", color: "white" }}>

      {/* Logo area */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-base leading-none">🎾</span>
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight text-white">DGTE Liga</p>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: "oklch(0.60 0.008 85)" }}>
              Sezona 2026
            </p>
          </div>
        </div>
      </div>

      {/* User card */}
      {currentUser && (
        <div className="px-4 pb-4">
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: "oklch(0.20 0.010 85)" }}
          >
            <PlayerAvatar
              firstName={currentUser.first_name}
              lastName={currentUser.last_name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-white truncate leading-tight">
                {currentUser.first_name} {currentUser.last_name}
              </p>
              {currentUser.is_admin && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded text-primary-foreground"
                  style={{ background: "oklch(0.448 0.119 150 / 0.85)" }}
                >
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="mx-4 mb-3 h-px" style={{ background: "oklch(0.22 0.008 85)" }} />

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-3 space-y-0.5 pb-2">
        {menuItems
          .filter((item) => !item.adminOnly || currentUser?.is_admin)
          .map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 pl-3 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative",
                  isActive
                    ? "bg-primary/15 text-white"
                    : "hover:bg-white/6 text-white/50 hover:text-white/90"
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: "oklch(0.60 0.12 150)" }}
                  />
                )}
                <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", isActive ? "text-primary" : "text-white/35")} />
                {item.text}
              </button>
            );
          })}
      </nav>

      {/* Divider */}
      <div className="mx-4 mt-1 mb-2 h-px" style={{ background: "oklch(0.22 0.008 85)" }} />

      {/* Sign Out */}
      <div className="px-3 pb-4">
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-100 text-white/40 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Odjava
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-40 shadow-xl">
        <NavContent onNavigate={handleNavigate} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 shadow-md"
        style={{ background: "oklch(0.12 0.010 85)" }}
      >
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            }
          />
          <SheetContent side="left" className="p-0 w-60 border-none">
            <NavContent onNavigate={handleNavigate} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-3">
          <span>🎾</span>
          <span className="text-white font-bold text-sm">DGTE Liga</span>
        </div>
      </div>
    </>
  );
}
