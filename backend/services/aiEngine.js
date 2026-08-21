/**
 * Learnlytics AI Engine
 * Node.js Service analyzing uploaded student reports & generating
 * a complete AI Academic Assessment strictly based on the report.
 */

export function parseExtractedText(text) {
  if (!text || typeof text !== 'string') {
    return { error: 'Unable to clearly read this mark. Please upload a clearer report.' };
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const subjectsMap = new Map();
  let studentName = '';
  let studentClass = '';

  // Core administrative / metadata terms that are never academic subjects
  const blacklist = new Set([
    'total', 'percentage', 'grade', 'marks', 'average', 'max', 'maximum',
    'obtained', 'class', 'name', 'student', 'roll', 'date', 'term', 'year',
    'school', 'result', 'id', 'no', 'number', 'academic', 'report', 'pass',
    'fail', 'remarks', 'comment', 'signature', 'overall', 'summary', 'status',
    'level', 'score', 'scores', 'gpa', 'eval', 'evaluation', 'test', 'exam',
    'examination', 'midterm', 'final', 'phone', 'age', 'page', 'parent', 'teacher'
  ]);

  /**
   * Non-academic monitoring terms that must NEVER be treated as subjects.
   * Covers: attendance, incidents/cases, safety metrics, behaviour metrics,
   * digital-safety metrics, and any other school-monitoring fields.
   *
   * Rule: if ANY word in a candidate subject name matches one of these, the
   * candidate is discarded entirely. This way future monitoring fields that
   * contain these keywords are also excluded automatically.
   */
  const NON_ACADEMIC_TERMS = new Set([
    // Attendance
    'attendance', 'present', 'absent', 'absences', 'tardy', 'tardiness',
    'punctuality', 'leaves', 'leave',
    // Cases / Incidents / Disciplinary
    'case', 'cases', 'incident', 'incidents', 'disciplinary', 'misconduct',
    'offence', 'offense', 'violation', 'violations', 'warning', 'warnings',
    'suspension', 'detention',
    // Safety / Digital-safety
    'safety', 'unsafe', 'digital', 'cybersafety', 'online', 'internet',
    'screentime', 'screen',
    // Behaviour / Conduct
    'behaviour', 'behavior', 'conduct', 'attitude', 'character',
    'participation', 'cooperation', 'punctual',
    // Health / Other monitoring fields
    'health', 'medical', 'weight', 'height', 'bmi', 'fee', 'fees',
    'dues', 'fine', 'penalty', 'extracurricular', 'activity', 'activities',
    'sports', 'library', 'transport'
  ]);

  // Merge non-academic terms into the main blacklist
  for (const term of NON_ACADEMIC_TERMS) {
    blacklist.add(term);
  }

  const nameRegexes = [
    /student\s*name\s*[:\-=]\s*([a-zA-Z\s\.]+)/i,
    /name\s*[:\-=]\s*([a-zA-Z\s\.]+)/i,
    /student\s*[:\-=]\s*([a-zA-Z\s\.]+)/i
  ];

  const classRegexes = [
    /class\s*[:\-=]\s*([a-zA-Z0-9\s\.\-]+)/i,
    /grade\s*[:\-=]\s*([a-zA-Z0-9\s\.\-]+)/i
  ];

  for (let line of lines) {
    // 1. Try to extract student name if not already found
    if (!studentName) {
      for (const rx of nameRegexes) {
        const m = line.match(rx);
        if (m && m[1]) {
          const possibleName = m[1].trim();
          if (possibleName && !blacklist.has(possibleName.toLowerCase())) {
            studentName = possibleName;
            break;
          }
        }
      }
    }

    // 2. Try to extract class if not already found
    if (!studentClass) {
      for (const rx of classRegexes) {
        const m = line.match(rx);
        if (m && m[1]) {
          studentClass = m[1].trim();
          break;
        }
      }
    }

    // Clean leading line numbers or bullets like "1. ", "02) ", etc.
    const cleanedLine = line.replace(/^\s*\d+[\.\)\s\-]+/g, '').trim();

    // Extract all numbers from the cleaned line
    const numbers = [...cleanedLine.matchAll(/\b\d+\b/g)].map(m => parseInt(m[0], 10));

    if (numbers.length > 0) {
      // Find the index of the first number in the cleaned line
      const firstNumMatch = cleanedLine.match(/\b\d+\b/);
      if (firstNumMatch) {
        const firstNumIndex = firstNumMatch.index;
        // The subject name is the text before the first number
        let subjName = cleanedLine.substring(0, firstNumIndex).trim();
        
        // Clean up separators like colons, dashes, vertical pipes, tabs, dot leaders
        subjName = subjName.replace(/[:\-=\t\.\u2014|]+$/g, '').trim();
        subjName = subjName.replace(/^[:\-=\t\.\u2014|]+/g, '').trim();
        
        // Filter subject name (allow length >= 2 to support PE/IT)
        if (subjName.length >= 2 && /^[a-zA-Z]/.test(subjName) && /^[a-zA-Z\s&\-]+$/.test(subjName)) {
          const lowerSubj = subjName.toLowerCase();
          
          // Check if any word in the subject name is blacklisted or if the full subject is blacklisted
          const words = lowerSubj.split(/\s+/);
          const isBlacklisted = words.some(w => blacklist.has(w)) || blacklist.has(lowerSubj);
          
          if (!isBlacklisted) {
            // Determine score and maxScore
            let score = 0;
            let maxScore = 100;

            // Check if there is an explicit fraction pattern in the line (e.g., 85/100 or 85 / 100)
            const fractionMatch = cleanedLine.match(/(\d+)\s*[\/]\s*(\d+)/);
            if (fractionMatch) {
              score = parseInt(fractionMatch[1], 10);
              maxScore = parseInt(fractionMatch[2], 10);
            } else {
              if (numbers.length === 1) {
                score = numbers[0];
                maxScore = 100;
              } else if (numbers.length === 2) {
                if (numbers[1] > numbers[0]) {
                  score = numbers[0];
                  maxScore = numbers[1];
                } else {
                  score = numbers[1];
                  maxScore = numbers[0];
                }
              } else {
                // 3 or more numbers
                const last = numbers[numbers.length - 1];
                const commonMaxScores = [50, 80, 100, 150, 200];
                if (commonMaxScores.includes(last) || last > numbers[numbers.length - 2]) {
                  maxScore = last;
                  score = numbers[numbers.length - 2];
                } else {
                  score = last;
                  maxScore = 100;
                }
              }
            }

            // Keep scores bounded reasonably (e.g., 0 to 1000)
            if (score >= 0 && score <= 1000 && maxScore > 0 && maxScore <= 1000) {
              if (!subjectsMap.has(lowerSubj)) {
                subjectsMap.set(lowerSubj, {
                  subject: subjName, // Preserve original case
                  score,
                  maxScore
                });
              }
            }
          }
        }
      }
    }
  }

  if (subjectsMap.size === 0) {
    return { error: 'Unable to clearly read this mark. Please upload a clearer report.' };
  }

  return {
    studentName: studentName || null,
    studentClass: studentClass || null,
    subjects: Array.from(subjectsMap.values())
  };
}

