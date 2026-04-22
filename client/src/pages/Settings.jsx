import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Settings as SettingsIcon, Shield, Sliders, FileSpreadsheet, Upload } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Edit2, Trash2 } from 'lucide-react';
// XLSX is loaded via CDN in index.html

export default function Settings() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const fileInputRef = useRef(null);
  const [cloudActive, setCloudActive] = useState(false);
  
  // User Management State
  const [users, setUsers] = useState([
    { id: 'admin-1', email: 'admin@orion.com', role: 'Admin', active: true },
  ]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('Analyst');
  const [editingUser, setEditingUser] = useState(null);
  const [formKey, setFormKey] = useState(0);

  // Risk Configuration State
  const [thresholds, setThresholds] = useState({ low: 40, high: 70 });
  const [sensitivity, setSensitivity] = useState('High');
  const [weights, setWeights] = useState({ amount: 70, location: 20, frequency: 10 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Load from LocalStorage first for instant results
        const localUsers = localStorage.getItem('orion_provisioned_users');
        if (localUsers) {
          setUsers(JSON.parse(localUsers));
        }

        // 2. Try to sync with Firestore
        const usersSnap = await getDocs(collection(db, 'users'));
        const fetchedUsers = [];
        usersSnap.forEach(doc => fetchedUsers.push({ id: doc.id, ...doc.data() }));
        
        if (fetchedUsers.length > 0) {
          // Merge and deduplicate
          setUsers(prev => {
            const combined = [...prev];
            fetchedUsers.forEach(fu => {
              if (!combined.find(u => u.email === fu.email)) combined.push(fu);
            });
            localStorage.setItem('orion_provisioned_users', JSON.stringify(combined));
            return combined;
          });
        }
        
        setCloudActive(true);

        const settingsSnap = await getDoc(doc(db, 'system_settings', 'risk'));
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setThresholds(data.thresholds || { low: 40, high: 70 });
          setSensitivity(data.sensitivity || 'High');
          setWeights(data.weights || { amount: 70, location: 20, frequency: 10 });
        }
      } catch (err) {
        console.warn('Firestore locked. Using Local Failsafe Mode.');
        setCloudActive(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Update in Firestore
      await updateDoc(doc(db, "settings", "risk_rules"), {
        thresholds: {
          critical: Number(tempThresholds.critical),
          warning: Number(tempThresholds.warning)
        },
        sensitivity: Number(tempSensitivity),
        updatedBy: currentUser.email,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setThresholds(tempThresholds);
      setSensitivity(tempSensitivity);
      setEditMode(false);
      
      // SHOW WOW MOMENT TOAST
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[200] bg-primary border-2 border-white/20 px-8 py-4 rounded-2xl shadow-2xl animate-slide-in flex items-center gap-4';
      toast.innerHTML = `
        <div class="w-2 h-2 rounded-full bg-white animate-ping"></div>
        <div class="flex flex-col">
          <span class="text-white font-black text-xs uppercase tracking-widest">Neural Calibration Active</span>
          <span class="text-white/80 text-[10px] font-bold">AI Engine adapting to new risk thresholds...</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);

    } catch (err) {  }
    setSaving(false);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword) return;
    
    const newUser = { 
      id: `user-${Date.now()}`, 
      email: newUserEmail, 
      password: newUserPassword,
      role: newUserRole, 
      active: true 
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('orion_provisioned_users', JSON.stringify(updatedUsers));
    
    try {
      await setDoc(doc(db, 'users', newUser.id), newUser);
      setCloudActive(true);
    } catch (err) {
      setCloudActive(false);
    }
    
    // 1. Native Browser Reset
    e.target.reset();

    // 2. React State Reset (Nuclear)
    setTimeout(() => {
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('Analyst');
      setFormKey(prev => prev + 1);
    }, 50);
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const XLSX = window.XLSX; // Use the global XLSX from CDN
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const importedUsers = data.map((item, index) => ({
        id: `xl-${Date.now()}-${index}`,
        email: item.Email || item.email || 'unknown@orion.com',
        role: item.Role || item.role || 'Analyst',
        password: String(item.Password || item.password || 'password123'),
        active: true
      }));

      setUsers(prev => [...prev, ...importedUsers]);
      
      importedUsers.forEach(async (u) => {
        try { await setDoc(doc(db, 'users', u.id), u); } catch(e) {}
      });
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteUser = async (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.warn('Deleted from local session only.');
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setNewUserEmail(user.email);
    setNewUserPassword(user.password || '');
    setNewUserRole(user.role);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    const updatedUser = { 
      ...editingUser, 
      email: newUserEmail, 
      password: newUserPassword, 
      role: newUserRole 
    };

    setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
    
    try {
      await setDoc(doc(db, 'users', editingUser.id), updatedUser);
    } catch (err) {
      console.warn('Updated local session only.');
    }

    setEditingUser(null);
    e.target.reset();
    setTimeout(() => {
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('Analyst');
      setFormKey(prev => prev + 1);
    }, 50);
  };

  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-danger mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-gray-300">Access Denied</h2>
          <p className="text-gray-500 mt-2">Level 4 Admin clearance required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 flex flex-col relative overflow-x-hidden">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-primary w-6 h-6" />
          <h1 className="text-2xl font-black tracking-widest uppercase text-white">Admin Control Panel</h1>
        </div>
        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${cloudActive ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-orange-500/30 text-orange-500 bg-orange-500/5 animate-pulse'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${cloudActive ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          {cloudActive ? 'Cloud Synchronized' : 'Local Demo Mode'}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-medium tracking-wide text-sm rounded-t-lg border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Users size={16} /> User Management</div>
        </button>
        <button 
          onClick={() => setActiveTab('risk')}
          className={`px-4 py-2 font-medium tracking-wide text-sm rounded-t-lg border-b-2 transition-colors ${activeTab === 'risk' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <div className="flex items-center gap-2"><Sliders size={16} /> Risk Configuration</div>
        </button>
      </div>

      <div className="flex-1 bg-dark/50 border border-gray-800 rounded-xl p-6">
        {activeTab === 'users' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-300 mb-2">
              {editingUser ? 'Update Operator Credentials' : 'System Access Protocol'}
            </h2>
            {editingUser && (
              <button 
                onClick={() => { setEditingUser(null); setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('Analyst'); }}
                className="text-xs text-primary mb-4 block underline"
              >
                Cancel Edit
              </button>
            )}
              <button 
                onClick={() => fileInputRef.current.click()}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors"
              >
                <FileSpreadsheet size={16} /> Bulk Import (.xlsx)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleExcelUpload} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
            </div>
            
            <form 
              key={formKey}
              onSubmit={editingUser ? handleUpdateUser : handleAddUser} 
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end"
              autoComplete="off"
            >
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Operator Email</label>
                <input 
                  type="email" 
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  autoComplete="off"
                  className="w-full bg-dark border border-gray-700 rounded p-2 text-gray-300 focus:border-primary outline-none" 
                  placeholder="agent@orion.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Access Key (Password)</label>
                <input 
                  type="password" 
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-dark border border-gray-700 rounded p-2 text-gray-300 focus:border-primary outline-none" 
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wide">Clearance Role</label>
                <select 
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  className="w-full bg-dark border border-gray-700 rounded p-2 text-gray-300 focus:border-primary outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Operator">Operator</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={currentUser?.role !== 'Admin'}
                className={`${editingUser ? 'bg-orange-500 hover:bg-orange-600' : 'bg-primary hover:bg-blue-600'} text-white h-[42px] rounded font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Upload size={14} /> {editingUser ? 'Update Credentials' : 'Provision Access'}
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 text-xs uppercase tracking-widest text-gray-500">
                    <th className="pb-3 pl-2">Email Identity</th>
                    <th className="pb-3">Clearance Level</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 text-gray-300">{u.email}</td>
                      <td className="py-4">
                        <span className={`text-xs px-2 py-1 rounded border ${u.role === 'Admin' ? 'border-danger/30 text-danger bg-danger/10' : u.role === 'Operator' ? 'border-warning/30 text-warning bg-warning/10' : 'border-primary/30 text-primary bg-primary/10'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4">
                        <button 
                          onClick={async () => {
                            const updated = users.map(u2 => u2.id === u.id ? { ...u2, active: !u2.active } : u2);
                            setUsers(updated);
                            localStorage.setItem('orion_provisioned_users', JSON.stringify(updated));
                            try { await setDoc(doc(db, 'users', u.id), { ...u, active: !u.active }); } catch(e) {}
                          }}
                          className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${u.active ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' : 'text-gray-500 bg-gray-500/10 hover:bg-gray-500/20'}`}
                        >
                          <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div> 
                          {u.active ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td className="py-4 text-right pr-2">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => startEdit(u)}
                            className="text-gray-500 hover:text-primary transition-colors"
                            title="Edit Credentials"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-gray-500 hover:text-danger transition-colors"
                            title="Revoke Access"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-gray-300 mb-6">AI Decision Matrix Rules</h2>
            
            <div className="space-y-8">
              {/* Thresholds */}
              <div className="p-5 bg-darker border border-gray-800 rounded-lg">
                <h3 className="text-md font-medium text-gray-300 mb-4 tracking-wide">Risk Threshold Bounds</h3>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Flag Bound (Low)</label>
                    <input 
                      type="number" 
                      value={thresholds.low}
                      onChange={e => setThresholds({...thresholds, low: Number(e.target.value)})}
                      className="w-full bg-dark border border-gray-700 rounded p-2 text-white" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-2 block">Block Bound (High)</label>
                    <input 
                      type="number" 
                      value={thresholds.high}
                      onChange={e => setThresholds({...thresholds, high: Number(e.target.value)})}
                      className="w-full bg-dark border border-gray-700 rounded p-2 text-white" 
                    />
                  </div>
                </div>
              </div>

              {/* Sensitivity */}
              <div className="p-5 bg-darker border border-gray-800 rounded-lg">
                <h3 className="text-md font-medium text-gray-300 mb-4 tracking-wide">Engine Sensitivity</h3>
                <select 
                  value={sensitivity}
                  onChange={e => setSensitivity(e.target.value)}
                  className="w-full bg-dark border border-gray-700 rounded p-2 text-white"
                >
                  <option value="Low">Low (Fewer False Positives)</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="High">High (Strict Control)</option>
                </select>
              </div>

              {/* Rule Weights */}
              <div className="p-5 bg-darker border border-gray-800 rounded-lg">
                <h3 className="text-md font-medium text-gray-300 mb-4 tracking-wide">Algorithm Weights</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Amount Deviation</span>
                      <span>{weights.amount}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.amount} onChange={e => setWeights({...weights, amount: Number(e.target.value)})} className="w-full accent-primary" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Location Anomaly</span>
                      <span>{weights.location}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.location} onChange={e => setWeights({...weights, location: Number(e.target.value)})} className="w-full accent-primary" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Frequency Variance</span>
                      <span>{weights.frequency}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={weights.frequency} onChange={e => setWeights({...weights, frequency: Number(e.target.value)})} className="w-full accent-primary" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSaveSettings}
                  disabled={currentUser?.role !== 'Admin'}
                  className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Synchronizing...' : 'Deploy Global Configuration'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
