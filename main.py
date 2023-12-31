from collections import Counter
from collections import defaultdict
import srt
import spacy
import sys
import os
import json

def check_subs(subtitlesFile, lang):
    subtitle_generatorTest = srt.parse('''\
    1
    00:31:37,894 --> 00:31:39,928
    OK, look, I think I have a plan here.
    2
    00:31:39,931 --> 00:31:41,931
    The plan is by using mainly spoons,
    3
    00:31:41,933 --> 00:31:43,435
    we dig a tunnel under the city and release it into the wild.
    ''')

    subtitle_generator = srt.parse(open(subtitlesFile, "r"))

    # subtitles = list(subtitle_generatorTest)
    subtitles = list(subtitle_generator)

    # print(subtitles[0].start)
    # print(subtitles[0].end)
    # print(subtitles[0].content)
    # print(srt.compose(subtitles))

    # Separate arrays
    all_texts = [subtitle.content for subtitle in subtitles]
    all_starts = [subtitle.start for subtitle in subtitles]

    # Example usage
    # print("All Texts:", all_texts)
    # print("All Starts:", all_starts)

    # Calculate the duration
    total_duration_seconds = (all_starts[-1] - all_starts[0]).total_seconds()

    # Convert to percentage values rounded to 2 decimal places
    percentage_values = [round(start.total_seconds() / total_duration_seconds * 100, 2) for start in all_starts] 

    # Example usage
    # print("Percentage Values:", percentage_values)

    ###############################
    # spacy udpipe model example usage
    # import spacy_udpipe

    # spacy_udpipe.download("en") # download English model
    # spacy_udpipe.download("de") 
    # spacy_udpipe.download("ru") 
    # spacy_udpipe.download("uk") 

    # text = "Wikipedia is a free online encyclopedia, created and edited by volunteers around the world."
    # nlp = spacy_udpipe.load("en")
    # nlp = spacy_udpipe.load("de")
    # nlp = spacy_udpipe.load("ru")
    # nlp = spacy_udpipe.load("uk")

    # doc = nlp(text)
    # for token in doc:
    #     print(token.text, token.lemma_, token.pos_, token.dep_)
    ###############################

    ###############################
    #Some examples of spacy usage
    # doc = nlp("This is a sentence.")
    # for token in doc:
    #     print(token.text, token.lemma_, token.pos_, token.dep_)

    # text = "This is a sample sentence with some stop words, such as the and a!"
    # doc = nlp(text)
    # # Remove stop words
    # filtered_tokens = [token.text for token in doc if not token.is_stop]
    # # Print the text excluding stop words
    # print(filtered_tokens)
    ###############################

    # load the selected language model
    if lang == "en":
        nlp = spacy.load("en_core_web_sm")
    elif lang == "de":
        nlp = spacy.load("de_core_news_sm")
    elif lang == "ru":
        nlp = spacy.load("ru_core_news_sm")
    elif lang == "uk":
        nlp = spacy.load("uk_core_news_sm")
    else:
        #return the error
        print(json.dumps({"status": "error", "message": "Selected language not supported"}))
        return


    def clean_text(text_list):
        cleaned_texts = []
        for text in text_list:
            cleaned_text = " ".join(token.lemma_ for token in nlp(text) if
                                    not token.is_punct
                                    and not token.is_currency
                                    and not token.is_digit
                                    # and not token.is_oov
                                    and not token.is_space
                                    and not token.is_stop
                                    and not token.like_num)
            cleaned_texts.append(cleaned_text)
        return cleaned_texts

    # Example usage:
    # input_texts = ["This is a sample sentence with some stop words, such as asdhjm the, $, £, €, '   ', California, Mary and a!", "Another example text with numbers like 4, 56, 12.44 is right here where you currently look at."]
    # result = clean_text(input_texts)
    result = clean_text(all_texts)
    # print(len(result))
    # print(result)

    # Initialize empty lists
    words = []
    vals = []
    starts = []

    # Split each result string into words and populate the lists
    for percentage, start, sentence in zip(percentage_values, all_starts, result):
        sentence_words = sentence.split()
        words.extend(sentence_words)
        vals.extend([percentage] * len(sentence_words))
        starts.extend([round(start.total_seconds())] * len(sentence_words))

    # Example usage
    # print("Words:", words)
    # print("Values:", vals)
    # print("Starts:", starts)

    # Initialize a defaultdict to store timestamps for each word
    word_timestamps = defaultdict(list)

    # Same for the starts
    word_starts = defaultdict(list)

    # Populate the defaultdict with word-timestamp and word-start associations
    for word, val, start in zip(words, vals, starts):
        word_timestamps[word].append(val)
        word_starts[word].append(start)

    # Count word occurrences
    word_counts = Counter(words)

    # Sort words by frequency
    sorted_words = sorted(word_counts, key=word_counts.get, reverse=True)

    output = []
    # Example usage
    for word in sorted_words:
        if word_counts[word] > 10:
            #get the words POS tag
            doc = nlp(word)
            pos = doc[0].pos_
            # print(f"Word: {word}, Frequency: {word_counts[word]}, Timestamps: {word_timestamps[word]}")
            output.append({"word": word, "pos": pos, "frequency": word_counts[word], "timestamps": word_timestamps[word], "starts": word_starts[word]})
    return(json.dumps({"status": "success", "message": output}).strip())
            

if __name__ == "__main__":
    if len(sys.argv) != 5:
        # python or python3
        # print("Count of arguments detected: " + str(len(sys.argv)))
        # print(str(sys.argv))
        print(json.dumps({"status": "error", "message": "Usage: python main.py [name] [size] [tmp_name] [language]"}))
    else:
        filename = sys.argv[1]
        filesize = sys.argv[2]
        temporary_name = sys.argv[3]
        language = sys.argv[4]

        #check if file exists at temporary location and its size is correct
        if os.path.isfile(temporary_name) and os.path.getsize(temporary_name) == int(filesize):
            # for i in range(1, len(sys.argv)):
            #     print(sys.argv[i])
            print(check_subs(temporary_name, language))
            # print(json.dumps({"status": "success", "message": "File exists and its size is correct"}))
        else:
            print(json.dumps({"status": "error", "message": "File does not exist or its size is incorrect"}))

# print(check_subs('subs/GodFather.srt', 'en'))