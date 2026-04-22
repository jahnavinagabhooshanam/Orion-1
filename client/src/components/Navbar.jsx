import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, LayoutDashboard, Crosshair, Settings as SettingsIcon } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="glass-panel border-b border-gray-800 rounded-none sticky top-0 z-50 w-full">
      <div className="w-full px-8 md:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Brand & Main Nav */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <Logo className="w-10 h-10" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black tracking-[0.2em] text-white">ORION</span>
                  <span className="text-[10px] text-accent px-2 py-0.5 border border-accent/30 rounded-full bg-accent/10 font-bold">SYSTEM ONLINE</span>
                </div>
                <div className="text-[9px] text-gray-500 uppercase tracking-[0.3em] font-medium mt-1">Autonomous Risk Intelligence</div>
              </div>
            </div>
            
            <div className="hidden xl:flex items-center gap-8">
              <Link to="/" className={`flex items-center gap-2 text-[11px] font-black tracking-[0.2em] px-4 py-2 rounded-xl transition-all ${location.pathname === '/' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <LayoutDashboard size={14} />
                DASHBOARD
              </Link>
              <Link to="/command-center" className={`flex items-center gap-2 text-[11px] font-black tracking-[0.2em] px-4 py-2 rounded-xl transition-all ${location.pathname === '/command-center' ? 'bg-danger/10 text-danger border border-danger/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <Crosshair size={14} />
                COMMAND CENTER
              </Link>
              {currentUser?.role === 'Admin' && (
                <Link to="/settings" className={`flex items-center gap-2 text-[11px] font-black tracking-[0.2em] px-4 py-2 rounded-xl transition-all ${location.pathname === '/settings' ? 'bg-warning/10 text-warning border border-warning/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                  <SettingsIcon size={14} />
                  ADMIN PANEL
                </Link>
              )}
            </div>

            {/* Network Status - Added mr-8 to create distance from the divider */}
            <div className="hidden lg:flex items-center gap-3 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-800 mr-8">
              <Activity className="w-3 h-3 text-green-400 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Network: Active</span>
            </div>
          </div>
          
          {/* Profile & Status */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-8 border-l border-gray-800 pl-8">
              <div className="flex flex-col items-end border-r border-gray-800 pr-8">
                <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Clearance Status</span>
                <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${
                  currentUser?.role === 'Admin' ? 'border-red-500/50 text-red-500 bg-red-500/5' : 
                  currentUser?.role === 'Operator' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' : 
                  'border-blue-500/50 text-blue-500 bg-blue-500/5'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    currentUser?.role === 'Admin' ? 'bg-red-500' : 
                    currentUser?.role === 'Operator' ? 'bg-yellow-500' : 
                    'bg-blue-500'
                  }`}></div>
                  {currentUser?.role === 'Admin' ? '🔴 ADMIN (Full Control)' : 
                   currentUser?.role === 'Operator' ? '🟡 OPERATOR (Execution)' : 
                   '🔵 ANALYST (Read Only)'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-gray-200 font-bold text-xs tracking-tight">{currentUser?.email}</span>
                  <span className="text-[10px] text-primary/60 font-mono">ID: {currentUser?.uid?.slice(0, 8)}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-gray-800"
                  title="Disconnect"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
