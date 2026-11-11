/**
 * SmartHire Intelligent Recommendation Engine
 * Real, explainable, rule-based recommendation algorithm with 5-factor weighted evaluation.
 * Weights:
 * - Skills: 50%
 * - Education: 15%
 * - Experience: 15%
 * - Job Preferences: 10%
 * - Location: 10%
 */

const normalizeText = (text) => (text ? text.toString().toLowerCase().trim() : '');

const EDUCATION_HIERARCHY = {
  phd: 5,
  doctorate: 5,
  master: 4,
  masters: 4,
  mtech: 4,
  'm.tech': 4,
  mca: 4,
  ms: 4,
  'm.s': 4,
  bachelor: 3,
  bachelors: 3,
  btech: 3,
  'b.tech': 3,
  be: 3,
  'b.e': 3,
  bca: 3,
  bs: 3,
  'b.s': 3,
  diploma: 2,
  associate: 2,
  'high school': 1,
  secondary: 1,
};

const getEducationLevel = (eduString) => {
  if (!eduString) return 2;
  const lower = eduString.toLowerCase();
  for (const [key, level] of Object.entries(EDUCATION_HIERARCHY)) {
    if (lower.includes(key)) {
      return level;
    }
  }
  return 3; // Default to bachelor level if unspecified
};

/**
 * Calculates comprehensive match between candidate profile and a specific job.
 */
