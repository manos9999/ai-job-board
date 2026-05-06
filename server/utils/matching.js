/**
 * TF-IDF Cosine Similarity matching for skills
 */

function normalize(skill) {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#.\s-]/g, '');
}

function buildVocabulary(skillSets) {
  const vocab = new Set();
  for (const skills of skillSets) {
    for (const skill of skills) {
      vocab.add(normalize(skill));
    }
  }
  return Array.from(vocab);
}

function computeTF(skills, vocabulary) {
  const normalized = skills.map(normalize);
  const tf = new Array(vocabulary.length).fill(0);
  for (let i = 0; i < vocabulary.length; i++) {
    const term = vocabulary[i];
    // Check for exact match or substring containment
    for (const skill of normalized) {
      if (skill === term) {
        tf[i] = 1;
        break;
      }
      // Partial matching: e.g., "react" matches "react.js" or "reactjs"
      const termClean = term.replace(/[.\s-]/g, '');
      const skillClean = skill.replace(/[.\s-]/g, '');
      if (termClean === skillClean || termClean.includes(skillClean) || skillClean.includes(termClean)) {
        tf[i] = 0.8;
      }
    }
  }
  return tf;
}

function computeIDF(documents, vocabulary) {
  const n = documents.length;
  const idf = new Array(vocabulary.length).fill(0);
  for (let i = 0; i < vocabulary.length; i++) {
    let docCount = 0;
    for (const doc of documents) {
      const normalized = doc.map(normalize);
      if (normalized.some(s => {
        const sClean = s.replace(/[.\s-]/g, '');
        const tClean = vocabulary[i].replace(/[.\s-]/g, '');
        return s === vocabulary[i] || sClean === tClean || sClean.includes(tClean) || tClean.includes(sClean);
      })) {
        docCount++;
      }
    }
    idf[i] = Math.log((n + 1) / (docCount + 1)) + 1;
  }
  return idf;
}

function computeTFIDF(tf, idf) {
  return tf.map((val, i) => val * idf[i]);
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeMatchScore(userSkills, jobSkills) {
  if (!userSkills || !jobSkills || userSkills.length === 0 || jobSkills.length === 0) {
    return { score: 0, matchedSkills: [], missingSkills: jobSkills || [] };
  }

  const userNormalized = userSkills.map(normalize);
  const jobNormalized = jobSkills.map(normalize);

  // Find exact and fuzzy matches
  const matchedSkills = [];
  const missingSkills = [];

  for (const jobSkill of jobSkills) {
    const jNorm = normalize(jobSkill);
    const jClean = jNorm.replace(/[.\s-]/g, '');
    const found = userNormalized.some(uNorm => {
      const uClean = uNorm.replace(/[.\s-]/g, '');
      return uNorm === jNorm || uClean === jClean || uClean.includes(jClean) || jClean.includes(uClean);
    });
    if (found) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }

  // TF-IDF cosine similarity
  const vocabulary = buildVocabulary([userSkills, jobSkills]);
  const documents = [userSkills, jobSkills];
  const idf = computeIDF(documents, vocabulary);

  const userTF = computeTF(userSkills, vocabulary);
  const jobTF = computeTF(jobSkills, vocabulary);

  const userTFIDF = computeTFIDF(userTF, idf);
  const jobTFIDF = computeTFIDF(jobTF, idf);

  const similarity = cosineSimilarity(userTFIDF, jobTFIDF);

  // Blend cosine similarity with direct skill overlap for better results
  const overlapRatio = matchedSkills.length / jobSkills.length;
  const blendedScore = (similarity * 0.6 + overlapRatio * 0.4) * 100;
  const score = Math.round(Math.min(100, Math.max(0, blendedScore)));

  return { score, matchedSkills, missingSkills };
}

module.exports = { computeMatchScore, computeTFIDF: computeTF, cosineSimilarity };
