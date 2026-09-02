import re
import json
from typing import List, Dict, Any, Optional

def calculate_word_similarity(w1: str, w2: str) -> float:
    """Calculate normalized Levenshtein similarity between two words."""
    w1 = re.sub(r'[^\w\s]', '', w1.lower()).strip()
    w2 = re.sub(r'[^\w\s]', '', w2.lower()).strip()
    
    if not w1 and not w2:
        return 1.0
    if not w1 or not w2:
        return 0.0
    if w1 == w2:
        return 1.0

    len1, len2 = len(w1), len(w2)
    dp = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    for i in range(len1 + 1):
        dp[i][0] = i
    for j in range(len2 + 1):
        dp[0][j] = j

    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if w1[i - 1] == w2[j - 1] else 1
            dp[i][j] = min(
                dp[i - 1][j] + 1,      # deletion
                dp[i][j - 1] + 1,      # insertion
                dp[i - 1][j - 1] + cost  # substitution
            )

    dist = dp[len1][len2]
    max_len = max(len1, len2)
    return max(0.0, 1.0 - (dist / max_len))

def generate_phonetic_hint(word: str) -> str:
    """Generate friendly phonetic pronunciation guide for common English sounds."""
    w = word.lower().strip()
    hints = {
        "learning": "LUR-ning",
        "literacy": "LIT-er-uh-see",
        "pronunciation": "pruh-nun-see-AY-shun",
        "knowledge": "NAH-lij",
        "reading": "REE-ding",
        "writing": "RY-ting",
        "speaking": "SPEE-king",
        "assistant": "uh-SIS-tunt",
        "education": "ed-yoo-KAY-shun",
        "sentence": "SEN-tens",
        "language": "LANG-gwij",
        "practice": "PRAK-tis",
        "tomorrow": "tuh-MAH-roh",
        "yesterday": "YES-ter-day",
        "beautiful": "BYOO-tih-ful",
        "confidence": "KAHN-fih-duns",
        "vocabulary": "voh-KAB-yuh-lair-ee",
        "opportunity": "ah-per-TOO-nih-tee"
    }
    if w in hints:
        return hints[w]
    
    vowels = "aeiouy"
    chunks = []
    curr = ""
    for char in w:
        curr += char
        if char in vowels and len(curr) >= 2:
            chunks.append(curr.upper())
            curr = ""
    if curr:
        if chunks:
            chunks[-1] += curr.upper()
        else:
            chunks.append(curr.upper())
    return "-".join(chunks) if chunks else word.upper()

