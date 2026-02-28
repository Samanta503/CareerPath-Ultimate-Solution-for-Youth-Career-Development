import { useState, useEffect } from 'react';
import {
  Search,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  X,
  Star,
  Layers,
  GraduationCap,
  Award,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';

/* ------------------ Images ------------------ */
const courseImages = [
  'https://images.unsplash.com/photo-1581090700227-99f3f0d48e13?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1581093458367-07d0ed91f9b6?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1581093588401-cf6678f1d8db?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1581093459087-cb27a2f1f8e9?w=400&h=250&fit=crop',
];

/* ------------------ Colors ------------------ */
const topicColors = {
  AI: 'bg-purple-500/15 text-purple-400',
  Web: 'bg-blue-500/15 text-blue-400',
  Data: 'bg-emerald-500/15 text-emerald-400',
  Mobile: 'bg-pink-500/15 text-pink-400',
  Cloud: 'bg-cyan-500/15 text-cyan-400',
  default: 'bg-[#7c3aed]/15 text-[#8b5cf6]',
};

function getTopicColor(topic) {
  const key = Object.keys(topicColors).find((k) =>
    (topic || '').toLowerCase().includes(k.toLowerCase())
  );
  return topicColors[key] || topicColors['default'];
}

/* ------------------ Component ------------------ */
export default function Resources() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Tabs ------------------ */
  const topics = ['All', ...new Set(courses.map((c) => c.topic).filter(Boolean))];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === 'All' || c.topic === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0b0b1a]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Learning Resources
          </h1>
          <p className="text-gray-400">
            Browse {courses.length} courses and boost your skills
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#111128] border border-[#2a2a5a] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 flex-wrap mb-8">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setActiveTab(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeTab === topic
                  ? 'bg-purple-600 border-purple-600 text-white'
                  : 'border-[#2a2a5a] text-gray-400 hover:text-white'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-600" />
            No courses found for this tab/search.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const img = courseImages[index % courseImages.length];
              const tc = getTopicColor(course.topic);

              return (
                <div
                  key={course.id}
                  className="bg-[#111128] border border-[#2a2a5a] rounded-2xl overflow-hidden hover:shadow-lg hover:border-purple-500 transition cursor-pointer"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="h-40 w-full overflow-hidden">
                    <img src={img} alt={course.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1">{course.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {course.description || 'No description available.'}
                    </p>

                    <div className="flex justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> 150+
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Self-paced
                      </span>
                    </div>

                    <span className={`inline-block px-3 py-1 text-xs rounded-full ${tc} mb-2`}>
                      {course.topic}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selectedCourse && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <div className="absolute inset-0 bg-black/70" />
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-xl w-full bg-[#111128] border border-[#2a2a5a] rounded-3xl p-6 space-y-5"
            >
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-extrabold text-white">{selectedCourse.name}</h2>
              <p className="text-gray-400 text-sm">{selectedCourse.description}</p>

              <div className="grid grid-cols-2 gap-3">
                {['Core fundamentals', 'Hands-on projects', 'Industry best practices', 'Portfolio-ready', 'Career prep'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <CheckCircle size={14} className="text-green-400" /> {item}
                  </div>
                ))}
              </div>

              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold">
                Enroll Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}