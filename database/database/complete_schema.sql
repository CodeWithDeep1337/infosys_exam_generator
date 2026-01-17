-- Complete Project Schema Dump
-- Generated on ${new Date().toISOString()}

CREATE DATABASE IF NOT EXISTS `skillforge`;
USE `skillforge`;

SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for courses
CREATE TABLE `courses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `difficulty` varchar(20) NOT NULL,
  `duration` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `instructor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKcyfum8goa6q5u13uog0563gyp` (`instructor_id`),
  CONSTRAINT `FKcyfum8goa6q5u13uog0563gyp` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for enrollments
CREATE TABLE `enrollments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `completed_at` datetime(6) DEFAULT NULL,
  `enrolled_at` datetime(6) DEFAULT NULL,
  `progress` int NOT NULL,
  `course_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKho8mcicp4196ebpltdn9wl6co` (`course_id`),
  KEY `FK3hjx6rcnbmfw368sxigrpfpx0` (`user_id`),
  CONSTRAINT `FK3hjx6rcnbmfw368sxigrpfpx0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKho8mcicp4196ebpltdn9wl6co` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for materials
CREATE TABLE `materials` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `topic_id` bigint NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `uploaded_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for options
CREATE TABLE `options` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `question_id` bigint NOT NULL,
  `option_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `order_num` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_question` (`question_id`),
  CONSTRAINT `options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=499 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for questions
CREATE TABLE `questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `question_text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correct_answer` text COLLATE utf8mb4_unicode_ci,
  `order_num` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `points` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_quiz` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for quiz_answers
CREATE TABLE `quiz_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `question_id` int NOT NULL,
  `user_answer` text,
  `is_correct` tinyint(1) DEFAULT NULL,
  `manual_score` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for quiz_attempts
CREATE TABLE `quiz_attempts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `quiz_id` bigint NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `score` int DEFAULT NULL,
  `timestamp` datetime(6) DEFAULT NULL,
  `total_questions` int DEFAULT NULL,
  `user_id` bigint NOT NULL,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for quiz_questions
CREATE TABLE `quiz_questions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correct_option` varchar(1) DEFAULT NULL,
  `optiona` varchar(255) DEFAULT NULL,
  `optionb` varchar(255) DEFAULT NULL,
  `optionc` varchar(255) DEFAULT NULL,
  `optiond` varchar(255) DEFAULT NULL,
  `question_text` text NOT NULL,
  `quiz_id` bigint NOT NULL,
  `question_type` enum('MCQ','SHORT_ANSWER','TRUE_FALSE') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKanfmgf6ksbdnv7ojb0pfve54q` (`quiz_id`),
  CONSTRAINT `FKanfmgf6ksbdnv7ojb0pfve54q` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for quiz_submissions
CREATE TABLE `quiz_submissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `answer_text` text,
  `is_graded` bit(1) DEFAULT NULL,
  `marks` int DEFAULT NULL,
  `attempt_id` bigint NOT NULL,
  `question_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt06c1omrpsjebprs1yijmk6vb` (`attempt_id`),
  KEY `FKnmrct0xio6rgqe14errstvu37` (`question_id`),
  CONSTRAINT `FKnmrct0xio6rgqe14errstvu37` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`),
  CONSTRAINT `FKt06c1omrpsjebprs1yijmk6vb` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for quizzes
CREATE TABLE `quizzes` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `display_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `topic_id` bigint NOT NULL,
  `created_by` bigint DEFAULT NULL,
  `difficulty` varchar(50) DEFAULT 'Medium',
  `time_limit` int DEFAULT '10',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4o46nv6sdgsqyjf0mitt74hh7` (`display_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for subjects
CREATE TABLE `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `name` varchar(255) NOT NULL,
  `course_id` bigint NOT NULL,
  `instructor_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr4k4crqhj5ojibxp458ndbywv` (`course_id`),
  KEY `FKac7lgl55uihftrk9ntuj8oq17` (`instructor_id`),
  CONSTRAINT `FKac7lgl55uihftrk9ntuj8oq17` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKr4k4crqhj5ojibxp458ndbywv` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for topics
CREATE TABLE `topics` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` text,
  `name` varchar(200) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `subject_id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK957k7bkcrurt9uen2242medmq` (`subject_id`),
  CONSTRAINT `FK957k7bkcrurt9uen2242medmq` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for users
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `college` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