def evaluate_pronunciation_heuristic(target_text: str, recognized_text: str) -> Dict[str, Any]:
    """
    Algorithmic phonetic and textual pronunciation model comparing target text to recognized audio transcript.
    Strictly penalizes incorrect, missing, or substituted words.
    """
    target_clean = re.sub(r'[^\w\s]', '', target_text.lower()).strip()
    rec_clean = re.sub(r'[^\w\s]', '', (recognized_text or "").lower()).strip()

    target_words = [w for w in target_clean.split() if w]
    rec_words = [w for w in rec_clean.split() if w]
    
    if not target_words:
        return {
            "overall_score": 0.0,
            "accuracy_score": 0.0,
            "fluency_score": 0.0,
            "completeness_score": 0.0,
            "word_analysis": [],
            "transcription": recognized_text or "",
            "feedback": {
                "general": "No target sentence was provided.",
                "strength": "None",
                "focus_area": "Select a practice drill.",
                "intonation": "N/A"
            }
        }

    # If user spoke nothing
    if not rec_words:
        word_analysis = [
            {
                "word": w,
                "spoken": None,
                "status": "omitted",
                "accuracy": 0.0,
                "phonetic_hint": generate_phonetic_hint(w),
                "tip": f"Missing word. Pronounce as: {generate_phonetic_hint(w)}."
            }
            for w in target_words
        ]
        return {
            "overall_score": 0.0,
            "accuracy_score": 0.0,
            "fluency_score": 0.0,
            "completeness_score": 0.0,
            "word_analysis": word_analysis,
            "transcription": "",
            "feedback": {
                "general": "No speech was detected. Please ensure your microphone is working and speak clearly.",
                "strength": "None detected.",
                "focus_area": "Try speaking louder and closer to your microphone.",
                "intonation": "No audio recorded."
            }
        }

    word_analysis: List[Dict[str, Any]] = []
    total_similarity = 0.0
    matched_words_count = 0

    rec_idx = 0
    for target_word in target_words:
        best_sim = 0.0
        best_match_rec = ""
        best_j = rec_idx

        # Search nearby window in spoken words (window of 4 words)
        window_end = min(len(rec_words), rec_idx + 4)
        for j in range(rec_idx, window_end):
            sim = calculate_word_similarity(target_word, rec_words[j])
            if sim > best_sim:
                best_sim = sim
                best_match_rec = rec_words[j]
                best_j = j

        if best_sim >= 0.85:
            status = "perfect"
            matched_words_count += 1
            feedback = "Crisp and accurate pronunciation!"
            rec_idx = best_j + 1
        elif best_sim >= 0.65:
            status = "good"
            matched_words_count += 0.7
            feedback = f"Close! Emphasize the clear sounds in '{target_word}'."
            rec_idx = best_j + 1
        elif best_sim >= 0.40:
            status = "needs_work"
            matched_words_count += 0.35
            feedback = f"Spoke '{best_match_rec}'. Sound it out: {generate_phonetic_hint(target_word)}."
            rec_idx = best_j + 1
        else:
            status = "mispronounced"
            feedback = f"Incorrect word (heard '{best_match_rec}' or missing). Sound it out: {generate_phonetic_hint(target_word)}."

        total_similarity += best_sim
        word_analysis.append({
            "word": target_word,
            "spoken": best_match_rec if best_sim >= 0.35 else (rec_words[rec_idx] if rec_idx < len(rec_words) else None),
            "status": status, # "perfect" | "good" | "needs_work" | "mispronounced" | "omitted"
            "accuracy": round(best_sim * 100, 1),
            "phonetic_hint": generate_phonetic_hint(target_word),
            "tip": feedback
        })

    num_target = len(target_words)
    accuracy_score = round((total_similarity / num_target) * 100, 1)
    
    # Completeness based on correctly matched words
    completeness_score = round((matched_words_count / num_target) * 100, 1)
    
    # Fluency is penalized if sentence is significantly shorter or longer or totally wrong
    length_penalty = 1.0 - min(1.0, abs(len(rec_words) - num_target) / max(num_target, 1) * 0.5)
    fluency_score = round(max(0.0, min(100.0, accuracy_score * 0.8 * length_penalty)), 1)
    
    # Overall score strictly reflects word accuracy and completeness
    overall_score = round((accuracy_score * 0.6 + completeness_score * 0.25 + fluency_score * 0.15), 1)
    overall_score = max(0.0, min(100.0, overall_score))

    if overall_score >= 85:
        general_feedback = "Outstanding pronunciation! You matched the target sentence with high accuracy."
        strength = "Clear articulation and accurate word order."
        focus_area = "Keep practicing complex sentences."
    elif overall_score >= 65:
        general_feedback = "Good attempt! Some words matched well, but check the highlighted red/yellow words."
        strength = "Identified several target words."
        focus_area = "Focus on the mispronounced words highlighted in red."
    elif overall_score >= 35:
        general_feedback = "Several words differed from the target sentence. Please read the exact sentence shown above."
        strength = "Detected spoken input."
        focus_area = "Listen to the audio model before speaking, and say the exact words shown."
    else:
        general_feedback = "The words you spoke did not match the target sentence. Please try again reading the exact words."
        strength = "Vocal attempt detected."
        focus_area = "Read the exact sentence on screen: '" + target_text + "'."

    return {
        "overall_score": overall_score,
        "accuracy_score": accuracy_score,
        "fluency_score": fluency_score,
        "completeness_score": completeness_score,
        "word_analysis": word_analysis,
        "transcription": recognized_text,
        "feedback": {
            "general": general_feedback,
            "strength": strength,
            "focus_area": focus_area,
            "intonation": "Natural pacing." if fluency_score >= 70 else "Pause and articulate word-by-word."
        }
    }
