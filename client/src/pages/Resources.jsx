import { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  X,
  Star,
  Layers,
  GraduationCap,
  Filter
} from 'lucide-react';
import api from '../utils/api';

/* ------------------ Static Data ------------------ */
const courseImages = [
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400&h=250&fit=crop',
];

/* ------------------ Component ------------------ */
export default function Resources() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  /* ------------------ Fetch Courses ------------------ */
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ Filters ------------------ */
  const topics = ['All', ...new Set(courses.map(c => c.topic).filter(Boolean))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      (course.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' || course.topic === activeFilter;

    return matchesSearch && matchesFilter;
  });

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0b0b1a]">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-3">
            Learning Resources
          </h1>
          <p className="text-gray-400">
            Browse {courses.length} available courses and improve your skills
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-10">
          {/* Search */}
          <div className="relative w-full lg:w-1/2">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course name or description..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#111128] border border-[#2a2a5a] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Filter size={16} className="text-gray-400" />
            {topics.map(topic => (
              <button
                key={topic}
                onClick={() => setActiveFilter(topic)}
                className={`px-4 py-1.5 rounded-full text-sm border transition ${
                  activeFilter === topic
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'border-[#2a2a5a] text-gray-400 hover:text-white'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg font-medium">
              No courses match your search
            </p>
            <p className="text-gray-600 text-sm">
              Try changing keywords or filters
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const img = courseImages[index % courseImages.length];

              return (
                <div
                  key={course.id}
                  className="bg-[#111128] border border-[#2a2a5a] rounded-2xl overflow-hidden hover:border-purple-500/40 transition"
                >
                  <img
                    src={img}
                    alt={course.name}
                    className="h-40 w-full object-cover"
                  />

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-1">
                      {course.name}
                    </h3>

                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {course.description || 'No description available'}
                    </p>

                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> 150+
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Self-paced
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white text-sm font-semibold"
                    >
                      View Course
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCourse && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCourse(null)}
        >
          <div className="absolute inset-0 bg-black/70" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#111128] border border-[#2a2a5a] rounded-3xl max-w-xl w-full"
          >
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="p-6 space-y-5">
              <h2 className="text-2xl font-extrabold text-white">
                {selectedCourse.name}
              </h2>

              <p className="text-gray-400 text-sm">
                {selectedCourse.description || 'No description provided'}
              </p>

              <div className="flex gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <GraduationCap size={16} className="text-purple-400" />
                  Certificate
                </span>
                <span className="flex items-center gap-1">
                  <Layers size={16} className="text-pink-400" />
                  All Levels
                </span>
                <span className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400" />
                  4.9 Rating
                </span>
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="w-full py-3 border border-[#2a2a5a] rounded-xl text-gray-400 hover:text-white hover:border-purple-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}