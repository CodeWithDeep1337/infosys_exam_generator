// src/controllers/quizController.js
const axios = require("axios");
const db = require("../config/db"); // Assuming this exports the mysql2 pool
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

/**
 * ✅ GENERATE QUIZ directly from Gemini API
 */
async function generateQuiz(req, res) {
  const { subject, topic, difficulty, count, type, mcqCount, saCount } = req.body;

  if (!subject || !topic || !count) {
    return res.status(400).json({ error: "Subject, topic, and count are required" });
  }

  // 1. Prepare Mock Data (Fallback)
  const mockMCQs = [
      {
          question: `(Mock) What is a fundamental concept in ${subject}?`,
          options: ["Abstraction", "Photosynthesis", "Gravity", "Taxation"],
          correctAnswer: "Abstraction"
      },
      {
          question: `(Mock) In ${topic}, which term is most relevant?`,
          options: ["Queue", "Planet", "Spatula", "Engine"],
          correctAnswer: "Queue"
      },
      {
          question: `(Mock) True or False: ${topic} is related to ${subject}.`,
          options: ["True", "False"],
          correctAnswer: "True"
      },
      {
          question: `(Mock) Which of the following best describes ${topic}?`,
          options: ["A programming paradigm", "A musical instrument", "A type of food", "A city in Europe"],
          correctAnswer: "A programming paradigm"
      },
      {
          question: `(Mock) Identify the correct statement about ${subject}.`,
          options: ["It involves logic", "It involves magic", "It involves cooking", "It involves painting"],
          correctAnswer: "It involves logic"
      }
  ];

  const mockShortAnswers = [
      {
          question: `(Mock) Explain the concept of ${topic} in your own words.`,
          answer: "A detailed explanation...",
          keywords: ["Concept", "Explanation"]
      },
      {
          question: `(Mock) How does ${subject} impact modern technology?`,
          answer: "It allows for...",
          keywords: ["Impact", "Technology"]
      },
      {
          question: `(Mock) What is the main difference between ${topic} and other similar concepts?`,
          answer: "The main difference is...",
          keywords: ["Difference", "Contrast"]
      },
      {
          question: `(Mock) List three key features of ${subject}.`,
          answer: "1. Feature A, 2. Feature B, 3. Feature C",
          keywords: ["Feature A", "Feature B", "Feature C"]
      },
      {
          question: `(Mock) Describe a real-world application of ${topic}.`,
          answer: "It is used in...",
          keywords: ["Application", "Real-world"]
      }
  ];

  // 2. Try Gemini API
  try {
      if (!GEMINI_API_KEY) throw new Error("No API Key");

      // Customize prompt
      let prompt = "";
      if (type === "Short Answer") {
          prompt = `Generate ${count} ${difficulty} level Short Answer questions on "${topic}" for "${subject}". 
          Output JSON: [{"question": "...", "answer": "...", "keywords": ["keyword1", "keyword2"]}]. No Markdown.`;
      } else if (type === "Both") {
          // Use provided counts or default to 50/50 split if missing (fallback)
          const finalMcqCount = mcqCount || Math.ceil(count / 2);
          const finalSaCount = saCount || (count - finalMcqCount);
          
          prompt = `Generate a mixed quiz with ${count} questions on "${topic}" for "${subject}" at ${difficulty} level.
          Include EXACTLY ${finalMcqCount} Multiple Choice Questions (MCQ) and ${finalSaCount} Short Answer questions.
          
          For MCQs: Provide "options" array (4 choices) and "correctAnswer" (exact text match).
          For Short Answers: Provide "answer" field with the correct answer text, "keywords" array (key concepts), and NO "options" array.

          Output JSON array only. Example format:
          [
            { "question": "MCQ Question 1...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" },
            { "question": "Short Answer 1...", "answer": "Expected answer text", "keywords": ["key1", "key2"] }
          ]
          Do NOT prefix options with A., B., C., D. in the text.`;
      } else {
          // Fixed: Request options WITHOUT A./B./C./D. prefixes
          prompt = `Generate ${count} ${difficulty} level MCQ questions on "${topic}" for "${subject}". 
Each question must have 4 options. DO NOT prefix options with A., B., C., D. - just provide the answer text.
The correctAnswer field must be the EXACT text of one of the options.
Output JSON: [{"question": "...", "options": ["answer text 1", "answer text 2", "answer text 3", "answer text 4"], "correctAnswer": "exact text of correct option"}]. No Markdown.`;
      }

      const response = await axios.post(
            `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { headers: { "Content-Type": "application/json" } }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      const cleanedText = generatedText.replace(/```json/g, "").replace(/```/g, "").trim();
      console.log("Gemini Raw Response:", cleanedText); // Debugging
      let questions;
      try {
        questions = JSON.parse(cleanedText);
      } catch (parseErr) {
          console.error("JSON Parse Error:", parseErr);
          console.log("Faulty JSON:", cleanedText);
          return res.status(500).json({ error: "Failed to parse AI response" });
      }
      
      // Normalize
      questions.forEach(q => {
          // Append keywords to answer if present (for Short Answers)
          // Handle case-insensitive 'keywords' or 'KeyWords' just in case
          const kw = q.keywords || q.Keywords || q.keyWords;
          
          if (kw && Array.isArray(kw) && kw.length > 0) {
              const kwString = `\n\nKeywords: ${kw.join(", ")}`;
              if (q.answer) q.answer += kwString;
              if (q.correctAnswer) q.correctAnswer += kwString; // Sometimes AI puts it here
          }

          if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
          
          // ✅ Append Keywords to Answer if present
          const keywords = q.keywords || q.Keywords || q.keyWords;
          if (keywords && Array.isArray(keywords) && keywords.length > 0) {
             const keywordText = keywords.join(", ");
             q.correctAnswer = `${q.correctAnswer}\n\nKeywords: ${keywordText}`;
          }

          if (!q.options) q.options = []; 
          
          // Helper to strip A./B./C./D. prefixes
          const stripPrefix = (str) => {
              if (!str) return str;
              return str.replace(/^[A-Da-d][\.\)\:]?\s*/g, '').trim();
          };
          
          // Strip prefixes from options
          q.options = q.options.map(opt => stripPrefix(opt));
          
          // Strip prefix from correctAnswer
          if (q.correctAnswer) {
              q.correctAnswer = stripPrefix(q.correctAnswer);
          }
          
          // Now ensure correctAnswer matches an option exactly (Only for MCQs)
          if (q.options.length > 0 && q.correctAnswer) {
              const matchedOption = q.options.find(opt => 
                  opt.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
              );
              if (matchedOption) {
                  q.correctAnswer = matchedOption; // Use exact option text
              } else {
                  // Try partial match
                  const partialMatch = q.options.find(opt => 
                      opt.toLowerCase().includes(q.correctAnswer.toLowerCase()) ||
                      q.correctAnswer.toLowerCase().includes(opt.toLowerCase())
                  );
                  q.correctAnswer = partialMatch || q.options[0];
              }
          }
          
          console.log("Question:", q.question.substring(0, 50));
          console.log("Options:", q.options);
          console.log("CorrectAnswer:", q.correctAnswer);
      });

      return res.json({ questions });

  } catch (err) {
      console.warn("⚠️ Gemini API Failed or Missing Key. Using Mock Data.", err.message);
      // Fallback to mock data
      let selectedMock;
      if (type === "Short Answer") {
          selectedMock = mockShortAnswers;
      } else if (type === "Both") {
          // Mix based on requested counts
           const finalMcqCount = parseInt(mcqCount) || Math.ceil((count || 5) / 2);
           const finalSaCount = parseInt(saCount) || ((count || 5) - finalMcqCount);
          
          selectedMock = [
              ...mockMCQs.slice(0, finalMcqCount), 
              ...mockShortAnswers.slice(0, finalSaCount)
          ];
      } else {
          selectedMock = mockMCQs;
      }

      // Check for keywords and normalization in mock data too!
      const questions = selectedMock.slice(0, count || 5);
      questions.forEach(q => {
          // Append keywords
           const kw = q.keywords || q.Keywords || q.keyWords;
          if (kw && Array.isArray(kw) && kw.length > 0) {
              const kwString = `\n\nKeywords: ${kw.join(", ")}`;
              if (q.answer && !q.answer.includes("Keywords:")) q.answer += kwString;
              if (q.correctAnswer && !q.correctAnswer.includes("Keywords:")) q.correctAnswer += kwString; 
          }
          if (!q.correctAnswer && q.answer) q.correctAnswer = q.answer;
      });

      return res.json({ questions });
  }
}

/**
 * ✅ CREATE QUIZ & Save to DB
 */
async function createQuiz(req, res) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { title, subject_id, description, difficulty, duration, questions, timeLimit } = req.body; // ✅ Extract timeLimit
    console.log("[CreateQuiz] Received body:", { title, timeLimit, type: typeof timeLimit });
    const created_by = req.user ? req.user.id : (req.body.created_by || null);

    // 1. Insert Quiz
    const displayId = "QUIZ_" + Date.now(); 
    
    const [quizResult] = await connection.query(
      "INSERT INTO quizzes (display_id, title, topic_id, created_by, time_limit) VALUES (?, ?, ?, ?, ?)", // ✅ Add time_limit
      [displayId, title, req.body.topic_id || 1, created_by || (req.user ? req.user.id : null), timeLimit || 10] // ✅ Save value
    );

    const quizId = quizResult.insertId;

    // 2. Insert Questions & Options
    for (const q of questions) {
      // Determine type
      const qType = (q.options && q.options.length > 0) ? "MCQ" : "SHORT_ANSWER";
      
      const [qResult] = await connection.query(
        "INSERT INTO questions (quiz_id, question_text, question_type, correct_answer) VALUES (?, ?, ?, ?)",
        [quizId, q.question, qType, q.correctAnswer || ""]
      );
      const questionId = qResult.insertId;

      if (q.options && q.options.length > 0) {
        for (const opt of q.options) {
          const isCorrect = opt === q.correctAnswer;
          await connection.query(
            "INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)",
            [questionId, opt, isCorrect]
          );
        }
      }
    }

    await connection.commit();
    res.status(201).json({ message: "Quiz created successfully", quizId });
  } catch (err) {
    await connection.rollback();
    console.error("Create Quiz Error:", err);
    res.status(500).json({ error: "Failed to save quiz" });
  } finally {
    connection.release();
  }
}

/**
 * ✅ ASSIGN QUIZ
 */
async function assignQuiz(req, res) {
  try {
    // Expects { quizId: 1, studentIds: [2, 3] }
    const { quizId, studentIds, dueDate } = req.body;

    if (!quizId || !studentIds || !Array.isArray(studentIds)) {
        return res.status(400).json({ error: "Invalid data" });
    }

    const values = studentIds.map(studentId => [quizId, studentId, "PENDING"]);
    
    // Using quiz_attempts table to track assignments? 
    // Usually assignments are separate, but for simplicity, let's assume we create a PENDING attempt or a separate assignments table.
    // Based on schema descriptions, let's assume 'quiz_attempts' can be used as a placeholder or we just assume logic.
    // Checking previous context, let's create a record in `quiz_attempts` with status 'ASSIGNED' or 'PENDING' if the table allows.
    // If not, we might fail. Let's try `quiz_attempts` assuming it has (user_id, quiz_id, status).
    
    // Quick schema check mock: 
    // quiz_attempts (id, user_id, quiz_id, score, started_at, completed_at, status)
    
    for (const studentId of studentIds) {
        await db.query(
            "INSERT INTO quiz_attempts (user_id, quiz_id, status) VALUES (?, ?, 'PENDING')",
            [studentId, quizId]
        );
    }

    res.json({ message: "Quiz assigned successfully" });
  } catch (err) {
    console.error("Assign Quiz Error:", err);
    res.status(500).json({ error: "Failed to assign quiz" });
  }
}

/**
 * ✅ GET STUDENT QUIZZES
 */
/**
 * ✅ GET STUDENT QUIZZES
 */
async function getStudentQuizzes(req, res) {
    try {
        const userId = req.user.id; 
        
        const [rows] = await db.query(`
            SELECT qa.id as attempt_id, qa.status, qa.score, qa.total_questions,
                   q.id as quiz_id, q.title, q.difficulty, q.time_limit, t.name as topic_name
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            LEFT JOIN topics t ON q.topic_id = t.id
            WHERE qa.user_id = ?
            ORDER BY qa.created_at DESC
        `, [userId]);

        res.json(rows);
    } catch (err) {
        console.error("Get Student Quizzes Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GET STUDENT ADAPTIVE STATS (Simple AI/Heuristic)
 */
async function getStudentStats(req, res) {
    try {
        const userId = req.user.id;
        
        // 1. Calculate Average Score
        const [rows] = await db.query(`
            SELECT AVG(score) as avg_score, COUNT(*) as total_attempts 
            FROM quiz_attempts 
            WHERE user_id = ? AND status = 'COMPLETED'
        `, [userId]);
        
        const avgScore = Math.round(rows[0].avg_score || 0);
        const totalAttempts = rows[0].total_attempts;

        // 2. Identify Weak Areas (Topics with low scores)
        const [weakTopics] = await db.query(`
            SELECT t.id, t.name, AVG(qa.score) as topic_avg
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            JOIN topics t ON q.topic_id = t.id
            WHERE qa.user_id = ? AND qa.status = 'COMPLETED'
            GROUP BY t.id
            HAVING topic_avg < 60
            LIMIT 2
        `, [userId]);

        // 3. Heuristic Logic (The "AI" Part)
        let recommendation = "";
        let nextDifficulty = "Medium";
        let progressColor = "primary"; // Blue default
        let statusMessage = "Keep learning!";
        let suggestedContent = null; // New field

        if (avgScore < 50) {
            recommendation = "Focus on reviewing the basics. Check availability of 'Beginner' courses.";
            nextDifficulty = "Easy";
            progressColor = "danger"; // Red (Fixed for Bootstrap 'text-danger')
            statusMessage = "Needs Improvement";
        } else if (avgScore < 80) {
             recommendation = "Good progress! Try practicing more problems to improve speed.";
             nextDifficulty = "Medium";
             progressColor = "warning"; // Yellow/Orange
             statusMessage = "Good";
        } else {
             recommendation = "Excellent work! You are ready for advanced topics.";
             nextDifficulty = "Hard";
             progressColor = "success"; // Green
             statusMessage = "Excellent";
        }

            if (weakTopics.length > 0) {
            const topicNames = weakTopics.map(t => t.name).join(", ");
            recommendation = `We noticed you struggled with: ${topicNames}. Recommended: Review the material below.`;
            
            // Fetch Suggested Material for the first weak topic
            try {
                const weakTopicId = weakTopics[0].id; // We need to ensure query selects ID
                const [materials] = await db.query(
                    "SELECT title, link, type, file_path FROM materials WHERE topic_id = ? LIMIT 1",
                    [weakTopicId]
                );
                
                if (materials.length > 0) {
                    let finalLink = materials[0].link;
                    // Prepare Download URL if it's a file
                    if (!finalLink && materials[0].file_path) {
                        finalLink = `http://localhost:8081/api/materials/download/${materials[0].file_path}`;
                    }

                    suggestedContent = {
                        title: materials[0].title,
                        link: finalLink,
                        type: materials[0].type
                    };
                }
            } catch (matErr) {
                console.warn("Could not fetch materials:", matErr.message);
            }
        }

        res.json({
            avgScore,
            totalAttempts,
            recommendation,
            nextDifficulty,
            progressColor,
            statusMessage,
            weakTopics: weakTopics.map(t => t.name),
            weakTopic: weakTopics.length > 0 ? weakTopics[0].name : "General", // Fix for frontend display
            suggestedContent 
        });

    } catch (err) {
        console.error("Get Stats Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GET ALL QUIZ ATTEMPTS (Instructor Report)
 */
async function getAllQuizAttempts(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT qa.id, qa.user_id as userId, u.username, q.title, qa.score, qa.status, qa.completed_at
            FROM quiz_attempts qa
            JOIN users u ON qa.user_id = u.id
            JOIN quizzes q ON qa.quiz_id = q.id
            ORDER BY qa.completed_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error("Get Reports Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ SUBMIT QUIZ
 */
/**
 * ✅ SUBMIT QUIZ
 */
async function submitQuiz(req, res) {
    try {
        const { quizId, answers = {} } = req.body; // Default answers to empty obj
        const userId = req.user.id; 
        
        console.log(`[SubmitQuiz] Processing for UserResult: ${userId}, Quiz: ${quizId}`);
        console.log(`[SubmitQuiz] Answers received:`, answers);

        if (!quizId) {
             console.error("[SubmitQuiz] Missing quizId");
             return res.status(400).json({ error: "Missing quizId" });
        }
        
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Fetch Questions & Correct Answers
            const [questions] = await connection.query(
                "SELECT id, question_type, correct_answer, points FROM questions WHERE quiz_id = ?",
                [quizId]
            );
            
            console.log(`[SubmitQuiz] Found ${questions.length} questions`);

            // Fetch MCQ Correct Options
            const [correctOptions] = await connection.query(`
                SELECT o.question_id, o.option_text 
                FROM options o
                JOIN questions q ON o.question_id = q.id
                WHERE q.quiz_id = ? AND o.is_correct = 1
            `, [quizId]);

            // Map correct options by question ID
            const mcqKeys = {};
            correctOptions.forEach(opt => {
                mcqKeys[opt.question_id] = opt.option_text;
            });

            // 2. Grade the Answers
            let calculatedScore = 0;
            const processedAnswers = [];

            // Helper to normalize strings: removal of all whitespace-like chars (nbsp) and lowercasing
            const normalize = (str) => String(str || "").replace(/\s+/g, ' ').trim().toLowerCase();

            // Iterate over questions (source of truth)
            for (const q of questions) {
                const ua = answers[q.id] || answers[String(q.id)]; // Check by ID or string ID
                let isCorrect = false;
                const points = q.points || 1;

                if (ua) {
                    if (q.question_type === 'MCQ') {
                        const correctText = mcqKeys[q.id];
                        // Debug Logging
                        console.log(`[Grading Q${q.id}] User: "${ua}" | Correct: "${correctText}"`);
                        console.log(`[Grading Q${q.id}] Normalized: "${normalize(ua)}" vs "${normalize(correctText)}"`);
                        
                        // Strict check first, then partial fallback if deemed safe? Strict is better for now.
                        if (correctText && normalize(ua) === normalize(correctText)) {
                            isCorrect = true;
                        }
                    } else {
                        // Short Answer Check (Simple exact match for now, instructor can override)
                        if (q.correct_answer && normalize(ua) === normalize(q.correct_answer)) {
                            isCorrect = true;
                        }
                        // TODO: Add fuzzy matching or AI grading trigger here
                    }
                }

                if (isCorrect) calculatedScore += points;

                processedAnswers.push({
                    questionId: q.id,
                    userAnswer: ua || "",
                    isCorrect: isCorrect ? 1 : 0,
                    points: isCorrect ? points : 0
                });
            }

            // 3. Determine Status
            // If any Short Answer is present, maybe mark COMPLETED_PENDING? 
            // For now, mark COMPLETED so student gets immediate feedback, instructor can override.
            const status = "COMPLETED";

            // 4. Create Attempt Record
            const [resInsert] = await connection.query(
                "INSERT INTO quiz_attempts (user_id, quiz_id, status, score, started_at, completed_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
                [userId, quizId, status, calculatedScore]
            );
            const attemptId = resInsert.insertId;

            // 5. Save Answers with is_correct
            for (const pa of processedAnswers) {
                await connection.query(
                    "INSERT INTO quiz_answers (attempt_id, question_id, user_answer, is_correct) VALUES (?, ?, ?, ?)",
                    [attemptId, pa.questionId, pa.userAnswer, pa.isCorrect]
                );
            }

            await connection.commit();
            res.json({ 
                message: "Quiz submitted successfully", 
                score: calculatedScore, 
                status 
            });

        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

    } catch (err) {
        console.error("Submit Quiz Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GRADE QUIZ ATTEMPT (Instructor Manual Review)
 */
async function gradeQuizAttempt(req, res) {
    try {
        const { attemptId, newScore } = req.body;
        
        if (!attemptId || newScore === undefined) {
            return res.status(400).json({ error: "Missing attemptId or newScore" });
        }

        const db = req.app.get("db");
        await db.query(
            "UPDATE quiz_attempts SET score = ?, status = 'COMPLETED' WHERE id = ?",
            [newScore, attemptId]
        );

        res.json({ message: "Quiz updated successfully" });
    } catch (err) {
        console.error("Grade Quiz Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GET QUIZ BY ID (For Taking Quiz)
 */
async function getQuizById(req, res) {
    try {
        const { id } = req.params;
        const db = req.app.get("db");

        // 1. Get Quiz Details
        const [quizzes] = await db.query("SELECT * FROM quizzes WHERE id = ?", [id]);
        if (quizzes.length === 0) return res.status(404).json({ error: "Quiz not found" });

        const quiz = quizzes[0];

        // 2. Get Questions
        const [questions] = await db.query(
            "SELECT id, question_text as question, question_type, correct_answer FROM questions WHERE quiz_id = ?", // ✅ Select correct_answer
            [id]
        );

        // 3. Get Options for each question
        for (const q of questions) {
            const [options] = await db.query(
                "SELECT option_text FROM options WHERE question_id = ?",
                [q.id]
            );
            q.options = options.map(o => o.option_text);
            
            // Logic for Correct Answer
            if (q.question_type === 'MCQ' || (q.options.length > 0)) {
                 const [correct] = await db.query(
                    "SELECT option_text FROM options WHERE question_id = ? AND is_correct = 1",
                    [q.id]
                );
                if (correct.length > 0) q.correctAnswer = correct[0].option_text;
            } else {
                // For Short Answer, use the column from questions table
                q.correctAnswer = q.correct_answer;
            }
        }

        quiz.questions = questions;
        res.json(quiz);

    } catch (err) {
        console.error("Get Quiz Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GET ALL QUIZZES (For Instructor/Admin)
 */
async function getAllQuizzes(req, res) {
    try {
        const db = req.app.get("db");
        // Check for authenticated user ID
        const userId = req.user ? req.user.id : null;
        const role = req.user ? req.user.role : null;
        
        let query = "SELECT * FROM quizzes ";
        const params = [];

        if (userId && role === "INSTRUCTOR") {
            query += "WHERE created_by = ? ";
            params.push(userId);
        }

        query += "ORDER BY created_at DESC";

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error("Get All Quizzes Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ DELETE QUIZ (and related attempts/questions)
 */
async function deleteQuiz(req, res) {
    const { id } = req.params;
    const db = req.app.get("db");

    try {
        // 1. Delete Options first (Grandchildren)
        // Find question IDs first or use subquery
        await db.query(`
            DELETE FROM options 
            WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)
        `, [id]);

        // 2. Delete Questions (Children)
        await db.query("DELETE FROM questions WHERE quiz_id = ?", [id]);

        // 3. Delete Attempts (Reports)
        await db.query("DELETE FROM quiz_attempts WHERE quiz_id = ?", [id]);

        // 4. Delete Quiz
        const [result] = await db.query("DELETE FROM quizzes WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        res.json({ message: "Quiz and all related data deleted successfully" });
    } catch (err) {
        console.error("Delete Quiz Error:", err);
        // Clean error message for user
        if (err.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(400).json({ error: "Cannot delete quiz due to dependencies (Foreign Key)." });
        }
        res.status(500).json({ error: "Failed to delete quiz" });
    }
}



/**
 * ✅ ADD QUESTION
 */
async function addQuestion(req, res) {
    const { quizId } = req.params;
    const { question, options, correctAnswer, type, points } = req.body;
    const db = req.app.get("db");

    try {
        const [result] = await db.query(
            "INSERT INTO questions (quiz_id, question_text, question_type, correct_answer, points) VALUES (?, ?, ?, ?, ?)",
            [quizId, question, type || "Multiple Choice", correctAnswer, points || 1]
        );
        const questionId = result.insertId;

        if (options && options.length > 0) {
            const optionValues = options.map(opt => [questionId, opt, opt === correctAnswer]);
            await db.query("INSERT INTO options (question_id, option_text, is_correct) VALUES ?", [optionValues]);
        }
        res.status(201).json({ message: "Question added", questionId });
    } catch (err) {
        console.error("Add Question Error:", err);
        res.status(500).json({ error: "Failed to add question" });
    }
}

/**
 * ✅ UPDATE QUESTION
 */
async function updateQuestion(req, res) {
    const { questionId } = req.params;
    const { question, options, correctAnswer, points } = req.body;
    const db = req.app.get("db");

    try {
        // Update Question Text
        await db.query(
            "UPDATE questions SET question_text = ?, correct_answer = ?, points = ? WHERE id = ?",
            [question, correctAnswer, points || 1, questionId]
        );

        // Update Options: Simplest is Delete All & Re-insert
        await db.query("DELETE FROM options WHERE question_id = ?", [questionId]);
        
        if (options && options.length > 0) {
            const optionValues = options.map(opt => [questionId, opt, opt === correctAnswer]);
            await db.query("INSERT INTO options (question_id, option_text, is_correct) VALUES ?", [optionValues]);
        }

        res.json({ message: "Question updated" });
    } catch (err) {
        console.error("Update Question Error:", err);
        res.status(500).json({ error: "Failed to update question" });
    }
}

/**
 * ✅ DELETE QUESTION
 */
async function deleteQuestion(req, res) {
    const { questionId } = req.params;
    const db = req.app.get("db");

    try {
        // Manual Cascade Delete (Options first)
        await db.query("DELETE FROM options WHERE question_id = ?", [questionId]);
        await db.query("DELETE FROM questions WHERE id = ?", [questionId]);

        res.json({ message: "Question deleted" });
    } catch (err) {
        console.error("Delete Question Error:", err);
        res.status(500).json({ error: "Failed to delete question" });
    }
}

/**
 * ✅ GET QUIZ ATTEMPT DETAILS (For Verification/Grading)
 */
async function getQuizAttemptDetails(req, res) {
    const { attemptId } = req.params;
    const db = req.app.get("db");

    try {
        // Query to get answers joined with questions
        const [rows] = await db.query(`
            SELECT 
                qa.id, 
                qa.user_answer as answerText, 
                qa.manual_score as marks,
                qa.is_correct,
                q.id as question_id,
                q.question_text, 
                q.question_type,
                q.correct_answer,
                q.points as maxPoints
            FROM quiz_answers qa
            JOIN questions q ON qa.question_id = q.id
            WHERE qa.attempt_id = ?
        `, [attemptId]);

        // Fetch correct options for MCQs in this attempt
        const questionIds = rows.map(r => r.question_id);
        let mcqMap = {};
        
        if (questionIds.length > 0) {
            const [opts] = await db.query(`
                SELECT question_id, option_text 
                FROM options 
                WHERE question_id IN (?) AND is_correct = 1
            `, [questionIds]);
            
            opts.forEach(o => {
                mcqMap[o.question_id] = o.option_text;
            });
        }

        // Transform to match frontend expectation
        const submissions = rows.map(row => {
            // Determine Model Answer
            let modelAnswer = row.correct_answer;
            if (row.question_type === 'MCQ') {
                modelAnswer = mcqMap[row.question_id];
            }

            return {
                id: row.id,
                answerText: row.answerText,
                marks: row.marks !== null ? row.marks : (row.is_correct ? row.maxPoints : 0),
                isGraded: row.marks !== null,
                question: {
                    questionText: row.question_text,
                    questionType: row.question_type,
                    maxPoints: row.maxPoints,
                    modelAnswer: modelAnswer
                }
            };
        });

        res.json(submissions);

    } catch (err) {
        console.error("Get Attempt Details Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GRADE INDIVIDUAL ANSWER
 */
async function gradeAnswer(req, res) {
    const { submissionId, marks } = req.body;
    const db = req.app.get("db");

    try {
        // 1. Update the answer with manual score
        await db.query(
            "UPDATE quiz_answers SET manual_score = ? WHERE id = ?",
            [marks, submissionId]
        );

        // 2. Recalculate Total Score for the Attempt
        // First get the attempt_id
        const [ansRows] = await db.query("SELECT attempt_id FROM quiz_answers WHERE id = ?", [submissionId]);
        if (ansRows.length > 0) {
            const attemptId = ansRows[0].attempt_id;

            // Sum all manual_scores (or fallback to auto score logic if null? simpler to just sum manual_score if we enforce it)
            // But some might be null.
            // Logic: IF manual_score IS NOT NULL, use it. ELSE use (is_correct * question.points)
            
            const [scoreRows] = await db.query(`
                SELECT SUM(
                    COALESCE(qa.manual_score, CASE WHEN qa.is_correct = 1 THEN q.points ELSE 0 END)
                ) as totalScore
                FROM quiz_answers qa
                JOIN questions q ON qa.question_id = q.id
                WHERE qa.attempt_id = ?
            `, [attemptId]);
            
            const newTotal = scoreRows[0].totalScore || 0;

            // Update Attempt
            await db.query("UPDATE quiz_attempts SET score = ?, status = 'COMPLETED' WHERE id = ?", [newTotal, attemptId]);
        }

        res.json({ message: "Grade saved successfully" });

    } catch (err) {
        console.error("Grade Answer Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

/**
 * ✅ GET STUDENT DETAILS (For Reports Modal)
 */
async function getStudentDetails(req, res) {
    const { id } = req.params; // Student ID
    const db = req.app.get("db");

    try {
        // 1. Fetch Student Basic Info
        const [users] = await db.query("SELECT id, username, email FROM users WHERE id = ?", [id]);
        if (users.length === 0) return res.status(404).json({ error: "Student not found" });
        const student = users[0];

        // 2. Fetch Quiz History with Topic Info
        const [quizHistory] = await db.query(`
            SELECT qa.id as attemptId, q.title as quizTitle, qa.score, qa.status, qa.completed_at as date,
                   t.name as topicName
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            LEFT JOIN topics t ON q.topic_id = t.id
            WHERE qa.user_id = ?
            ORDER BY qa.completed_at DESC
        `, [id]);

        // --- Analytics Calculation ---
        const completedQuizzes = quizHistory.filter(q => q.status === 'COMPLETED' && q.score !== null);
        
        // A. Topic Performance
        const topicStats = {};
        completedQuizzes.forEach(q => {
            const topic = q.topicName || 'General';
            if (!topicStats[topic]) {
                topicStats[topic] = { totalScore: 0, count: 0 };
            }
            topicStats[topic].totalScore += q.score;
            topicStats[topic].count += 1;
        });

        const topicPerformance = Object.keys(topicStats).map(topic => ({
            topic,
            avgScore: Math.round(topicStats[topic].totalScore / topicStats[topic].count)
        })).sort((a, b) => b.avgScore - a.avgScore);

        // B. Skill Progression (Time Series)
        // Sort oldest to newest for the line chart
        const progression = [...completedQuizzes]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(q => ({
                date: new Date(q.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                score: q.score,
                quiz: q.quizTitle
            }));

        // C. Strengths & Weaknesses
        const strengths = topicPerformance.filter(t => t.avgScore >= 75).slice(0, 3);
        const weaknesses = topicPerformance.filter(t => t.avgScore < 75).slice(0, 3);

        // 3. Fetch Course Progress... (Existing)
        const [progressRows] = await db.query(`
            SELECT 
                c.id as courseId, 
                c.title as courseTitle,
                COUNT(DISTINCT q.id) as totalQuizzes,
                COUNT(DISTINCT CASE WHEN qa.status = 'COMPLETED' THEN qa.id END) as completedQuizzes
            FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            LEFT JOIN subjects s ON s.course_id = c.id
            LEFT JOIN topics t ON t.subject_id = s.id
            LEFT JOIN quizzes q ON q.topic_id = t.id
            LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.user_id = ?
            WHERE e.user_id = ?
            GROUP BY c.id
        `, [id, id]);

        const courseProgress = progressRows.map(row => ({
            courseTitle: row.courseTitle,
            progress: row.totalQuizzes > 0 ? Math.round((row.completedQuizzes / row.totalQuizzes) * 100) : 0
        }));

        res.json({
            studentName: student.username,
            email: student.email,
            courseProgress,
            quizHistory, // Contains topicName now
            analytics: {
                topicPerformance,
                progression,
                strengths,
                weaknesses
            }
        });

    } catch (err) {
        console.error("Get Student Details Error:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
  generateQuiz,
  createQuiz,
  assignQuiz,
  getStudentQuizzes,
  submitQuiz,
  getQuizById,
  getAllQuizzes,
  getStudentStats,
  getAllQuizAttempts,
  getStudentDetails, // ✅ Exported
  getQuizAttemptDetails, // ✅ Exported
  gradeAnswer, // ✅ Exported
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  gradeQuizAttempt
};
