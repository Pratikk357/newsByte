import nltk
from nltk.corpus import stopwords
from nltk.tokenize import sent_tokenize,word_tokenize
from nltk.stem import PorterStemmer
from nltk import bigrams, trigrams
import re

import numpy as np
import string
from collections import Counter

def rouge(text,summ):
    funcs =[(word_tokenize,"uni"),(bigrams,"bi"),(trigrams,"tri")]
    metrics = {

    }
    for f in funcs:
        s = Counter(f[0](summ))
        t = Counter(f[0](text))

        s_sum = np.sum([min(s[w],t[w]) for w in s if w in t])
        t_sum = np.sum([t[w] for w in t])
        met ={}
        met["recall"] = s_sum/t_sum if(t_sum!=0) else 0
        met["precision"] = s_sum/len(s) if(len(s)!=0) else 0
        met["F1"]= (2*met["precision"]*met["recall"])/(met["precision"]+met["recall"])
        metrics[f[1]] = met
    return metrics

def nepali_sent_tokenize(text):
    # Keep the ending punctuation (।, ., !, ?) with its sentence so the summary reads naturally
    sentences = re.findall(r'[^।.!?]+[।.!?]?', text)
    return [s.strip() for s in sentences if s.strip()]

def summarize_from_scratch(text,lang="english",damp_fact=0.15,max_iter=100,tol=1e-6):
    sw = set(stopwords.words(lang))
    if lang == "nepali":
        ultra_raw_data = nepali_sent_tokenize(text)
    else:
        ultra_raw_data = sent_tokenize(text)

    total_doc = len(ultra_raw_data)
    if total_doc == 0:
        return ""
    sum_length = int(total_doc*0.3) if total_doc>3 else 1

    # Porter stemmer only knows English suffixes, so Nepali words are kept as-is
    stemmer = PorterStemmer() if lang == "english" else None
    raw_data = []
    for sent in ultra_raw_data:
        # "।" is not in string.punctuation and word_tokenize glues it to the last word, so strip it first
        words = [word.lower() for word in word_tokenize(sent.replace("।", " ")) if word.lower() not in sw and word not in string.punctuation]
        if stemmer:
            words = [stemmer.stem(word) for word in words]
        raw_data.append(words)

    # Document frequency: number of sentences (our "documents") that contain each word
    doc_freq = Counter(word for sent in raw_data for word in set(sent))
    vocab = {word: j for j, word in enumerate(doc_freq)}

    # TF-IDF vector for every sentence
    sent_vectors = np.zeros((total_doc, len(vocab)))
    for i, sent in enumerate(raw_data):
        for word, count in Counter(sent).items():
            tf = count/len(sent)
            idf = np.log(total_doc/doc_freq[word])
            sent_vectors[i][vocab[word]] = tf*idf

    # Cosine similarity between sentences (edges of the TextRank graph).
    # Sentences with an all-zero vector get similarity 0 instead of dividing by zero.
    norms = np.linalg.norm(sent_vectors, axis=1)
    similarity_matrix = np.zeros((total_doc, total_doc))
    for i in range(total_doc):
        for j in range(i+1, total_doc):
            if norms[i] > 0 and norms[j] > 0:
                cosine_similarity = np.dot(sent_vectors[i], sent_vectors[j])/(norms[i]*norms[j])
                similarity_matrix[i][j] = similarity_matrix[j][i] = cosine_similarity

    # Column-normalise into a transition matrix. A sentence with no similar
    # sentences (a "dangling node") links to every sentence equally, as in PageRank.
    col_sums = similarity_matrix.sum(axis=0)
    A = np.where(col_sums > 0, similarity_matrix/np.where(col_sums > 0, col_sums, 1), 1/total_doc)

    # PageRank by power iteration: r = (1-p)·A·r + p/N, repeated until it stops changing.
    # The fixed point is the eigenvector of M = (1-p)A + p/N with eigenvalue 1.
    p = damp_fact
    scores = np.ones(total_doc)/total_doc
    for _ in range(max_iter):
        new_scores = (1-p)*A.dot(scores) + p/total_doc
        converged = np.abs(new_scores - scores).sum() < tol
        scores = new_scores
        if converged:
            break

    # Pick the highest-scoring sentences, then restore their original order
    top = sorted(range(total_doc), key=lambda i: scores[i], reverse=True)[:sum_length]
    return " ".join(ultra_raw_data[i] for i in sorted(top))


# texts=["""
# Natural language processing has its roots in the 1950s.[1]
#  Already in 1950, Alan Turing published an article titled 
# "Computing Machinery and Intelligence" which proposed what is now called the Turing test as 
# a criterion of intelligence, though at the time that was not articulated as a 
# problem separate from artificial intelligence. The proposed test includes a task that involves the automated interpretation and generation of natural language. 
# """,
# """
# The premise of symbolic NLP is well-summarized by John Searle's Chinese room experiment: Given a collection of rules (e.g., a Chinese phrasebook, with questions and matching answers), the computer emulates natural language understanding (or other NLP tasks) by applying those rules to the data it confronts. 
# """,
# """
# The Georgetown experiment in 1954 involved fully automatic translation of more than sixty Russian sentences into English. The authors claimed that within three or five years, machine translation would be a solved problem.[2] However, real progress was much slower, and after the ALPAC report in 1966, which found that ten years of research had failed to fulfill the expectations, funding for machine translation was dramatically reduced. Little further research in machine translation was conducted in America (though some research continued elsewhere, such as Japan and Europe[3]) until the late 1980s when the first statistical machine translation systems were developed.
# """
# ]

# print([summarize_from_scratch(text) for text in texts])

# print(rouge(summarize_from_scratch(texts[0]),texts[0]))
# print(rouge("hello how are you","hello how are you"))