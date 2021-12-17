
$(document).ready(function(){
  const navItems = $(".nav-items")
  const menuIcon = $(".menu-bar i")

  $(".menu-bar").on('click', function() {
    navItems.toggleClass('active');

    if(navItems.hasClass("active")){
      menuIcon.removeClass("fa-bars")
      menuIcon.addClass("fa-times")
    }else{
      menuIcon.removeClass("fa-times")
      menuIcon.addClass("fa-bars")
    }

  });
});

// Sticky navigation
window.onscroll = function() {stickyFunction()};

var navbar = document.getElementById("navbar");
var sticky = navbar.offsetTop;

function stickyFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else { 
    navbar.classList.remove("sticky");
  }
}







//*******************resposive*******************
function resposiveFunction(){
    navbar.classList.add("responsive");
}

// var x = window.matchMedia("(max-width: 768px)");
// resposiveFunction(x);
// x.addListener(resposiveFunction);




// ****************** Testimonial Slider **************//

var slideNumber = 1;
showTestimonial(slideNumber);

function changeSlide(n){
  showTestimonial(slideNumber += n);
}

function showTestimonial(n) {
  var i;
  var testimonials = document.getElementsByClassName("testimonial");
  if (n > testimonials.length) {slideNumber = 1}
  if (n < 1) {slideNumber = testimonials.length}
  for (i = 0; i < testimonials.length; i++) {
      testimonials[i].style.display = "none";
  }
  testimonials[slideNumber-1].style.display = "block";

}



