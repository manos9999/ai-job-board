import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import MatchScore from '../components/MatchScore';
import { FileText, Loader2, AlertCircle, Briefcase, Clock, Building } from 'lucide-react';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data);
    } catch {
      setError('Failed to load applications.');
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-500 mt-1">Track your job applications</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-6">Start applying to jobs to see your applications here</p>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.job || {};
            return (
              <div
                key={app._id}
                onClick={() => job._id && navigate(`/jobs/${job._id}`)}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title || 'Unknown Job'}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      {job.company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {job.company}
                        </span>
                      )}
                      {app.createdAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.matchScore !== undefined && (
                      <MatchScore score={app.matchScore} size="sm" />
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyles[app.status] || statusStyles.pending}`}>
                      {app.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
