//BACK TO TOP
//if scrolled down, show back to top button
window.addEventListener("scroll", function () {
    if (window.pageYOffset > 100) {
        document.getElementById("backToTop").classList.add("is-active");
    } else {
        document.getElementById("backToTop").classList.remove("is-active");
    }
});
//scroll to top on click
document.getElementById("backToTop").addEventListener("click", function () {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
});
//END BACK TO TOP

//FOOTER
// Set the current year
document.getElementById("year").innerHTML = new Date().getFullYear();
//END FOOTER

//MODAL
//close modal when x button is clicked
document.querySelector("#modal-close").addEventListener("click", function () {
    hideModal();
});

//show modal function
function showModal(headerText, bodyText, extraBtn, btnsCallbacks = [null, null], btns = ['OK', 'More Info']) {
    //remove old event listeners, credits to https://stackoverflow.com/a/39026635/14862873
    document.getElementById('modal-footer').outerHTML += "";
    //update stuff
    document.getElementById("modal-container").classList.add("show");
    document.querySelector("#modal-header h2").innerHTML = headerText;
    document.querySelector("#modal-body").innerHTML = bodyText;
    document.querySelector("#modal-button").innerHTML = btns[0];
    document.querySelector("#modal-button").addEventListener("click", btnsCallbacks[0]);
    document.querySelector("#modal-button-2").innerHTML = btns[1];
    document.querySelector("#modal-button-2").addEventListener("click", btnsCallbacks[1]);
    if (extraBtn) {
        document.querySelector("#modal-button-2").classList.add('active');
    }
    setTimeout(function () {
        document.getElementById("modal").classList.add("show");
    }, 100);
}

//hide modal function
function hideModal() {
    document.getElementById("modal").classList.remove("show");
    setTimeout(function () {
        document.getElementById("modal-container").classList.remove("show");
        document.querySelector("#modal-button-2").classList.remove('active');
    }, 500); //matching animation time
}
//END MODAL

//TOOLTIP
//when "help" element is hovered, show its tooltip
document.querySelectorAll(".help i").forEach((help) => {
    help.addEventListener("mouseover", function () {
        help.parentElement.querySelector(".tooltip").classList.add("show");
    });
    help.addEventListener("mouseout", function () {
        help.parentElement.querySelector(".tooltip").classList.remove("show");
    });
});
//END TOOLTIP