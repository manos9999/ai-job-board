import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, User, BarChart3, FileText, LayoutDashboard, Briefcase } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isEmployer } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  const navLink = "text-[13px] font-medium text-gray-400 hover:text-gray-900 transition-colors";
  const navLinkIcon = `${navLink} flex items-center gap-1.5`;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMobile}>
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-gray-900 tracking-tight">AI Job Board</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <Link to="/jobs" className={navLink}>Jobs</Link>

            {!user && (
              <>
                <Link to="/login" className={navLink}>Sign in</Link>
                <Link to="/register" className="text-[13px] font-medium bg-gray-900 text-white px-3.5 py-1.5 rounded-lg hover:bg-gray-800 active:scale-[0.97] transition-all">
                  Get started
                </Link>
              </>
            )}

            {user && !isEmployer && (
              <>
                <Link to="/applications" className={navLinkIcon}>
                  <FileText className="w-3.5 h-3.5" />
                  Applications
                </Link>
                <Link to="/profile" className={navLinkIcon}>
                  <User className="w-3.5 h-3.5" />
                  Profile
                </Link>
                <Link to="/analytics" className={navLinkIcon}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics
                </Link>
              </>
            )}

            {user && isEmployer && (
              <>
                <Link to="/dashboard" className={navLinkIcon}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link to="/analytics" className={navLinkIcon}>
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="w-px h-4 bg-gray-200" />
                <span className="text-[12px] text-gray-300 font-medium">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4 pt-2 space-y-1">
          <Link to="/jobs" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
            Jobs
          </Link>

          {!user && (
            <>
              <Link to="/login" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
                Sign in
              </Link>
              <Link to="/register" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-900 font-semibold">
                Get started
              </Link>
            </>
          )}

          {user && !isEmployer && (
            <>
              <Link to="/applications" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
                Applications
              </Link>
              <Link to="/profile" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
                Profile
              </Link>
              <Link to="/analytics" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
                Analytics
              </Link>
            </>
          )}

          {user && isEmployer && (
            <>
              <Link to="/dashboard" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <Link to="/analytics" onClick={closeMobile} className="block py-2.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium">
                Analytics
              </Link>
            </>
          )}

          {user && (
            <div className="pt-2 mt-2 border-t border-gray-100">
              <div className="text-[12px] text-gray-400 py-1">{user.name}</div>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-2.5 text-[14px] text-red-500 font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
