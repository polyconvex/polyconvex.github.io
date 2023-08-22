(function ($) {
  var $window = $(window),
    $body = $("body"),
    $main = $("#main");

  // Breakpoints.
  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: ["361px", "480px"],
    xxsmall: [null, "360px"],
  });

  // Play initial animations on page load.
  $window.on("load", function () {
    window.setTimeout(function () {
      $body.removeClass("is-preload");
    }, 100);
  });
})(jQuery);

// select 3 random initial values between -360 and 360, snapping in increments of 36 so it doesn't stop between panels
var random1 = gsap.utils.random(-360, 360, 36);
var random2 = gsap.utils.random(-360, 360, 36);
var random3 = gsap.utils.random(-360, 360, 36);

var textcontent = document.getElementById("textcontent");
// first spin on page load
gsap
  .timeline({ onComplete: finishScroll })
  .set(".ring", { rotationX: -90 })
  //set initial rotationx so item 1 appears at the bottom
  .set(".item", {
    // apply transform rotations to each image
    rotateX: (i) => i * -36,
    transformOrigin: "50% 50% -220px",
    z: 220,
  })

  // while this is happening, rotate the rings by a random amount
  .to("#ring1", { rotationX: random1, duration: 0.6, ease: "power3" }, "<=")
  .to("#ring2", { rotationX: random2, duration: 1.2, ease: "power3" }, "<=")
  .to("#ring3", { rotationX: random3, duration: 1.8, ease: "power3" }, "<=");

const items = gsap.utils.toArray(".item");

// when the ring stops spinning
function finishScroll() {
  //this finds the active item
  items.forEach((item, i) => {
    ScrollTrigger.create({
      //  markers: true,
      trigger: item,
      scroller: ".console-outer",
      start: "top center-=59px",
      end: "bottom center-=59px",
      toggleClass: "active",
    });
  });
  // this looks at what the active item is in each column
  activeitem1 = $("#col1 .item.active").data("content");
  activeitem2 = $("#col2 .item.active").data("content");
  activeitem3 = $("#col3 .item.active").data("content");

  // this populates the results area depending on the result
  if ($(".notstarted")[0]) {
  } else {
    // all the same
    if (activeitem1 === activeitem2 && activeitem2 === activeitem3) {
      textcontent.innerHTML =
        "<p>Voitit: " + '<b>"' + activeitem1 + '"</b>' + " !</p>";

      const description = document.getElementById("desc");

      // Call the winOutput function with the appropriate videoId
      switch (activeitem1) {
        case "Kertoimia vastaan":
          winOutput("ZU7JPdxi1xo");
          description.innerHTML =
            "Tsekkaa pätkä 1.9.2023 julkaistavasta biisistä!";
          break;
        case "Muistan":
          winOutput("OiG_AD1Levk");
          description.innerHTML =
            "Tsekkaa pätkä 1.9.2023 julkaistavasta biisistä!";
          break;
        case "Tuurii":
          winOutput("7WwZcy_BzQw");
          description.innerHTML =
            "Tsekkaa pätkä 1.9.2023 julkaistavasta biisistä!";
          break;
        case "Seppä":
          winOutput("nZUoWA5J9iA");
          description.innerHTML =
            "Onnittelut Seppä, taoit ittes lisäarvontaan! Laita screenshot tästä IG storyyn ja tagaa @kerrostalomusic, niin pääset kokeilemaan onneasi lisäarvonnassa!";
          break;
        case "Hummani hei":
          winOutput("nZUoWA5J9iA");
          description.innerHTML =
            "Tsekkaa pätkä 1.9.2023 julkaistavasta biisistä!";
          break;
        case "PLAYA":
          winOutput("BzlR_dR5zrQ");
          description.innerHTML =
            "Onnittelut PLAYA, pääsit messiin lisäarvontaan! Laita screenshot tästä IG storyyn ja tagaa @kerrostalomusic, niin pääset kokeilemaan onneasi lisäarvonnassa!";
          break;
        case "ALAX?":
          winOutput("1mTl535Q1wY");
          description.innerHTML =
            "ALAX olee valmis kokeilee lisäarvontaa? Laita screenshot tästä IG storyyn ja tagaa @kerrostalomusic, niin pääset kokeilemaan onneasi lisäarvonnassa!";
          break;
        case "Maa oon se mies":
          winOutput("Q7aEpBYTdAQ");
          description.innerHTML =
            "Tsekkaa pätkä 1.9.2023 julkaistavasta biisistä!";
          textcontent.innerHTML =
            "<p>Voitit: " + '<b>"' + "Mää oon se mies" + '"</b>' + " !</p>";
          break;
        case "Små grabbar":
          winOutput("v8IiEEdBY_Q");
          description.innerHTML =
            "Tsekkaa pätkä 1.9.2023 julkaistavasta biisistä!";
          break;
        case "Jokeri":
          //
          break;
        default:
          break;
      }
    }
    // none the same
    if (
      activeitem1 != activeitem2 &&
      activeitem2 != activeitem3 &&
      activeitem1 != activeitem3
    ) {
      textcontent.innerHTML = "<p>Ei voittoa.</p>";
    }

    if (
      activeitem1 === "Jokeri" ||
      activeitem2 === "Jokeri" ||
      activeitem3 === "Jokeri"
    ) {
      textcontent.innerHTML = "<p>Ei voittoa.</p>";
    }

    // first and second the same
    if (
      activeitem1 === activeitem2 &&
      activeitem1 != activeitem3 &&
      activeitem2 != activeitem3 &&
      activeitem1 !== "Jokeri"
    ) {
      if (activeitem1 === "Maa oon se mies") {
        textcontent.innerHTML =
          "<p>" + '<b>"Mää oon se mies"</b>' + " on lähellä...</p>";
      } else {
        textcontent.innerHTML =
          "<p>" + '<b>"' + activeitem1 + '"</b>' + " on lähellä...</p>";
      }
    }
    // first and third the same
    if (
      activeitem1 === activeitem3 &&
      activeitem1 != activeitem2 &&
      activeitem3 != activeitem2 &&
      activeitem1 !== "Jokeri"
    ) {
      if (activeitem1 === "Maa oon se mies") {
        textcontent.innerHTML =
          "<p>" + '<b>"Mää oon se mies"</b>' + " on lähellä...</p>";
      } else {
        textcontent.innerHTML =
          "<p>" + '<b>"' + activeitem1 + '"</b>' + " on lähellä...</p>";
      }
    }
    // second and third the same
    if (
      activeitem2 === activeitem3 &&
      activeitem1 != activeitem3 &&
      activeitem1 != activeitem2 &&
      activeitem2 !== "Jokeri"
    ) {
      if (activeitem1 === "Maa oon se mies") {
        textcontent.innerHTML =
          "<p>" + '<b>"Mää oon se mies"</b>' + " on lähellä...</p>";
      } else {
        textcontent.innerHTML =
          "<p>" + '<b>"' + activeitem3 + '"</b>' + " on lähellä...</p>";
      }
    }
  }

  $(button).removeClass("pyorii");
  $(button).prop("disabled", false);
}

