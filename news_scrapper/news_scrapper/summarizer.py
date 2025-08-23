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
    sentences = re.split(r'[।.!?]\s*', text)
    return [s.strip() for s in sentences if s.strip()]

def summarize_from_scratch(text,lang="english",damp_fact=0.15):
    sw = stopwords.words(lang)
    if lang == "nepali":
        ultra_raw_data = nepali_sent_tokenize(text)
    else: 
        ultra_raw_data = sent_tokenize(text)

    sum_length = int(len(ultra_raw_data)*0.3) if len(ultra_raw_data)>3 else 1
    stemmer = PorterStemmer()
    raw_data = [[stemmer.stem(word.lower()) for word in word_tokenize(sent) if word.lower() not in sw and word not in string.punctuation] for sent in ultra_raw_data]

    # print(raw_data)
    vocab = set()
    raw_data_dict =[]
    
    words_occ_in_entire_doc = {}
    total_doc = len(raw_data)
    
    for sent in raw_data:
        temp_dict = {}
        for word in sent:
            if word in temp_dict:
                temp_dict[word]+=1
            else:
                temp_dict[word]=1

            if word in words_occ_in_entire_doc:
                words_occ_in_entire_doc[word]+=1
            else:
                words_occ_in_entire_doc[word]=1
                vocab.add(word)
            
        raw_data_dict.append(temp_dict)

    sent_vectors = []
    for i,sent in enumerate(raw_data_dict):
        vec = np.zeros(len(vocab))
        for j, word in enumerate(vocab):
            if word in sent:
                tf = sent[word]/len(raw_data[i])
                idf = np.log(total_doc/words_occ_in_entire_doc.get(word,1)) 
                vec[j] = tf*idf
        sent_vectors.append(vec)

    # print(sent_vectors)

    similarity_matrix = np.identity(len(sent_vectors))
    
    for i in range(0,len(sent_vectors)):
        for j in range(i+1,len(sent_vectors)):
            cosine_similarity = np.dot(sent_vectors[i],sent_vectors[j])/(np.linalg.norm(sent_vectors[i])*np.linalg.norm(sent_vectors[j]))
            similarity_matrix[i][j] = similarity_matrix[j][i] = cosine_similarity

    
    similarity_matrix/=similarity_matrix.sum(axis=0,keepdims=True)
    
    A = similarity_matrix
    B = np.ones_like(A)/len(A)
    p = damp_fact
    M = (1-p)*A + p*B

    _, eigenvectors = np.linalg.eig(M)


    scores = eigenvectors[:,0]/eigenvectors[:,0].sum()
    print(scores)

    # for i,s in enumerate(ultra_raw_data):
    #    print(f"{round(scores[i],2)} : {s}")
    # 
# 
    # return " ".join(tup[1] for tup in sorted([(scores[i],s) for i,s in enumerate(ultra_raw_data)])[:sum_length])   
    return " ".join(str(tup[2]) for tup in (sorted((d[1],d[0],d[2]) for d in sorted([(scores[i],i,s) for i,s in enumerate(ultra_raw_data)],reverse=True)[:sum_length])))


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