const fileInput = document.getElementById('file-upload');
const uploadForm = document.getElementById('upload-container');
const uploadBtn = uploadForm.querySelector('input[type="submit"]')
const wordCloudCanvas = document.getElementById('word_cloud');

fileInput.addEventListener('change', function (e) {
    if (e.target.files[0]) {
        uploadBtn.disabled = false;
        uploadBtn.value = 'Upload';
    }
});

uploadForm.addEventListener('submit', uploadFile);

async function uploadFile(e) {
    e.preventDefault();
    showLoading();

    const file = fileInput.files[0];
    const lang = document.getElementById('lang').value;

    if (!file) {
        alert('Please select a file.');
        hideLoading();
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);

    try {
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData,
        });

        hideLoading();

        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                document.querySelector('.filename').innerHTML = file.name;
                displayResults(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        hideLoading();
        console.error('An error occurred during the file upload:', error);
        alert('An unexpected error occurred.');
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function displayResults(res_msg) {
    const resultWrapper = document.getElementById('result-wrapper');
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    let wordCloudData = [];

    //results message is something like this:
    //[...{"word": "table", "frequency": 5, "timestamps": [54.33, 55.99, 56.15, 66.44, 66.47]}, {"word": "arrange", "frequency": 5, "timestamps": [70.24, 86.1, 90.27, 90.37, 90.68]}, ...]
    res_msg.forEach(function (item) {
        let word = item.word;
        let pos = item.pos;
        let frequency = item.frequency;
        let timestamps = item.timestamps;
        let starts = secondsToStr(item.starts);

        //arrange the results for the word cloud as we go
        //the format is [['foo', 1], ['bar', 2]]
        wordCloudData.push([word, frequency]);

        let word_div = document.createElement('div');
        word_div.className = 'word ' + pos + '';
        let word_wrapper = document.createElement('div');
        word_wrapper.className = 'word-wrapper central row';
        let word_p = document.createElement('p');
        word_p.className = 'word-name';
        word_p.innerHTML = word;
        let word_freq = document.createElement('p');
        word_freq.className = 'word-freq';
        word_freq.innerHTML = frequency;
        word_wrapper.appendChild(word_p);
        word_wrapper.appendChild(word_freq);
        word_div.appendChild(word_wrapper);

        let start_p = document.createElement('p');
        start_p.className = 'start-time hidden';

        let timestamps_wrapper = document.createElement('div');
        timestamps_wrapper.className = 'timestamps-wrapper';
        let timestamps_div = document.createElement('div');
        timestamps_div.className = 'timestamps';
        timestamps.forEach(function (item, index) {
            let timestamp = document.createElement('div');
            timestamp.className = 'timestamp';
            timestamp.style.left = item + '%';
            timestamp.setAttribute('data-start', starts[index]);
            timestamp.addEventListener('mouseover', function (e) {
                //show the start time of the word on hover
                start_p.classList.remove('hidden');
                start_p.innerHTML = starts[index];
            });
            timestamp.addEventListener('mouseout', function (e) {
                //hide the start time of the word on mouseout
                start_p.classList.add('hidden');
            })
            timestamps_div.appendChild(timestamp);
        });

        timestamps_wrapper.appendChild(timestamps_div);
        word_div.appendChild(timestamps_wrapper);
        word_div.appendChild(start_p);
        resultContainer.appendChild(word_div);
    });

    //display the word cloud
    displayWordCloud(wordCloudData);
    wordCloudCanvas.style.display = 'block';

    //display the results
    resultWrapper.style.display = 'block';

    //show the modal if no flag is set
    if (!localStorage.getItem('SUBTITLE_CHECK_modalShown')) {
        showModal('What do the results mean?', '<picture><source type="image/avif" srcset="res/img/example.avif"><source type="image/webp" srcset="res/img/example.webp"><img decoding="async" loading="lazy" src="res/img/example.png"  alt="an example image"/></picture>', false, [function () {
            //set the flag to true so that the modal doesn't show up again
            localStorage.setItem('SUBTITLE_CHECK_modalShown', true);
            //hide the modal and scroll to the results section
            hideModal();
            document.querySelector('.filename').scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }, null], ['Got it', null]);
    } else {
        //scroll to the results section
        document.querySelector('.filename').scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
}

function secondsToStr(secondsArr) {
    //this function takes an array of seconds and returns an array of strings in the HH:MM:SS format
    let strArr = [];
    secondsArr.forEach(function (item) {
        let hours = Math.floor(item / 3600);
        let minutes = Math.floor((item - (hours * 3600)) / 60);
        let seconds = Math.floor(item - (hours * 3600) - (minutes * 60));
        let str = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        strArr.push(str);
    });
    return strArr;
}

// Add event listeners for drag-and-drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadForm.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

uploadForm.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        document.getElementById('file-upload').files = files;
        uploadFile();
    }
}