// Add this function to your JavaScript code
function winOutput(videoId, dataContent) {
  if (dataContent === "Jokeri") {
    return;
  }

  const modal = document.querySelector(".modal");
  const closeModal = modal.querySelector(".close");
  const youtubeEmbed = modal.querySelector("#youtube-embed");

  // Set the YouTube video embed URL based on the videoId parameter
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  youtubeEmbed.src = embedUrl;

  // Open the modal
  modal.style.display = "block";

  // Close the modal when the close button is clicked
  closeModal.onclick = function () {
    modal.style.display = "none";
    youtubeEmbed.src = ""; // Reset the embed URL
  };

  // Close the modal when clicking outside of it
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      youtubeEmbed.src = ""; // Reset the embed URL
    }
  };
}

// on click spin the wheels
var button = $("button.trigger");
$(button).click(function () {
  $(this).addClass("pyorii");
  $(button).prop("disabled", true);
  textcontent.innerHTML = "<p>Pyöritetään...</p>";
  $(".stage").removeClass("notstarted");
  $(".ring:not(.held) .item").removeClass("active"); // remove the active class
  // get three random values
  var random1 = gsap.utils.random(-1440, 1440, 36);
  var random2 = gsap.utils.random(-1440, 1440, 36);
  var random3 = gsap.utils.random(-1440, 1440, 36);

  // spin each cell to a random value
  let scrollcells = gsap.timeline({ paused: true, onComplete: finishScroll });

  scrollcells

    .to(
      "#ring1:not(.held)",
      {
        rotationX: random1,
        duration: 0.6,
        ease: "power3",
      },
      "<"
    )
    .to(
      "#ring2:not(.held)",
      {
        rotationX: random2,
        duration: 1.2,
        ease: "power3",
      },
      "<"
    )
    .to(
      "#ring3:not(.held)",
      {
        rotationX: random3,
        duration: 1.8,
        ease: "power3",
      },
      "<"
    );
  scrollcells.play();
});

var buttonhold = $("button.hold");
$(buttonhold).click(function () {
  ringhold = $(this).data("controls");
  $(this).toggleClass("held");
  $(this).text(function (i, text) {
    return text === "Lukitse" ? "Lukittu" : "Lukitse";
  });

  ringtohold = document.getElementById(ringhold);
  $(ringtohold).toggleClass("held");
});
