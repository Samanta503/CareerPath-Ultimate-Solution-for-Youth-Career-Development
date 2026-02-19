import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Briefcase, BookOpen, TrendingUp, Target, Award, ArrowRight, Users, Star, MapPin, Building2, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ jobs: 0, courses: 0, enrollments: 0 });
  const [allJobs, setAllJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [jobsRes, coursesRes, enrollRes, skillsRes] = await Promise.all([
          api.get('/jobs').catch(() => ({ data: [] })),
          api.get('/courses').catch(() => ({ data: [] })),
          user ? api.get(`/enrollments?user_id=${user.id}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
          user ? api.get(`/user-skills?user_id=${user.id}`).catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        ]);
        const skills = Array.isArray(skillsRes.data) ? skillsRes.data : [];
        const jobsList = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        setUserSkills(skills);
        setAllJobs(jobsList);
        setStats({
          jobs: Array.isArray(jobsRes.data) ? jobsRes.data.length : 0,
          courses: Array.isArray(coursesRes.data) ? coursesRes.data.length : 0,
          enrollments: Array.isArray(enrollRes.data) ? enrollRes.data.length : 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoaded(true);
      }
    };
    fetchStats();
  }, [user]);

  // Compute average proficiency level (same logic as Jobs page)
  const proficiencyRank = { Beginner: 1, Intermediate: 2, Expert: 3, Professional: 4 };
  const avgProficiency = userSkills.length > 0
    ? userSkills.reduce((sum, s) => sum + (proficiencyRank[s.proficiency] || 1), 0) / userSkills.length
    : 0;
  const avgLevelLabel = avgProficiency >= 3.5 ? 'Professional'
    : avgProficiency >= 2.5 ? 'Expert'
    : avgProficiency >= 1.5 ? 'Intermediate'
    : avgProficiency > 0 ? 'Beginner' : 'N/A';

  // --- Real match calculation (same as Jobs page) ---
  const jobLevelRank = { 'Entry Level': 1, 'Mid Level': 2, Senior: 3 };
  const userSkillNames = userSkills.map(s => (s.skill_name || '').toLowerCase());

  const getMatchDetails = (job) => {
    if (!user || userSkills.length === 0) return { total: 0, skills: 0, experience: 0, track: 0, matchedSkills: [] };
    const jobSkills = (Array.isArray(job.skills) ? job.skills : []).map(s => s.toLowerCase());
    let matchedSkills = [];
    let skillScore = 0;
    if (jobSkills.length > 0) {
      matchedSkills = jobSkills.filter(js => userSkillNames.includes(js));
      skillScore = Math.round((matchedSkills.length / jobSkills.length) * 60);
    }
    const requiredLevel = jobLevelRank[job.level] || 1;
    let expScore = 0;
    if (avgProficiency >= requiredLevel) expScore = 20;
    else { const diff = requiredLevel - avgProficiency; if (diff <= 1) expScore = 12; else if (diff <= 2) expScore = 5; }
    let trackScore = 0;
    if (matchedSkills.length > 0) trackScore = matchedSkills.length >= jobSkills.length * 0.5 ? 20 : 10;
    return { total: skillScore + expScore + trackScore, skills: skillScore, experience: expScore, track: trackScore, matchedSkills };
  };

  const getScoreColor = (score) => score >= 80 ? '#10b981' : score >= 60 ? '#7c3aed' : '#f59e0b';
  const getMatchLabel = (score) => score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Fair';

  // Top 3 recommended jobs sorted by match score
  const recommendedJobs = [...allJobs]
    .map(job => ({ ...job, matchDetails: getMatchDetails(job) }))
    .sort((a, b) => b.matchDetails.total - a.matchDetails.total)
    .slice(0, 3);

  const dashCards = [
    { icon: Briefcase, label: 'Available Jobs', value: stats.jobs, gradient: 'from-[#7c3aed] to-[#6d28d9]', glow: '#7c3aed', link: '/jobs' },
    { icon: BookOpen, label: 'Courses', value: stats.courses, gradient: 'from-[#ec4899] to-[#db2777]', glow: '#ec4899', link: '/resources' },
    { icon: Award, label: 'My Enrollments', value: stats.enrollments, gradient: 'from-[#10b981] to-[#059669]', glow: '#10b981', link: '/resources' },
    { icon: TrendingUp, label: 'Skill Level', value: avgLevelLabel, gradient: 'from-[#3b82f6] to-[#2563eb]', glow: '#3b82f6', link: '/profile' },
  ];

  const quickActions = [
    { icon: Target, label: 'Find Matching Jobs', desc: 'AI-powered job matching based on your skills', link: '/jobs', iconColor: 'text-[#8b5cf6]', iconBg: 'bg-[#7c3aed]/12' },
    { icon: BookOpen, label: 'Browse Courses', desc: 'Explore learning resources to grow your skills', link: '/resources', iconColor: 'text-[#ec4899]', iconBg: 'bg-[#ec4899]/12' },
    { icon: Users, label: 'Contact Support', desc: 'Get help with your career development', link: '/contact', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/12' },
    { icon: Star, label: 'Update Profile', desc: 'Keep your skills and experience up to date', link: '/profile', iconColor: 'text-amber-400', iconBg: 'bg-amber-500/12' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 page-enter">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Welcome */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-500">Welcome back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Hello, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="text-gray-500 mt-1">Here's an overview of your career journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          {dashCards.map((card, i) => (
            <Link key={card.label} to={card.link} className="group">
              <div className="bg-[#111128]/80 border border-[#2a2a5a]/60 rounded-2xl p-5 sm:p-6 hover:border-[#7c3aed]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7c3aed]/5">
                <div
                  className={`w-11 h-11 rounded-xl bg-linear-to-br ${card.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                  style={{ boxShadow: `0 6px 20px ${card.glow}20` }}
                >
                  <card.icon size={20} className="text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {loaded ? card.value : '—'}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">{card.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-[#111128]/80 border border-[#2a2a5a]/60 rounded-2xl p-5 sm:p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-[#7c3aed] to-[#ec4899] flex items-center justify-center shadow-lg shadow-[#7c3aed]/20 shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 text-xs font-medium rounded-full">{avgLevelLabel}</span>
                  <span className="px-2.5 py-0.5 bg-pink-500/15 text-pink-400 text-xs font-medium rounded-full">{userSkills.length} skills</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-2">Skills</div>
              <div className="flex flex-wrap gap-1.5">
                {userSkills.length > 0 ? userSkills.slice(0, 5).map((s) => (
                  <span key={s.id} className="px-2.5 py-1 border border-[#2a2a5a] text-gray-400 text-xs rounded-full">
                    {s.skill_name}
                  </span>
                )) : (
                  <span className="text-xs text-gray-600">No skills added yet</span>
                )}
                {userSkills.length > 5 && (
                  <span className="px-2.5 py-1 text-[#8b5cf6] text-xs">+{userSkills.length - 5} more</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs */}
        {user && recommendedJobs.length > 0 && (
          <div className="mb-10">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recommended Jobs</h2>
              <Link to="/jobs" className="text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors">View all jobs →</Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => {
                const d = job.matchDetails;
                const scoreColor = getScoreColor(d.total);
                const label = getMatchLabel(d.total);
                const jobSkills = Array.isArray(job.skills) ? job.skills : [];
                const circumference = 2 * Math.PI * 30;
                const dashArray = (d.total / 100) * circumference;
                return (
                  <div key={job.id} className="bg-[#111128]/80 border border-[#2a2a5a]/60 rounded-2xl p-5 hover:border-[#7c3aed]/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7c3aed]/5 flex flex-col">
                    {/* Match circle + title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 70 70">
                          <circle cx="35" cy="35" r="30" fill="none" stroke="#1a1a3e" strokeWidth="4" />
                          <circle cx="35" cy="35" r="30" fill="none" stroke={scoreColor} strokeWidth="4" strokeDasharray={`${dashArray} ${circumference}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{d.total}%</span>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">{job.title}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <Building2 size={11} /> <span className="truncate">{job.company}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin size={11} /> <span className="truncate">{job.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Match label */}
                    <span className="text-xs font-semibold mb-3" style={{ color: scoreColor }}>{label} Match</span>

                    {/* Skills preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {jobSkills.slice(0, 4).map((skill, i) => {
                        const matched = d.matchedSkills.includes(skill.toLowerCase());
                        return (
                          <span key={i} className={`px-2 py-0.5 text-[10px] rounded-full border ${
                            matched ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                          }`}>
                            {matched && '✓ '}{skill}
                          </span>
                        );
                      })}
                      {jobSkills.length > 4 && <span className="text-[10px] text-gray-600 px-1">+{jobSkills.length - 4}</span>}
                    </div>

                    {/* Breakdown bars */}
                    <div className="space-y-1.5 mb-4">
                      {[
                        { label: 'Skills', val: d.skills, max: 60 },
                        { label: 'Exp', val: d.experience, max: 20 },
                        { label: 'Track', val: d.track, max: 20 },
                      ].map(b => (
                        <div key={b.label} className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500 w-8">{b.label}</span>
                          <div className="flex-1 h-1 bg-[#1a1a3e] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${(b.val / b.max) * 100}%`, backgroundColor: scoreColor }} />
                          </div>
                          <span className="text-[10px] text-gray-400 w-8 text-right">{b.val}/{b.max}</span>
                        </div>
                      ))}
                    </div>

                    {/* Apply button */}
                    <Link to="/jobs" className="mt-auto">
                      <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-[#7c3aed] to-[#ec4899] rounded-xl text-white text-xs font-semibold hover:shadow-lg hover:shadow-[#7c3aed]/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                        <Send size={12} /> Apply Now
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
          <span className="text-xs text-gray-600">{quickActions.length} actions</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.link}>
              <div className="group bg-[#111128]/80 border border-[#2a2a5a]/60 rounded-2xl p-5 hover:border-[#7c3aed]/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#7c3aed]/5 flex items-center gap-4">
                <div className={`w-11 h-11 ${action.iconBg} rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                  <action.icon size={20} className={action.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm">{action.label}</h3>
                  <p className="text-gray-500 text-xs mt-0.5 truncate">{action.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-600 group-hover:text-[#8b5cf6] transition-all duration-200 group-hover:translate-x-0.5 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