export function analyzeStudentReport({ filename, textContent, studentName: defaultName }) {
  const parsed = parseExtractedText(textContent);

  if (parsed.error) {
    return {
      error: parsed.error
    };
  }

  const sName = parsed.studentName || defaultName || 'Student';
  
  // Calculate dynamic sums
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;
  
  const subjectPerformance = parsed.subjects.map(sub => {
    totalMaxMarks += sub.maxScore;
    totalObtainedMarks += sub.score;
    
    const percentage = sub.maxScore > 0 ? (sub.score / sub.maxScore) * 100 : 0;
    
    let level = 'Needs Focus';
    let status = 'Weak';
    if (percentage >= 80) {
      level = 'Advanced';
      status = 'Strong';
    } else if (percentage >= 60) {
      level = 'Proficient';
      status = 'Moderate';
    }
    
    return {
      subject: sub.subject,
      score: sub.score,
      maxScore: sub.maxScore,
      percentage: parseFloat(percentage.toFixed(1)),
      level,
      status
    };
  });

  const overallPercentage = totalMaxMarks > 0 ? parseFloat(((totalObtainedMarks / totalMaxMarks) * 100).toFixed(1)) : 0;

  let grade = 'D';
  let performanceLevel = 'Needs Focus';

  if (overallPercentage >= 90) {
    grade = 'A+';
    performanceLevel = 'Advanced Mastery';
  } else if (overallPercentage >= 80) {
    grade = 'A';
    performanceLevel = 'Intermediate Level';
  } else if (overallPercentage >= 70) {
    grade = 'B';
    performanceLevel = 'Basic Level';
  } else if (overallPercentage >= 60) {
    grade = 'C';
    performanceLevel = 'Developing Level';
  }

  // Dynamic weak and strong subjects identification
  const weakSubjects = [];
  const strongSubjects = [];

  subjectPerformance.forEach(sub => {
    if (sub.percentage < 60) {
      weakSubjects.push(sub.subject);
    } else if (sub.percentage >= 80) {
      strongSubjects.push(sub.subject);
    }
  });

  // Recommendations based on ACTUAL marks
  const subjectImprovementSuggestions = [];
  const studyTimeRecommendations = [];
  const tipsToMaintainStrong = [];
  const personalizedStudyRecommendations = [];

  subjectPerformance.forEach(sub => {
    if (sub.percentage < 60) {
      subjectImprovementSuggestions.push({
        subject: sub.subject,
        suggestion: `${sub.subject} needs additional attention. Practice for 30 minutes daily, revise important concepts, and solve practice questions regularly.`
      });
      studyTimeRecommendations.push({
        subject: sub.subject,
        time: '30 Minutes Daily'
      });
      personalizedStudyRecommendations.push({
        subject: sub.subject,
        focusReason: `${sub.subject} is currently at ${sub.score}/${sub.maxScore} (${sub.percentage}%), which needs focus. Improving this will raise overall performance.`,
        practiceActivities: [
          `Complete targeted practice problems in ${sub.subject} daily.`,
          `Spend 15 minutes reviewing fundamental ${sub.subject} definitions.`
        ],
        revisionMethods: [
          `Build a summary concept sheet for ${sub.subject}.`,
          `Attempt short self-tests twice a week.`
        ]
      });
    } else if (sub.percentage >= 80) {
      tipsToMaintainStrong.push({
        subject: sub.subject,
        tip: `Excellent performance. Continue regular revision to maintain your performance.`
      });
    }
  });

  // Dynamic Weekly Study Plan prioritizing weaker subjects
  const weeklyStudyPlan = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  const prioritySubjects = [...subjectPerformance].sort((a, b) => a.percentage - b.percentage);
  
  if (prioritySubjects.length > 0) {
    days.forEach((day, index) => {
      const sub = prioritySubjects[index % prioritySubjects.length];
      const duration = sub.percentage < 60 ? '30 Mins' : '20 Mins';
      const activity = sub.percentage < 60 ? 'Targeted exercises & core concept review' : 'Advanced practice & speed drills';
      
      weeklyStudyPlan.push({
        day,
        subject: sub.subject,
        duration,
        activity
      });
    });
  }

  // Weekly learning goals based on actual weak subjects
  const weeklyLearningGoals = [];
  weakSubjects.forEach(sub => {
    weeklyLearningGoals.push(`Achieve 85% or higher on the next ${sub} progress evaluation.`);
    weeklyLearningGoals.push(`Complete 3 dedicated concept reviews for ${sub}.`);
  });
  if (weeklyLearningGoals.length < 3 && strongSubjects.length > 0) {
    weeklyLearningGoals.push(`Maintain top performance streak in ${strongSubjects[0]}.`);
  }
  if (weeklyLearningGoals.length === 0) {
    weeklyLearningGoals.push(`Maintain current excellent learning pace in all subjects.`);
  }

  // Actionable Parent Guidance
  const parentGuidance = [];
  if (weakSubjects.length > 0) {
    parentGuidance.push(`Encourage the student to spend more time practicing ${weakSubjects.join(' and ')} because they need improvement.`);
  }
  if (strongSubjects.length > 0) {
    parentGuidance.push(`Praise the student's excellent proficiency and hard work in ${strongSubjects.join(' and ')}.`);
  }
  parentGuidance.push('Set learning checkpoints at the end of each weekly study plan phase.');

  // AI Summary based ONLY on uploaded report data, with actual student name
  const finalAISummary = weakSubjects.length > 0
    ? `${sName} has performed strongly in ${strongSubjects.join(' and ') || 'several subjects'} but requires additional practice and focus in ${weakSubjects.join(' and ')}. Overall score: ${overallPercentage}% (${grade}). Consistent daily practice and weekly revision of ${weakSubjects.join(' and ')} are recommended to boost overall academic performance.`
    : `${sName} has demonstrated outstanding academic performance, maintaining strong scores across all subjects with an overall score of ${overallPercentage}% (${grade}). Excellent results in ${strongSubjects.join(' and ')}. Regular revision is recommended to maintain this standard.`;

  return {
    studentName: sName,
    studentClass: parsed.studentClass,
    extractedStudentDetails: parsed,
    extractedSubjects: parsed.subjects.map(s => s.subject),
    extractedMarks: parsed.subjects.reduce((acc, s) => {
      acc[s.subject] = `${s.score}/${s.maxScore}`;
      return acc;
    }, {}),
    totalMarks: totalMaxMarks,
    obtainedMarks: totalObtainedMarks,
    percentage: overallPercentage,
    overallPercentage,
    overallPerformance: overallPercentage >= 90 ? 'Outstanding' : (overallPercentage >= 80 ? 'Very Good' : (overallPercentage >= 70 ? 'Good' : 'Needs Focus')),
    grade,
    performanceLevel,
    subjectPerformance,
    highestScoringSubjects: strongSubjects,
    lowestScoringSubjects: weakSubjects,
    weakSubjects,
    strongSubjects,
    subjectImprovementSuggestions,
    personalizedStudyRecommendations,
    studyTimeRecommendations,
    tipsToMaintainStrong,
    weeklyStudyPlan,
    weeklyLearningGoals,
    parentGuidance,
    finalAISummary
  };
}

export function generateSafetyRecommendations({ screenTimeMinutes, emotionLogs, quizScore, unsafeWordCount }) {
  const recommendations = [];

  if (screenTimeMinutes > 45) {
    recommendations.push("Screen time continuous limit reached. Recommend taking a 10-minute active break.");
  }
  if (unsafeWordCount > 0) {
    recommendations.push("Unsafe language detected. Initiate gentle digital citizenship guidance.");
  }
  if (quizScore < 60) {
    recommendations.push("Quiz score dropped below 60%. Schedule a short refresher session on recent topics.");
  }
  if (emotionLogs && emotionLogs.includes('Tired')) {
    recommendations.push("Student reported feeling tired before learning. Recommend light story mode over intense quizzes.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Great balance of screen time and learning performance! Keep up the daily streak.");
  }

  return recommendations;
}
