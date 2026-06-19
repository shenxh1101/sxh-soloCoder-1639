import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Flower2, Trash2, BarChart3, Sprout } from "lucide-react";

const navItems = [
  { path: "/", label: "首页", icon: LayoutDashboard },
  { path: "/inventory", label: "花材库存", icon: Package },
  { path: "/bouquet", label: "花束制作", icon: Flower2 },
  { path: "/loss", label: "损耗记录", icon: Trash2 },
  { path: "/reports", label: "数据报表", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-rose-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl gradient-rose flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                <Sprout className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg text-ink leading-tight">花语管家</h1>
                <p className="text-xs text-rose-400 leading-tight">鲜花店智能管理</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-rose-300 text-white shadow-md shadow-rose-200/50"
                        : "text-ink/70 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 z-50">
        <div className="flex justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "text-rose-600 bg-rose-50"
                    : "text-ink/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
