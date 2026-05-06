import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
  BarChart3, Briefcase, FileText, Users, TrendingUp,
  CheckCircle, Clock, XCircle, Eye, Loader2, AlertCircle
} from 'lucide-react';

export default function Analytics() {
  const { isEmployer } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setData(res.data);
    } catch {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  if (isEmployer) {
    return <EmployerAnalytics data={data} />;
  }

  return <JobseekerAnalytics data={data} />;
}

function JobseekerAnalytics({ data }) {
  const statusBreakdown = data.statusBreakdown || {};
  const totalApplications = data.totalApplications || 0;
  const avgMatchScore = data.avgMatchScore || data.averageMatchScore || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics
        </h1>
        <p className="text-gray-500 mt-1">Overview of your job search activity</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Match Score</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(avgMatchScore)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Acceptance Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalApplications > 0
                  ? Math.round(((statusBreakdown.accepted || 0) / totalApplications) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            label="Pending"
            count={statusBreakdown.pending || 0}
            total={totalApplications}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
          />
          <StatusCard
            label="Reviewed"
            count={statusBreakdown.reviewed || 0}
            total={totalApplications}
            icon={<Eye className="w-5 h-5" />}
            color="blue"
          />
          <StatusCard
            label="Accepted"
            count={statusBreakdown.accepted || 0}
            total={totalApplications}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatusCard
            label="Rejected"
            count={statusBreakdown.rejected || 0}
            total={totalApplications}
            icon={<XCircle className="w-5 h-5" />}
            color="red"
          />
        </div>
      </div>

      {/* Match score visualization */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Average Match Score</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                avgMatchScore >= 70 ? 'bg-green-500' :
                avgMatchScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(avgMatchScore, 100)}%` }}
            />
          </div>
          <span className="text-lg font-bold text-gray-900 w-16 text-right">
            {Math.round(avgMatchScore)}%
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {avgMatchScore >= 70
            ? 'Great! Your skills strongly align with the jobs you apply to.'
            : avgMatchScore >= 40
            ? 'Good match rate. Consider updating your skills to improve.'
            : 'Consider updating your profile skills to improve match scores.'}
        </p>
      </div>
    </div>
  );
}

function EmployerAnalytics({ data }) {
  const statusBreakdown = data.statusBreakdown || {};
  const totalJobs = data.totalJobs || 0;
  const totalApplicants = data.totalApplicants || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          Analytics
        </h1>
        <p className="text-gray-500 mt-1">Overview of your hiring activity</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Jobs Posted</p>
              <p className="text-2xl font-bold text-gray-900">{totalJobs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Applicants</p>
              <p className="text-2xl font-bold text-gray-900">{totalApplicants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Applicants/Job</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalJobs > 0 ? Math.round(totalApplicants / totalJobs) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicant Status Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusCard
            label="Pending"
            count={statusBreakdown.pending || 0}
            total={totalApplicants}
            icon={<Clock className="w-5 h-5" />}
            color="yellow"
          />
          <StatusCard
            label="Reviewed"
            count={statusBreakdown.reviewed || 0}
            total={totalApplicants}
            icon={<Eye className="w-5 h-5" />}
            color="blue"
          />
          <StatusCard
            label="Accepted"
            count={statusBreakdown.accepted || 0}
            total={totalApplicants}
            icon={<CheckCircle className="w-5 h-5" />}
            color="green"
          />
          <StatusCard
            label="Rejected"
            count={statusBreakdown.rejected || 0}
            total={totalApplicants}
            icon={<XCircle className="w-5 h-5" />}
            color="red"
          />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, total, icon, color }) {
  const colors = {
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', bar: 'bg-yellow-400' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', bar: 'bg-blue-400' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', bar: 'bg-green-400' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', bar: 'bg-red-400' },
  };

  const c = colors[color] || colors.blue;
  const percent = total > 0 ? (count / total) * 100 : 0;

  return (
    <div className={`p-4 rounded-xl border ${c.bg} ${c.border}`}>
      <div className={`flex items-center gap-2 ${c.text} mb-2`}>
        {icon}
        <span className="font-medium text-sm">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{count}</p>
      <div className="mt-2 bg-white/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${c.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">{Math.round(percent)}% of total</p>
    </div>
  );
}
