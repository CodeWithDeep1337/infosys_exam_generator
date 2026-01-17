import React, { useState, useEffect } from "react";
import axios from "../../utils/axiosConfig"; // Java Backend
import apiNode from "../../services/apiNode"; // Node Backend
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const StudentRoadmap = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [syllabus, setSyllabus] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [coursesRes, statsRes] = await Promise.all([
                axios.get("/courses"),
                apiNode.get("/quiz/stats")
            ]);

            setCourses(coursesRes.data);
            setStats(statsRes.data);

            if (coursesRes.data.length > 0) {
                // Default to first course
                handleCourseSelect(coursesRes.data[0].id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Error fetching data", err);
            setLoading(false);
        }
    };

    const handleCourseSelect = async (courseId) => {
        try {
            setLoading(true);
            const course = courses.find(c => c.id === parseInt(courseId));
            setSelectedCourse(course);

            // Fetch Subjects for this course
            const subjectsRes = await axios.get(`/subjects/course/${courseId}`);
            const subjects = subjectsRes.data;

            // Fetch Topics for each subject to build the full syllabus tree
            const fullSyllabus = await Promise.all(subjects.map(async (subj) => {
                try {
                    const topicsRes = await axios.get(`/topics/subject/${subj.id}`);
                    return { ...subj, topics: topicsRes.data };
                } catch (e) {
                    return { ...subj, topics: [] };
                }
            }));

            setSyllabus(fullSyllabus);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching syllabus", err);
            setLoading(false);
        }
    };

    const isWeakTopic = (topicName) => {
        if (!stats?.weakTopics) return false;
        return stats.weakTopics.includes(topicName);
    };

    return (
        <div className="container py-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-5 fade-in">
                <div>
                    <h2 className="fw-bold mb-1">
                        <i className="bi bi-map-fill text-primary me-2"></i> Learning Roadmap
                    </h2>
                    <p className="text-muted">Visualizing your path to mastery.</p>
                </div>
                <div className="d-flex gap-2">
                    <select 
                        className="form-select border-0 shadow-sm bg-white fw-bold text-primary" 
                        style={{width: 'auto'}}
                        onChange={(e) => handleCourseSelect(e.target.value)}
                        value={selectedCourse?.id || ""}
                    >
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted">Loading your map...</p>
                </div>
            ) : (
                <div className="roadmap-container position-relative">
                    {/* Vertical Line */}
                    <div className="position-absolute top-0 bottom-0 start-50 translate-middle-x bg-secondary bg-opacity-25" style={{width: '4px', zIndex: 0}}></div>

                    {syllabus.map((subject, sIndex) => (
                        <div key={subject.id} className="row g-0 mb-5 fade-in" style={{animationDelay: `${sIndex * 0.1}s`}}>
                            
                            {/* Subject Header (Center Pill) */}
                            <div className="col-12 text-center mb-4 position-relative z-1">
                                <span className="badge bg-white text-dark shadow-sm border px-4 py-2 rounded-pill fs-6 fw-bold">
                                    {subject.name}
                                </span>
                            </div>

                            {/* Topics */}
                            {subject.topics.map((topic, tIndex) => {
                                const isLeft = tIndex % 2 === 0;
                                const isWeak = isWeakTopic(topic.name);
                                
                                return (
                                    <div key={topic.id} className="row g-0 w-100 mb-4 align-items-center position-relative z-1">
                                        {/* Left/Right Content Side */}
                                        <div className={`col-md-5 ${isLeft ? 'order-md-1 text-md-end pe-md-5' : 'order-md-3 ps-md-5'}`}>
                                            <div className={`card border-0 shadow-sm hover-lift transition ${isWeak ? 'ring-2 ring-danger' : ''} ${isLeft ? 'ms-auto' : ''}`} style={{maxWidth: '400px'}}>
                                                <div className="card-body p-3">
                                                    {isWeak && <span className="badge bg-danger bg-opacity-10 text-danger mb-2">Recommended Focus</span>}
                                                    <h6 className="fw-bold mb-1">{topic.name}</h6>
                                                    <p className="small text-muted mb-2">{topic.description || "Master this concept to move forward."}</p>
                                                    <div className="d-flex gap-2 justify-content-md-end">
                                                        <Link to={`/student/materials?topic=${topic.id}`} className="btn btn-xs btn-light text-primary rounded-pill small fw-bold">
                                                            <i className="bi bi-collection-play me-1"></i> Study
                                                        </Link>
                                                        <Link to="/student/lobby" className="btn btn-xs btn-light text-success rounded-pill small fw-bold">
                                                            <i className="bi bi-check-circle me-1"></i> Test
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center Dot */}
                                        <div className="col-md-2 text-center position-relative d-none d-md-block order-md-2">
                                            <div className={`d-inline-flex align-items-center justify-content-center rounded-circle border border-4 border-white shadow-sm ${isWeak ? 'bg-danger text-white' : 'bg-primary text-white'}`} 
                                                 style={{width: '40px', height: '40px'}}>
                                                {isWeak ? <i className="bi bi-exclamation"></i> : <i className="bi bi-check"></i>}
                                            </div>
                                        </div>

                                        {/* Empty filler for balance */}
                                        <div className={`col-md-5 ${isLeft ? 'order-md-3' : 'order-md-1'}`}></div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1)!important; }
                .transition { transition: all 0.3s ease; }
                .ring-2 { box-shadow: 0 0 0 2px #dc3545; }
                .btn-xs { font-size: 0.75rem; padding: 0.25rem 0.6rem; }
            `}</style>
        </div>
    );
};

export default StudentRoadmap;