const calculateCandidateJobMatch = (candidateProfile, job) => {
  if (!candidateProfile || !job) {
    return {
      overallScore: 0,
      skillCoverage: 0,
      matchedSkills: [],
      missingSkills: [],
      educationMatch: 0,
      experienceMatch: 0,
      locationMatch: 0,
      preferencesMatch: 0,
      explanation: 'Insufficient profile or job information to calculate match.',
    };
  }

  // 1. SKILLS EVALUATION (50% WEIGHT)
  const candidateSkillNames = new Set(
    (candidateProfile.skills || []).map((s) => normalizeText(typeof s === 'string' ? s : s.name))
  );

  const requiredSkills = (job.requiredSkills || []).map((s) =>
    typeof s === 'string' ? { name: s, weight: 1 } : { name: s.name, weight: s.weight || 1 }
  );

  const matchedSkills = [];
  const missingSkills = [];
  let totalRequiredWeight = 0;
  let earnedSkillWeight = 0;

  if (requiredSkills.length === 0) {
    // If job has no strictly required skills specified
    earnedSkillWeight = 100;
    totalRequiredWeight = 100;
  } else {
    requiredSkills.forEach((req) => {
      const normalizedReq = normalizeText(req.name);
      totalRequiredWeight += req.weight;

      // Check direct or partial match
      let isMatched = false;
      for (const candSkill of candidateSkillNames) {
        if (candSkill === normalizedReq || candSkill.includes(normalizedReq) || normalizedReq.includes(candSkill)) {
          isMatched = true;
          break;
        }
      }

      if (isMatched) {
        matchedSkills.push(req.name);
        earnedSkillWeight += req.weight;
      } else {
        missingSkills.push(req.name);
      }
    });
  }

  const skillCoverage = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 100;

  const skillsScore = totalRequiredWeight > 0
    ? Math.min(100, Math.round((earnedSkillWeight / totalRequiredWeight) * 100))
    : 100;

  // 2. EDUCATION EVALUATION (15% WEIGHT)
  let highestCandEduLevel = 2; // Baseline
  if (candidateProfile.education && candidateProfile.education.length > 0) {
    candidateProfile.education.forEach((edu) => {
      const level = getEducationLevel(`${edu.degree} ${edu.fieldOfStudy}`);
      if (level > highestCandEduLevel) highestCandEduLevel = level;
    });
  }

  const jobRequiredEduLevel = getEducationLevel(job.minEducation || 'Bachelors');
  let educationScore = 70;
  if (highestCandEduLevel >= jobRequiredEduLevel) {
    educationScore = 100;
  } else if (highestCandEduLevel === jobRequiredEduLevel - 1) {
    educationScore = 65;
  } else {
    educationScore = 40;
  }

  // 3. EXPERIENCE EVALUATION (15% WEIGHT)
  let candidateExpYears = candidateProfile.totalExperienceYears || 0;
  if (!candidateExpYears && candidateProfile.calculateExperienceYears) {
    candidateExpYears = candidateProfile.calculateExperienceYears();
  } else if (!candidateExpYears && candidateProfile.experience && candidateProfile.experience.length > 0) {
    candidateExpYears = candidateProfile.experience.length * 1.0;
  }

  const minRequiredExp = job.minExperienceYears || 0;
  let experienceScore = 100;
  if (minRequiredExp > 0) {
    if (candidateExpYears >= minRequiredExp) {
      experienceScore = 100;
    } else {
      experienceScore = Math.max(25, Math.round((candidateExpYears / minRequiredExp) * 100));
    }
  }

  // 4. JOB PREFERENCES EVALUATION (10% WEIGHT)
  let preferencesScore = 70; // Reasonable default
  const jobPrefs = candidateProfile.jobPreferences || {};
  if (jobPrefs.types && jobPrefs.types.length > 0) {
    if (jobPrefs.types.includes(job.jobType)) {
      preferencesScore = 100;
    } else {
      preferencesScore = 50;
    }
  }
  if (jobPrefs.roles && jobPrefs.roles.length > 0) {
    const jobTitleLower = normalizeText(job.title);
    const matchesRole = jobPrefs.roles.some((role) =>
      jobTitleLower.includes(normalizeText(role)) || normalizeText(role).includes(jobTitleLower)
    );
    if (matchesRole) preferencesScore = Math.min(100, preferencesScore + 20);
  }

  // 5. LOCATION EVALUATION (10% WEIGHT)
  let locationScore = 60;
  const candidateLoc = normalizeText(candidateProfile.location);
  const jobLoc = normalizeText(job.location);
  const prefLocations = (jobPrefs.preferredLocations || []).map(normalizeText);

  if (job.isRemote || jobPrefs.remoteOnly) {
    locationScore = 100;
  } else if (candidateLoc && (jobLoc.includes(candidateLoc) || candidateLoc.includes(jobLoc))) {
    locationScore = 100;
  } else if (prefLocations.some((pl) => jobLoc.includes(pl) || pl.includes(jobLoc))) {
    locationScore = 95;
  } else {
    locationScore = 45;
  }

  // OVERALL WEIGHTED CALCULATION
  // Skills: 50%, Education: 15%, Experience: 15%, Preferences: 10%, Location: 10%
  const overallScore = Math.round(
    skillsScore * 0.5 +
    educationScore * 0.15 +
    experienceScore * 0.15 +
    preferencesScore * 0.1 +
    locationScore * 0.1
  );

  // EXPLAINABLE EXPLANATION GENERATION
  const reasons = [];
  if (skillsScore >= 80) {
    reasons.push(`Strong skill match (${matchedSkills.length}/${requiredSkills.length} required skills matched)`);
  } else if (skillsScore >= 50) {
    reasons.push(`Moderate skill alignment (${matchedSkills.length}/${requiredSkills.length} required skills)`);
  } else {
    reasons.push(`Skill gap identified (${missingSkills.length} key required skills missing)`);
  }

  if (educationScore >= 100) {
    reasons.push(`Fully meets education criteria (${job.minEducation || 'Bachelors'})`);
  }

  if (experienceScore >= 100) {
    reasons.push(`Satisfies experience requirement (${candidateExpYears} yrs vs ${minRequiredExp} yrs required)`);
  } else {
    reasons.push(`Experience is below preferred (${candidateExpYears} yrs vs ${minRequiredExp} yrs required)`);
  }

  if (locationScore >= 90) {
    reasons.push(job.isRemote ? 'Remote position matching preference' : 'Location aligns with candidate location');
  }

  const explanation = reasons.join('. ') + '.';

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    skillCoverage,
    skillsScore,
    matchedSkills,
    missingSkills,
    educationMatch: educationScore,
    experienceMatch: experienceScore,
    locationMatch: locationScore,
    preferencesMatch: preferencesScore,
    explanation,
  };
};

/**
 * Returns ranked jobs for a specific candidate with match scores and breakdowns.
 */
const rankJobsForCandidate = (candidateProfile, jobs) => {
  return jobs
    .map((job) => {
      const match = calculateCandidateJobMatch(candidateProfile, job);
      return {
        job,
        match,
      };
    })
    .sort((a, b) => b.match.overallScore - a.match.overallScore);
};

/**
 * Returns ranked candidates for a specific job (used in recruiter dashboard).
 */
const rankCandidatesForJob = (job, candidateProfilesWithUsers) => {
  return candidateProfilesWithUsers
    .map((candidate) => {
      const match = calculateCandidateJobMatch(candidate, job);
      return {
        candidate,
        match,
      };
    })
    .sort((a, b) => b.match.overallScore - a.match.overallScore);
};

module.exports = {
  calculateCandidateJobMatch,
  rankJobsForCandidate,
  rankCandidatesForJob,
};
