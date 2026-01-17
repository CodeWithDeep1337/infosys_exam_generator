import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig"; // Java Backend
import "bootstrap/dist/css/bootstrap.min.css";

const StudentMaterials = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  
  useEffect(() => {
    fetchCourses();
  },[]);

  const fetchCourses = async () => {
      try {
          const res = await axios.get("/courses"); // Java
          setCourses(res.data);
      } catch (err) {
          console.error("Error fetching courses", err);
      }
  };

  const handleCourseChange = async (e) => {
      const courseId = e.target.value;
      setSelectedCourse(courseId);
      setSelectedSubject("");
      setSelectedTopic("");
      setMaterials([]);
      if(courseId) {
          try {
              const res = await axios.get(`/subjects/course/${courseId}`);
              setSubjects(res.data);
          } catch(err) { console.error(err); }
      }
  };

  const handleSubjectChange = async (e) => {
      const subjectId = e.target.value;
      setSelectedSubject(subjectId);
      setSelectedTopic("");
      setMaterials([]);
      if(subjectId) {
          try {
              const res = await axios.get(`/topics/subject/${subjectId}`);
              setTopics(res.data);
          } catch(err) { console.error(err); }
      }
  };

  const handleTopicChange = async (e) => {
      const topicId = e.target.value;
      setSelectedTopic(topicId);
      if(topicId) {
          try {
              const res = await axios.get(`/materials/topic/${topicId}`);
              setMaterials(res.data);
          } catch(err) { console.error(err); }
      }
  };

  return (
    <div className="container py-5">
      
      {/* --- Header --- */}
      <div className="text-center mb-5 slide-down">
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-2">
               <i className="bi bi-book-half me-2"></i> Learning Hub
          </span>
          <h2 className="fw-bold">Browse Materials</h2>
          <p className="text-muted">Access your course notes, videos, and study guides.</p>
      </div>

      <div className="card shadow-lg border-0 rounded-4 overflow-hidden fade-in" style={{animationDelay: '0.2s'}}>
          <div className="card-body p-4 p-lg-5">
              <div className="row g-3">
                  <div className="col-md-4">
                      <div className="form-floating">
                          <select className="form-select border-0 bg-light rounded-3 fw-bold" id="courseSelect" value={selectedCourse} onChange={handleCourseChange}>
                              <option value="">Select Course</option>
                              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                          </select>
                          <label htmlFor="courseSelect" className="text-muted">1. Choose Course</label>
                      </div>
                  </div>
                  <div className="col-md-4">
                      <div className="form-floating">
                          <select className="form-select border-0 bg-light rounded-3 fw-bold" id="subjectSelect" value={selectedSubject} onChange={handleSubjectChange} disabled={!selectedCourse}>
                              <option value="">Select Subject</option>
                              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <label htmlFor="subjectSelect" className="text-muted">2. Choose Subject</label>
                      </div>
                  </div>
                  <div className="col-md-4">
                      <div className="form-floating">
                          <select className="form-select border-0 bg-light rounded-3 fw-bold" id="topicSelect" value={selectedTopic} onChange={handleTopicChange} disabled={!selectedSubject}>
                              <option value="">Select Topic</option>
                              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                          <label htmlFor="topicSelect" className="text-muted">3. Choose Topic</label>
                      </div>
                  </div>
              </div>

              <hr className="my-5 border-light" />
              
              {materials.length > 0 ? (
                  <div className="fade-in">
                      <h5 className="fw-bold mb-4">Available Resources</h5>
                      <div className="row g-3">
                          {materials.map(m => (
                              <div className="col-md-6" key={m.id}>
                                  <a href={m.link || `http://localhost:8081/api/materials/download/${m.filePath}`} target="_blank" rel="noopener noreferrer" 
                                     className="card h-100 border-0 bg-light hover-lift text-decoration-none transition">
                                      <div className="card-body d-flex align-items-center p-3">
                                          <div className={`p-3 rounded-circle me-3 flex-shrink-0 ${m.type === 'VIDEO' || m.type === 'YOUTUBE' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                              <i className={`bi ${m.type === 'VIDEO' || m.type === 'YOUTUBE' ? 'bi-play-fill' : 'bi-file-earmark-text-fill'} fs-4`}></i>
                                          </div>
                                          <div className="flex-grow-1 overflow-hidden">
                                              <h6 className="fw-bold mb-1 text-dark text-truncate">{m.title}</h6>
                                              <span className="badge bg-white text-muted border">{m.type}</span>
                                          </div>
                                          <div className="text-muted opacity-50">
                                              <i className="bi bi-box-arrow-up-right"></i>
                                          </div>
                                      </div>
                                  </a>
                              </div>
                          ))}
                      </div>
                  </div>
              ) : (
                  selectedTopic ? (
                       <div className="text-center py-5">
                          <i className="bi bi-folder2-open fs-1 text-muted opacity-25 mb-3 d-block"></i>
                          <p className="text-muted">No materials found for this topic.</p>
                      </div>
                  ) : (
                      <div className="text-center py-5">
                          <div className="d-inline-block p-4 rounded-circle bg-light mb-3">
                              <i className="bi bi-cursor fs-1 text-muted opacity-50"></i>
                          </div>
                          <p className="text-muted fs-5">Select a topic above to view learning materials.</p>
                      </div>
                  )
              )}
          </div>
      </div>
      
      <style jsx>{`
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.08)!important; background: white !important; }
        .transition { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .slide-down { animation: slideDown 0.8s ease-out forwards; }
        .fade-in { opacity: 0; animation: fadeIn 0.8s ease-out forwards; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default StudentMaterials;
