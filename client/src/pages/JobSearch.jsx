import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import MatchScore from '../components/MatchScore';
import SkillTag from '../components/SkillTag';
import { Search, MapPin, Briefcase, DollarSign, Loader2, AlertCircle, Filter, ExternalLink } from 'lucide-react';

export default function JobSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    location: '',
    type: [],
    salaryMin: '',
    salaryMax: '',
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
  const locations = ['', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Remote'];

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (filters.location) params.location = filters.location;
      if (filters.type.length > 0) params.type = filters.type.join(',');
      if (filters.salaryMin) params.salaryMin = filters.salaryMin;
      if (filters.salaryMax) params.salaryMax = filters.salaryMax;

      const res = await api.get('/jobs', { params });
      setJobs(res.data);
    } catch {
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleType = (type) => {
    setFilters((prev) => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter((t) => t !== type)
        : [...prev.type, type],
    }));
  };

  const applyFilters = () => {
    fetchJobs();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({ location: '', type: [], salaryMin: '', salaryMax: '' });
    setSearch('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Jobs</h1>
        <p className="text-gray-500">Discover opportunities matched to your skills</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs by title, skill, or keyword..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 md:hidden"
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="flex gap-8">
        {/* Filters sidebar */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
                Clear all
              </button>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              >
                <option value="">All Locations</option>
                {locations.filter(Boolean).map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <div className="space-y-2">
                {jobTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={() => toggleType(type)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters({ ...filters, salaryMin: e.target.value })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters({ ...filters, salaryMax: e.target.value })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            <button
              onClick={applyFilters}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Job listings */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="text-center py-20">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}

          <div className="space-y-4">
            {jobs.map((job) => {
              const isExternal = job.source === 'jsearch';
              return (
                <div
                  key={job._id}
                  onClick={() => isExternal ? window.open(job.applyLink, '_blank') : navigate(`/jobs/${job._id}`)}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition">
                          {job.title}
                        </h3>
                        {isExternal && (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            Live
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.company}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
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
                        {(job.salaryMin > 0 || job.salaryMax > 0) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salaryMin > 0 && `$${Number(job.salaryMin).toLocaleString()}`}
                            {job.salaryMin > 0 && job.salaryMax > 0 && ' - '}
                            {job.salaryMax > 0 && `$${Number(job.salaryMax).toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 5).map((skill) => (
                            <SkillTag key={skill} label={skill} />
                          ))}
                          {job.skills.length > 5 && (
                            <span className="text-xs text-gray-400 self-center">+{job.skills.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </div>

                    {user && user.role === 'jobseeker' && job.matchScore !== undefined && (
                      <div className="shrink-0">
                        <MatchScore score={job.matchScore} size="md" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
