import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MatchScore from '../components/MatchScore';
import SkillTag from '../components/SkillTag';
import {
  MapPin, Briefcase, DollarSign, Clock, Loader2, AlertCircle,
  Send, FileText, CheckCircle, X, ArrowLeft, Users
} from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const { user, isEmployer } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCover, setGeneratingCover] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [showCandidates, setShowCandidates] = useState(false);

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      const jobData = res.data;
      setJob(jobData);

      if (jobData.matchScore !== undefined) {
        setMatchData({
          score: jobData.matchScore,
          matchedSkills: jobData.matchedSkills || [],
          missingSkills: jobData.missingSkills || [],
        });
      }

      if (jobData.hasApplied) {
        setApplied(true);
      }
    } catch {
      setError('Failed to load job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, { coverLetter });
      setApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply.');
    } finally {
      setApplying(false);
    }
  };

  const generateCoverLetter = async () => {
    setGeneratingCover(true);
    try {
      const res = await api.post(`/jobs/${id}/cover-letter`);
      setCoverLetter(res.data.coverLetter);
      setShowCoverLetter(true);
    } catch {
      setError('Failed to generate cover letter.');
    } finally {
      setGeneratingCover(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await api.get(`/jobs/${id}/candidates`);
      setCandidates(res.data);
      setShowCandidates(true);
    } catch {
      setError('Failed to load candidates.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const employerId = job.employer?._id || job.employer;
  const isOwner = isEmployer && user && employerId === user._id;
  const matchedSkills = matchData?.matchedSkills || [];
  const missingSkills = matchData?.missingSkills || [];
  const matchScore = matchData?.score ?? job.matchScore;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/jobs" className="text-blue-600 hover:underline flex items-center gap-1 mb-6 text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600 mt-1 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                {job.company}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                )}
                {job.type && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.type}
                  </span>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.salaryMin && `$${Number(job.salaryMin).toLocaleString()}`}
                    {job.salaryMin && job.salaryMax && ' - '}
                    {job.salaryMax && `$${Number(job.salaryMax).toLocaleString()}`}
                  </span>
                )}
              </div>
            </div>

            {user && user.role === 'jobseeker' && matchScore !== undefined && (
              <div className="shrink-0 text-center">
                <MatchScore score={matchScore} size="lg" />
                <p className="text-xs text-gray-500 mt-1">Match Score</p>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => {
                  let variant = 'default';
                  if (matchedSkills.includes(skill)) variant = 'matched';
                  else if (missingSkills.includes(skill)) variant = 'missing';
                  return <SkillTag key={skill} label={skill} variant={variant} />;
                })}
              </div>
              {user && user.role === 'jobseeker' && (matchedSkills.length > 0 || missingSkills.length > 0) && (
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-200 inline-block" />
                    Matched skills
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-200 inline-block" />
                    Skills to develop
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Jobseeker actions */}
          {user && user.role === 'jobseeker' && (
            <div className="border-t border-gray-100 pt-6 space-y-4">
              {applied ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">You have already applied to this job</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    {applying ? 'Applying...' : 'Apply Now'}
                  </button>
                  <button
                    onClick={generateCoverLetter}
                    disabled={generatingCover}
                    className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    {generatingCover ? 'Generating...' : 'Generate Cover Letter'}
                  </button>
                </div>
              )}

              {/* Cover letter modal */}
              {showCoverLetter && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Generated Cover Letter</h3>
                      <button onClick={() => setShowCoverLetter(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        rows={15}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none text-sm leading-relaxed"
                      />
                    </div>
                    <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
                      <button
                        onClick={() => setShowCoverLetter(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                      >
                        Close
                      </button>
                      {!applied && (
                        <button
                          onClick={() => {
                            setShowCoverLetter(false);
                            handleApply();
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Apply with Cover Letter
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Employer actions */}
          {isOwner && (
            <div className="border-t border-gray-100 pt-6">
              <button
                onClick={fetchCandidates}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Users className="w-5 h-5" />
                View Candidates
              </button>

              {showCandidates && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Candidates ({candidates.length})
                  </h3>
                  {candidates.length === 0 ? (
                    <p className="text-gray-500">No applications yet.</p>
                  ) : (
                    candidates.map((candidate) => (
                      <div
                        key={candidate._id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{candidate.user?.name || 'Unknown'}</p>
                          {candidate.user?.skills && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {candidate.user.skills.slice(0, 4).map((skill) => (
                                <SkillTag key={skill} label={skill} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {candidate.matchScore !== undefined && (
                            <MatchScore score={candidate.matchScore} size="sm" />
                          )}
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            candidate.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            candidate.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            candidate.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {candidate.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
