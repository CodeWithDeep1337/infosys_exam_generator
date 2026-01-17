const mysql = require('mysql2/promise');

async function addDummyData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deep123@sqL',
    database: 'skillforge'
  });

  try {
    console.log("Adding Dummy Data for Course 1 (Java)...");

    // 1. Add Subject
    const [subRes] = await connection.execute(
      'INSERT INTO subjects (name, description, course_id, instructor_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      ['Java Basics', 'Introduction to Java Syntax', 1, 1]
    );
    const subjectId = subRes.insertId;
    console.log(`Added Subject: Java Basics (ID: ${subjectId})`);

    // 2. Add Topic
    const [topRes] = await connection.execute(
      'INSERT INTO topics (name, content, type, subject_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      ['Variables & Types', 'Learn about int, string, boolean', 'TEXT', subjectId]
    );
    const topicId = topRes.insertId;
    console.log(`Added Topic: Variables & Types (ID: ${topicId})`);

    // 3. Add Material
    await connection.execute(
      'INSERT INTO materials (title, type, link, topic_id, created_at) VALUES (?, ?, ?, ?, NOW())',
      ['Java Cheatsheet', 'PDF', 'https://example.com/java.pdf', topicId]
    );
    console.log(`Added Material: Java Cheatsheet`);

  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}

addDummyData();
