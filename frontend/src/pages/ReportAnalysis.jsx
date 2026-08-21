import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, Upload, FileText, CheckCircle2, AlertTriangle, RefreshCw, Calendar, FileUp, Clock, Target, Users, Sparkles, BookOpen, BookCheck, ShieldAlert
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import NotificationCenter from '../components/NotificationCenter';
import { fetchReports, uploadReportFile, fetchChildren } from '../services/api';
import './ReportAnalysis.css';

const ReportAnalysis = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [reportsHistory, setReportsHistory] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [activeTab, setActiveTab] = useState('assessment');
  const [activeChild, setActiveChild] = useState(null);

  // OCR Processing States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [addNewRequested, setAddNewRequested] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    const kids = await fetchChildren();
    if (kids.length > 0) {
      let currentChild = kids[0];
      const storedChildId = localStorage.getItem('learnlytics_active_child_id');
      if (storedChildId) {
        const found = kids.find(k => k._id === storedChildId);
        if (found) currentChild = found;
      }
      setActiveChild(currentChild);
      localStorage.setItem('learnlytics_active_child_id', currentChild._id);
      loadReportsForChild(currentChild._id, false);
    }
  };

  const loadReportsForChild = async (childId, autoSelect = false) => {
    if (!childId) return;
    try {
      const data = await fetchReports(childId);
      setReportsHistory(data);
      setSuccessMessage('');
      if (data.length > 0) {
        if (autoSelect) {
          setActiveReport(data[0]);
        } else {
          setActiveReport(prev => {
            if (prev) {
              const stillExists = data.find(r => r._id === prev._id);
              return stillExists || data[0];
            }
            return data[0];
          });
        }
      } else {
        setActiveReport(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileInputChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!activeChild) {
        setErrorMessage('Please select a student profile before uploading.');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
      setSuccessMessage('');
      setIsUploading(true);
      setUploadProgress(20);
      setScanStepText(`Uploading document "${file.name}" to Learnlytics AI Server...`);

      const formData = new FormData();
      formData.append('reportFile', file);
      formData.append('title', file.name);
      formData.append('childId', activeChild._id);

      setTimeout(async () => {
        setUploadProgress(60);
        setScanStepText('Analyzing the uploaded student academic report...');
        
        try {
          const resultReport = await uploadReportFile(formData);
          setUploadProgress(100);
          setScanStepText('AI Report Analysis Complete & Saved in MongoDB!');
          setSuccessMessage(`Report uploaded successfully. File: ${file.name}`);
          
          setTimeout(() => {
            setIsUploading(false);
            setActiveReport(resultReport);
            setAddNewRequested(false);
            loadReportsForChild(activeChild._id, false);
          }, 600);
        } catch (err) {
          console.error(err);
          setIsUploading(false);
          setErrorMessage(err.response?.data?.error || err.message || 'Unable to analyze this report. Please upload a clear PDF or image of the student report.');
        } finally {
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }, 1000);
    }
  };

  return (
    <div className="learnlytics-app-container">
      <Navbar 
        onOpenNotifications={() => setNotifOpen(true)} 
        activeChild={activeChild}
        onSelectChild={(child) => {
          setActiveChild(child);
          localStorage.setItem('learnlytics_active_child_id', child._id);
          loadReportsForChild(child._id, true);
        }}
      />

      <div className="layout-body">
        <Sidebar />

        <main className="page-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">AI Academic Report Analyzer</h1>
              <p className="page-subtitle">Upload student report (PDF/Image) for automatic subject evaluations, goals, weekly study plans, and parent guidance.</p>
            </div>
            <div className="header-action-group">
              <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                <Upload size={18} />
                <span>Upload Report Card (PDF / Image)</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                accept=".pdf,image/png,image/jpeg,image/jpg" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="card" style={{ marginBottom: '24px', background: '#fef2f2', border: '1.5px solid #fca5a5', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} color="#dc2626" />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#991b1b', fontWeight: 700 }}>Unable to analyze this report.</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c' }}>{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="card" style={{ marginBottom: '24px', background: '#f0fdf4', border: '1.5px solid #86efac', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#16a34a" />
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#14532d', fontWeight: 700 }}>Report uploaded successfully.</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#15803d' }}>
                    Uploaded file: {selectedFile?.name || successMessage.split('File: ')[1] || 'Report File'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loader Box */}
          {isUploading && (
            <div className="card" style={{ marginBottom: '24px', background: '#eff6ff', border: '1.5px solid #93c5fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <RefreshCw size={28} className="spin text-primary" />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>Analyzing Academic Report Document...</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{scanStepText}</p>
                  {selectedFile && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                      File: {selectedFile.name} ({selectedFile.type || 'unknown type'})
                    </p>
                  )}
                </div>
                <strong style={{ fontSize: '18px', color: '#2563eb' }}>{uploadProgress}%</strong>
              </div>
            </div>
          )}

          {/* Saved Reports Selector Bar (Visible if there is history) */}
          {reportsHistory.length > 0 && !isUploading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'white', padding: '14px 20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="#2563eb" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>Saved Reports:</span>
                <select 
                  value={activeReport ? activeReport._id : ''} 
                  onChange={(e) => {
                    const found = reportsHistory.find(r => r._id === e.target.value);
                    if (found) {
                      setActiveReport(found);
                      setAddNewRequested(false);
                      setErrorMessage('');
                      setSuccessMessage('');
                    } else {
                      setActiveReport(null);
                    }
                  }}
                  style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                >
                  <option value="" disabled={activeReport !== null}>-- Select a Saved Report --</option>
                  {reportsHistory.map(r => (
                    <option key={r._id} value={r._id}>
                      {r.title || 'Academic Report'} ({new Date(r.uploadDate || Date.now()).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-secondary" onClick={() => {
                setActiveReport(null);
                setAddNewRequested(true);
                setErrorMessage('');
                setSuccessMessage('');
                setSelectedFile(null);
              }}>
                + Add New Test Report
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!activeReport && !isUploading && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <FileUp size={40} color="#2563eb" />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                {addNewRequested ? 'Upload New Report' : 'No student report uploaded yet.'}
              </h2>
              <p style={{ maxWidth: '580px', margin: '0 auto 24px auto', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                {addNewRequested 
                  ? 'Upload a new student report to begin analysis.'
                  : 'Upload a PDF or image of the student\'s academic report to begin AI analysis.'}
              </p>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} /> Choose File (PDF, JPG, JPEG, PNG)
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE REPORT PRESENTATION */}
          {(() => {
            const displayReport = activeReport ? { ...activeReport, ...(activeReport.analysis || {}) } : null;
            if (!displayReport || isUploading) return null;
            return (
              <>

                {/* Navigation Tabs */}
                <div className="safety-tabs" style={{ marginBottom: '24px' }}>
                  <button className={`tab-btn ${activeTab === 'assessment' ? 'active' : ''}`} onClick={() => setActiveTab('assessment')}>
                    <Award size={18} /> AI Academic Assessment
                  </button>
                  <button className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
                    <Sparkles size={18} /> Study & Focus Recommendations
                  </button>
                  <button className={`tab-btn ${activeTab === 'studyplan' ? 'active' : ''}`} onClick={() => setActiveTab('studyplan')}>
                    <Calendar size={18} /> Weekly Study Plan & Goals
                  </button>
                </div>

                {/* TAB 1: AI ACADEMIC ASSESSMENT OVERVIEW */}
                {activeTab === 'assessment' && (
                  <div className="safety-grid">
                    
                    {/* Overall Percentage & Performance Level */}
                    <div className="safety-card">
                      <h3>Overall Academic Level</h3>
                      <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <span style={{ fontSize: '48px', fontWeight: 900, color: '#2563eb' }}>{displayReport.overallPercentage}%</span>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginTop: '6px' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}>
                            Grade: {displayReport.grade}
                          </span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontWeight: 700, color: '#2563eb', fontSize: '15px' }}>
                          Performance Level: {displayReport.performanceLevel}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Highest Scoring Subjects</span>
                          <strong style={{ fontSize: '14px', color: '#166534' }}>
                            ✓ {displayReport.highestScoringSubjects ? displayReport.highestScoringSubjects.join(', ') : ''}
                          </strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Lowest Scoring Subjects</span>
                          <strong style={{ fontSize: '14px', color: '#dc2626' }}>
                            ⚠️ {displayReport.lowestScoringSubjects ? displayReport.lowestScoringSubjects.join(', ') : ''}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Subject-wise Marks */}
                    <div className="safety-card col-span-2">
                      <h3>Subject-wise Marks & Scores</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginTop: '16px' }}>
                        {displayReport.subjectPerformance && displayReport.subjectPerformance.map((sub, idx) => (
                          <div key={idx} style={{ padding: '14px', borderRadius: '12px', background: sub.status === 'Weak' ? '#fff5f5' : '#f0fdf4', border: `1px solid ${sub.status === 'Weak' ? '#fca5a5' : '#bbf7d0'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{sub.subject}</strong>
                              <span style={{ fontSize: '14px', fontWeight: 800, color: sub.status === 'Weak' ? '#dc2626' : '#166534' }}>
                                {sub.score} / {sub.maxScore || 100} ({sub.percentage || sub.score}%)
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                              <span>Level: {sub.level}</span>
                              <span style={{ fontWeight: 700, color: sub.status === 'Weak' ? '#c2410c' : '#15803d' }}>{sub.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Summary Box */}
                    <div className="safety-card col-span-3" style={{ background: 'linear-gradient(135deg, #eff6ff, #f3e8ff)', border: '1.5px solid #c084fc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <Sparkles size={24} color="#7c3aed" />
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>AI Summary & Academic Assessment Statement</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
                        {displayReport.finalAISummary}
                      </p>
                    </div>

                  </div>
                )}

                {/* TAB 2: STUDY & FOCUS RECOMMENDATIONS */}
                {activeTab === 'recommendations' && (
                  <div className="safety-grid">
                    
                    {/* Subject-wise Improvement Suggestions */}
                    <div className="safety-card col-span-3">
                      <h3>Subject-wise Improvement Suggestions</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '16px' }}>
                        {displayReport.subjectImprovementSuggestions && displayReport.subjectImprovementSuggestions.map((sug, idx) => (
                          <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                            <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a', marginBottom: '6px' }}>{sug.subject}</strong>
                            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>{sug.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Study Time Recommendations for Weak Subjects & Tips to Maintain Strong Subjects */}
                    <div className="safety-card col-span-3">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        
                        {/* Weak Subject Study Time Cards */}
                        <div style={{ background: '#fff5f5', border: '1.5px solid #fca5a5', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <Clock size={22} color="#dc2626" />
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#991b1b' }}>Study Time Recommendations (Weak Subjects)</h3>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {displayReport.studyTimeRecommendations && displayReport.studyTimeRecommendations.map((rec, i) => (
                              <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', background: 'white', border: '1px solid #fee2e2' }}>
                                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{rec.subject}</strong>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626' }}>{rec.time}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips to Maintain Strong Subjects */}
                        <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                            <Award size={22} color="#16a34a" />
                            <h3 style={{ margin: 0, fontSize: '16px', color: '#14532d' }}>Tips to Maintain Strong Subjects</h3>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {displayReport.tipsToMaintainStrong && displayReport.tipsToMaintainStrong.map((tip, i) => (
                              <div key={i} style={{ padding: '12px 16px', borderRadius: '10px', background: 'white', border: '1px solid #bbf7d0' }}>
                                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{tip.subject}</strong>
                                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#15803d', lineHeight: 1.4 }}>{tip.tip}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Personalized Study Recommendations Detailed Card */}
                    <div className="safety-card col-span-3" style={{ background: '#faf5ff', border: '1.5px solid #e9d5ff' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Sparkles size={24} color="#7c3aed" />
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#581c87' }}>Personalized Study Recommendations Details</h3>
                      </div>
                      {displayReport.personalizedStudyRecommendations && displayReport.personalizedStudyRecommendations.map((rec, idx) => (
                        <div key={idx} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #ddd6fe', marginBottom: '12px' }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#581c87' }}>Focus Subject: {rec.subject}</h4>
                          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569' }}><strong>Reason to Focus:</strong> {rec.focusReason}</p>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#7c3aed', display: 'block', marginBottom: '4px' }}>Practice Activities:</strong>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#4b5563' }}>
                                {rec.practiceActivities.map((act, i) => <li key={i}>{act}</li>)}
                              </ul>
                            </div>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#7c3aed', display: 'block', marginBottom: '4px' }}>Revision Methods:</strong>
                              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#4b5563' }}>
                                {rec.revisionMethods.map((rev, i) => <li key={i}>{rev}</li>)}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                )}

                {/* TAB 3: WEEKLY STUDY PLAN & WEEKLY LEARNING GOALS */}
                {activeTab === 'studyplan' && (
                  <div className="safety-grid">
                    
                    {/* Weekly Study Plan */}
                    <div className="safety-card col-span-2">
                      <h3>Weekly Study Plan</h3>
                      <p className="card-sub">Daily structured core subject study times.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                        {displayReport.weeklyStudyPlan && displayReport.weeklyStudyPlan.map((plan, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                                {plan.day.slice(0, 3)}
                              </div>
                              <div>
                                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{plan.activity}</strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>Subject: {plan.subject}</span>
                              </div>
                            </div>
                            <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                              ⏱️ {plan.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Weekly Learning Goals & Parent Guidance */}
                    <div className="safety-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                        <Target size={22} color="#7c3aed" />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Weekly Learning Goals</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                        {displayReport.weeklyLearningGoals && displayReport.weeklyLearningGoals.map((goal, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <BookCheck size={16} color="#10b981" />
                            <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600 }}>{goal}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                        <Users size={22} color="#2563eb" />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Actionable Parent Guidance</h3>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {displayReport.parentGuidance && displayReport.parentGuidance.map((guide, i) => (
                          <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <Sparkles size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '12px', color: '#1e293b', lineHeight: 1.4 }}>{guide}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

              </>
            );
          })()}

        </main>
      </div>

      <NotificationCenter isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
};

export default ReportAnalysis;