// Add a visual indication for drag-and-drop
uploadForm.addEventListener('dragenter', highlight, false);
uploadForm.addEventListener('dragover', highlight, false);
uploadForm.addEventListener('dragleave', unhighlight, false);
uploadForm.addEventListener('drop', unhighlight, false);

function highlight() {
    uploadForm.classList.add('highlight');
}

function unhighlight() {
    uploadForm.classList.remove('highlight');
}

//filtering the shown results
const resultFilters = document.getElementById('result-filters');
const filters = resultFilters.querySelectorAll('input[type="checkbox"]');
filters.forEach(function (item) {
    item.addEventListener('input', function (e) {
        let filter = item.name;
        let wordsToFilter = document.querySelectorAll('.word.' + filter);
        //toggle the hidden class on the words to filter
        wordsToFilter.forEach(function (item) {
            item.classList.toggle('hidden');
        });

        //fill the array with the legal words and their frequencies fo the word cloud update
        let legalWords = document.querySelectorAll('.word:not(.hidden)');
        let wordCloudData = [];
        legalWords.forEach(function (item) {
            let word = item.querySelector('.word-name').innerHTML;
            let frequency = item.querySelector('.word-freq').innerHTML;
            wordCloudData.push([word, frequency]);
        });
        //update the word cloud
        displayWordCloud(wordCloudData);
    });
});

//display the word cloud
function displayWordCloud(wordCountArray) {
    WordCloud(wordCloudCanvas, {
        list: wordCountArray,
        fontFamily: 'Walter Turncoat, cursive',
        // fontWeight: 'bold',
        minSize: 10,
        weightFactor: 2,
        color: '#231f34',
        clearCanvas: true,
        backgroundColor: 'transparent',
        shape: 'circle', //circle (default), cardioid (apple or heart shape curve, the most known polar equation), diamond, square, triangle-forward, triangle, (alias of triangle-upright), pentagon, and star
        ellipticity: 0.3, //ratio of the width to the height of the ellipse, 1 is a circle, 0 is horizontal line
        drawOutOfBound: false,
        shrinkToFit: true,
    });
}

//show examples on picture click
const godfather_link = document.getElementById('godfather_link');
const pulpfiction_link = document.getElementById('pulpfiction_link');
const lebowski_link = document.getElementById('lebowski_link');

godfather_link.addEventListener('click', function (e) {
    e.preventDefault();
    uploadCustomFile('godfather');
});

pulpfiction_link.addEventListener('click', function (e) {
    e.preventDefault();
    uploadCustomFile('pulpfiction');
});

lebowski_link.addEventListener('click', function (e) {
    e.preventDefault();
    uploadCustomFile('lebowski');
});

async function uploadCustomFile(f) {
    //this function uploads the specified file and calls the displayResults function
    showLoading();
    //scroll to show the loading animation
    document.getElementById('loading').scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });

    let lang = 'en';
    let filename = null;
    let filepath = null;
    switch (f) {
        case 'godfather':
            filename = 'GodFather.srt'
            filepath = 'subs/' + filename;
            break;
        case 'pulpfiction':
            filename = 'PulpFiction.srt'
            filepath = 'subs/' + filename;
            break;
        case 'lebowski':
            filename = 'TheBigLebowski.srt'
            filepath = 'subs/' + filename;
            break;
        default:
            break;
    }

    // Create a File object
    const fileBlob = await fetch(filepath).then(response => response.blob());
    const file = new File([fileBlob], filename);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);

    try {
        const response = await fetch('upload.php', {
            method: 'POST',
            body: formData,
        });

        hideLoading();

        if (response.ok) {
            const result = await response.json();
            if (result.status === 'success') {
                document.querySelector('.filename').innerHTML = file.name;
                displayResults(result.message);
            } else {
                alert(`Error: ${result.message}`);
            }
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        hideLoading();
        console.error('An error occurred during the file upload:', error);
        alert('An unexpected error occurred.');
    }
}