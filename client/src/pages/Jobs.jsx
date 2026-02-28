import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Jobs() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/jobs");
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load jobs:", err);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q)
    );
  });

  const handleApply = (job) => {
    if (!user) return navigate("/login");
    // এখানে চাইলে apply API call দিতে পারো
    alert(`Applied to: ${job.title}`);
  };

  if (loading) return <div style={{ padding: 20 }}>Loading jobs...</div>;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>{user ? "Jobs for You" : "Jobs"}</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title or company"
        style={{ padding: 10, width: "100%", margin: "12px 0" }}
      />

      {filteredJobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredJobs.map((job) => (
            <li
              key={job.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 10,
                borderRadius: 8,
              }}
            >
              <h3 style={{ margin: "0 0 6px" }}>{job.title}</h3>
              <p style={{ margin: 0, color: "#555" }}>
                {job.company} • {job.location} • {job.level}
              </p>

              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button onClick={() => handleApply(job)}>Apply</button>
                <button onClick={() => setSelectedJob(job)}>Details</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Simple Details Box */}
      {selectedJob && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0 }}>{selectedJob.title}</h2>
            <button onClick={() => setSelectedJob(null)}>X</button>
          </div>

          <p style={{ color: "#555" }}>
            {selectedJob.company} • {selectedJob.location} • {selectedJob.level}
          </p>

          {selectedJob.description && <p>{selectedJob.description}</p>}

          {Array.isArray(selectedJob.skills) && selectedJob.skills.length > 0 && (
            <p>
              <b>Skills:</b> {selectedJob.skills.join(", ")}
            </p>
          )}

          {(selectedJob.salary_min || selectedJob.salary_max) && (
            <p>
              <b>Salary:</b> ৳{selectedJob.salary_min} - ৳{selectedJob.salary_max}
            </p>
          )}
        </div>
      )}
    </div>
  );
}