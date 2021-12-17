// function profileDropdown(){
//     document.getElementById("profile-dropdown").classList.toggle("show");
// }

// window.onclick = function(e) {
//     if (!e.target.matches('.profile-drop-btn')) {
//     var profileDropdown = document.getElementById("profile-dropdown");
//       if (profileDropdown.classList.contains('show')) {
//         profileDropdown.classList.remove('show');
//       }
//     }
//   }

/************** Student Result Chart ******/
var xValues = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
var yValues = [3.23, 3.37, 2.89, 3.42, 2.93];
var barColors = ["gray", "steelblue","teal","slateblue","salmon"];

new Chart("myChart", {
  type: "bar",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    legend: {display: false},
    title: {
      display: true,
      text: "Your Semester-wise Result"
    }
  }
});

