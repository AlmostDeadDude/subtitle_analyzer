<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png">
    <link rel="manifest" href="./site.webmanifest">
    <link rel="mask-icon" href="./safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-TileColor" content="#5bbad5">
    <meta name="theme-color" content="#ffffff">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <script src="js/avifCheck-min.js"></script>
    <script src="https://kit.fontawesome.com/d6065b6a9b.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="css/style.css">
    <title>SipScript</title>
</head>
<body>
    <header class="central column">
        <picture>
            <source type="image/avif" srcset="res/img/SipScript.avif">
            <source type="image/webp" srcset="res/img/SipScript.webp">
            <img id="logo" decoding="async" loading="lazy" src="res/img/SipScript.png"  alt="SipScript"/>
        </picture>
        <p>
            Upload any movie's subtitles, and discover the perfect words for a personalized drinking game.
            <br>
            <span class="big">🎬🍻</span>Cheers to movie nights with a twist!<span class="big">🍿🥂</span>
        </p>
    </header>
    <main>
        <section>
            <form id="upload-container" class="central column drop-area" action="#">
                <h2>Drop files here</h2>or
                <div class="inputGroup central column">
                    <input type="file" id="file-upload" accept=".srt" />
                </div>
                <br>
                <div class="inputGroup central column">
                    <label for="lang"><h2>Select language:</h2></label>
                    <select name="lang" id="lang">
                        <option value="en" selected>English</option>
                        <option value="de">German</option>
                        <option value="ru">Russian</option>
                        <option value="uk">Ukrainian</option>
                    </select>
                </div>
                <div class="inputGroup central column">
                    <input type="submit" value="Select the file first" disabled/>
                </div>
            </form>
            <div class="central">
                <i class="fa-solid fa-circle-notch" id="loading"></i>
            </div>
            <div id="result-wrapper">
                <h2 class="central filename"></h2>
                <br>
                <h2 class="central">Select which categories you want to see</h2>
                <div id="result-filters" class="central row flexbox">
                    <?php require_once 'filters.php'; ?>
                </div>
                <br><br>
                <h2 class="central">Here are the words which appear more than 10 times</h2>
                <br>
                <div class="central">
                    <canvas height="600" width="800" id="word_cloud" style="display: none;"></canvas>
                </div>
                <br>
                <div id="result-container" class="central row flexbox">
                    <!-- Display results here -->
                </div>
            </div>
        </section>
        <section>
            <br>
            <h3 class="central">Don't have any SRT files lying around? <br>Then check some examples</h3>
            <div class="movies central row flexbox">
                <picture>
                    <source type="image/avif" srcset="res/img/godfather_sm.avif">
                    <source type="image/webp" srcset="res/img/godfather_sm.webp">
                    <img id="godfather_link" decoding="async" loading="lazy" src="res/img/godfather_sm.png"  alt="godfather"/>
                </picture>
                <picture>
                    <source type="image/avif" srcset="res/img/pulpfiction_sm.avif">
                    <source type="image/webp" srcset="res/img/pulpfiction_sm.webp">
                    <img id="pulpfiction_link" decoding="async" loading="lazy" src="res/img/pulpfiction_sm.png"  alt="pulpfiction"/>
                </picture>
                <picture>
                    <source type="image/avif" srcset="res/img/lebowski_sm.avif">
                    <source type="image/webp" srcset="res/img/lebowski_sm.webp">
                    <img id="lebowski_link" decoding="async" loading="lazy" src="res/img/lebowski_sm.png"  alt="lebowski"/>
                </picture>
            </div>
        </section>
    </main>
    <div id="modal-container" class="central">
        <div id="modal" class="central column">
            <div id="modal-close" class="central">
                <i class="fas fa-times"></i>
            </div>
            <div id="modal-content" class="central column">
                <div id="modal-header">
                    <h2></h2>
                </div>
                <div id="modal-body"></div>
                <div id="modal-footer" class="central row">
                    <button id="modal-button" class="central"></button>
                    <button id="modal-button-2" class="central"></button>
                </div>
            </div>
        </div>
    </div>
    <button id="backToTop" title="back to top">
        <i class="fas fa-arrow-up"></i>
    </button>
    <footer>        
        <small>
            <span id="year">2023</span>, Ivan Shiller <a href="https://github.com/AlmostDeadDude" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github"></i></a> 
        </small> 
    </footer>

    <script src="js/script.js"></script>
    <script src="js/upload.js"></script>
    <script src="js/wordcloud2.js"></script>
</body>
</html>