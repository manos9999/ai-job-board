import { useState, useEffect } from 'react';
import api from '../utils/api';
import MatchScore from '../components/MatchScore';
import SkillTag from '../components/SkillTag';
import {
  Plus, Briefcase, Users, Loader2, AlertCircle, Check, X,
  ChevronDown, ChevronUp, MapPin, DollarSign, Send
} from 'lucide-react';

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [posting, setPosting] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const [candidates, setCandidates] = useState({});
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: '',
    skills: [],
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/my');
      setJobs(res.data);
    } catch {
      setError('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        requirements: formData.requirements
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
      };
      await api.post('/jobs', payload);
      setSuccess('Job posted successfully!');
      setFormData({
        title: '', location: '', type: 'Full-time',
        salaryMin: '', salaryMax: '', description: '', requirements: '', skills: [],
      });
      setShowForm(false);
      fetchJobs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setPosting(false);
    }
  };

  const toggleExpand = async (jobId) => {
    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }
    setExpandedJob(jobId);
    if (!candidates[jobId]) {
      try {
        const res = await api.get(`/jobs/${jobId}/candidates`);
        setCandidates((prev) => ({ ...prev, [jobId]: res.data }));
      } catch {
        setCandidates((prev) => ({ ...prev, [jobId]: [] }));
      }
    }
  };

  const updateStatus = async (jobId, applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}`, { status });
      setCandidates((prev) => ({
        ...prev,
        [jobId]: prev[jobId].map((c) =>
          c._id === applicationId ? { ...c, status } : c
        ),
      }));
    } catch {
      setError('Failed to update status.');
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job postings and candidates</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 self-start"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Post Job Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Post a New Job</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Remote</option>
                  <option>Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary ($)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="50000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary ($)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="120000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                placeholder="5+ years of experience in React&#10;Strong understanding of TypeScript&#10;Experience with cloud services"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Add a skill and press Enter"
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <SkillTag key={skill} label={skill} onRemove={() => removeSkill(skill)} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={posting}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {posting ? 'Posting...' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Your Posted Jobs ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs posted yet</h3>
            <p className="text-gray-500">Click "Post New Job" to create your first listing</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => toggleExpand(job._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                          {job.type}
                        </span>
                      )}
                      {(job.salaryMin || job.salaryMax) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salaryMin && `$${Number(job.salaryMin).toLocaleString()}`}
                          {job.salaryMin && job.salaryMax && ' - '}
                          {job.salaryMax && `$${Number(job.salaryMax).toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      <Users className="w-4 h-4" />
                      {job.applicantCount ?? 0} applicants
                    </span>
                    {expandedJob === job._id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded candidates */}
              {expandedJob === job._id && (
                <div className="border-t border-gray-100 p-5 bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3">Candidates</h4>
                  {!candidates[job._id] ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading candidates...
                    </div>
                  ) : candidates[job._id].length === 0 ? (
                    <p className="text-gray-500 text-sm">No applications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {candidates[job._id]
                        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
                        .map((candidate) => (
                          <div
                            key={candidate._id}
                            className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {candidate.user?.name || 'Unknown'}
                              </p>
                              {candidate.user?.email && (
                                <p className="text-sm text-gray-500">{candidate.user.email}</p>
                              )}
                              {candidate.user?.skills && candidate.user.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {candidate.user.skills.slice(0, 5).map((skill) => (
                                    <SkillTag key={skill} label={skill} />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {candidate.matchScore !== undefined && (
                                <MatchScore score={candidate.matchScore} size="sm" />
                              )}
                              <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                candidate.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                candidate.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                candidate.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {candidate.status || 'pending'}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(job._id, candidate._id, 'accepted');
                                  }}
                                  className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200 transition"
                                  title="Accept"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(job._id, candidate._id, 'rejected');
                                  }}
                                  className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
