const fs = require('fs');
const pdfParse = require('pdf-parse');
const { SKILL_DICTIONARY } = require('./skillDictionary');

/**
 * Parses a resume file (PDF or text) and extracts structured data.
 * @param {string} filePath - Absolute path to uploaded resume file
 * @param {string} fileType - 'pdf' or 'docx' or 'doc'
 * @returns {Promise<{ extractedText: string, extractedSkills: string[], parsedData: object }>}
 */
const parseResumeFile = async (filePath, fileType) => {
  let rawText = '';

  try {
    const fileBuffer = fs.readFileSync(filePath);

    if (fileType === 'pdf') {
      const pdfData = await pdfParse(fileBuffer);
      rawText = pdfData.text || '';
    } else {
      // Fallback for docx/txt or raw stream
      rawText = fileBuffer.toString('utf8');
    }
  } catch (err) {
    console.error('[Resume Parser] Error extracting raw text:', err.message);
    rawText = '';
  }

  // Extract skills based on controlled dictionary
  const foundSkillsSet = new Set();
  const lowerText = rawText.toLowerCase();

  SKILL_DICTIONARY.forEach((skill) => {
    // Escape regex special chars in skill name
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Word boundary match
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9#+])${escaped}(?:$|[^a-zA-Z0-9#+])`, 'i');
    if (regex.test(lowerText)) {
      foundSkillsSet.add(skill);
    }
  });

  const extractedSkills = Array.from(foundSkillsSet);

  // Extract contact info
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  // Extract education keywords
  const eduKeywords = [
    'b.tech', 'm.tech', 'bachelor', 'master', 'b.e.', 'm.e.', 'phd',
    'computer science', 'information technology', 'bca', 'mca', 'b.sc', 'm.sc'
  ];
  const detectedEducation = [];
  eduKeywords.forEach((edu) => {
    if (lowerText.includes(edu)) {
      detectedEducation.push(edu.toUpperCase());
    }
  });

  // Estimate experience in years
  let estimatedExpYears = 0;
  const expMatch = lowerText.match(/(\d+)\+?\s*(?:years?|yrs?)(?:\s*of)?\s*experience/i);
  if (expMatch && expMatch[1]) {
    estimatedExpYears = parseInt(expMatch[1], 10);
  }

  return {
    extractedText: rawText.slice(0, 5000), // store up to 5k characters preview
    extractedSkills,
    parsedData: {
      education: detectedEducation,
      experienceYears: estimatedExpYears,
      contactInfo: {
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
      },
    },
  };
};

module.exports = {
  parseResumeFile,
};
