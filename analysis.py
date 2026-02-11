import spacy
from textblob import TextBlob
from collections import Counter
import re

nlp = spacy.load("en_core_web_sm")

def analyze_content(text):
    doc = nlp(text)

    # Readability (simple heuristic)
    words = len(text.split())
    sentences = len(list(doc.sents))
    readability = min(100, int((sentences / max(words,1)) * 1000))

    # Sentiment
    blob = TextBlob(text)
    sentiment_score = blob.sentiment.polarity
    sentiment = (
        "Positive" if sentiment_score > 0.1
        else "Negative" if sentiment_score < -0.1
        else "Neutral"
    )

    # Keywords
    tokens = [
        token.text.lower()
        for token in doc
        if token.is_alpha and not token.is_stop
    ]
    freq = Counter(tokens).most_common(5)
    keywords = [
        {"keyword": k, "density": round((v / len(tokens)) * 100, 2)}
        for k, v in freq
    ]

    # Engagement heuristic
    engagement = min(100, int(
        (sentiment_score + 1) * 40 + min(words, 300) / 6
    ))

    # Suggestions
    suggestions = []
    if readability < 60:
        suggestions.append("Use shorter sentences for better readability.")
    if sentiment == "Neutral":
        suggestions.append("Add emotionally engaging words.")
    if engagement < 60:
        suggestions.append("Include a call-to-action or storytelling elements.")

    return {
        "metrics": {
            "readability": readability,
            "sentiment": {
                "label": sentiment,
                "score": sentiment_score
            },
            "keywords": keywords,
            "engagement": engagement
        },
        "suggestions": suggestions
    }
