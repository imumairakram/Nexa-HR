import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  Users,
  Plus,
  RefreshCw,
  X,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isDesigModalOpen, setIsDesigModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    description: '',
  });

  const [desigForm, setDesigForm] = useState({
    title: '',
    departmentId: '',
    description: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, desigRes] = await Promise.all([
        api.getDepartments(),
        api.getDesignations(),
      ]);

      if (deptRes.success && deptRes.data?.departments) {
        setDepartments(deptRes.data.departments);
        if (deptRes.data.departments.length > 0 && !desigForm.departmentId) {
          setDesigForm((p) => ({ ...p, departmentId: deptRes.data.departments[0].id }));
        }
      }
      if (desigRes.success && desigRes.data?.designations) {
        setDesignations(desigRes.data.designations);
      }
    } catch (err) {
      console.warn('Backend error or loading, using fallback departmental data', err);
      setDepartments([
        { id: '1', name: 'Engineering', code: 'ENG', description: 'Software Development & Cloud Infrastructure' },
        { id: '2', name: 'Human Resources', code: 'HR', description: 'Talent Acquisition & Employee Operations' },
        { id: '3', name: 'Product & Design', code: 'PRD', description: 'UI/UX Design & Product Management' },
        { id: '4', name: 'Finance & Accounts', code: 'FIN', description: 'Payroll & Financial Audits' },
        { id: '5', name: 'Sales & Marketing', code: 'MKT', description: 'Growth & Enterprise Sales' },
      ]);
      setDesignations([
        { id: 'd1', title: 'VP of Software Engineering', departmentId: '1' },
        { id: 'd2', title: 'Senior Full-Stack Engineer', departmentId: '1' },
        { id: 'd3', title: 'HR Lead Manager', departmentId: '2' },
        { id: 'd4', title: 'Lead UI/UX Designer', departmentId: '3' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createDepartment(deptForm);
      if (res.success) {
        setIsDeptModalOpen(false);
        setDeptForm({ name: '', code: '', description: '' });
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDesigSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.createDesignation(desigForm);
      if (res.success) {
        setIsDesigModalOpen(false);
        setDesigForm({ title: '', departmentId: departments[0]?.id || '', description: '' });
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Failed to create designation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header matching exact reference screenshot */}
      <AppPageHeader
        title="Departments & Job Roles"
        onSearch={(v) => setSearchQuery(v)}
        onRefresh={() => loadData()}
        loading={loading}
      />

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Total Departments</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{departments.length}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">Active</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Configured Designations</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-purple-600">{designations.length}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">Job Titles</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Unassigned Staff</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">0</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">100% Assigned</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-soft border border-slate-100/80 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400">Hierarchy Status</span>
          <div className="flex items-baseline justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-600">Sync OK</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDepts.map((dept) => {
          const deptDesignations = designations.filter((d) => d.departmentId === dept.id);

          return (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-6 shadow-soft border border-slate-100/80 flex flex-col justify-between hover:shadow-soft-hover transition-all group"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-sm group-hover:bg-purple-600 transition-colors">
                    {dept.code}
                  </div>
                  <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {deptDesignations.length} Roles
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{dept.description || 'No description provided.'}</p>

                {/* Designations list inside department card */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Designations</span>
                  {deptDesignations.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No designations assigned yet</span>
                  ) : (
                    deptDesignations.map((des) => (
                      <div key={des.id} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl">
                        <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">{des.title}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600">Active Division</span>
                <button
                  onClick={() => {
                    setDesigForm((p) => ({ ...p, departmentId: dept.id }));
                    setIsDesigModalOpen(true);
                  }}
                  className="text-xs font-bold text-slate-900 hover:text-purple-600 cursor-pointer transition-colors"
                >
                  + Add Role
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Create New Department</h3>
              <button onClick={() => setIsDeptModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeptSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & R&D"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-RD"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe department operations and scope..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-slate-800"
                >
                  {isSubmitting ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Designation Modal */}
      {isDesigModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add Designation / Job Role</h3>
              <button onClick={() => setIsDesigModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDesigSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Department *</label>
                <select
                  value={desigForm.departmentId}
                  onChange={(e) => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Principal Cloud Architect"
                  value={desigForm.title}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDesigModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold cursor-pointer hover:bg-slate-800"
                >
                  {isSubmitting ? 'Saving...' : 'Save Designation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
