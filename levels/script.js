function showAlert() {
  document.getElementById("customAlert").classList.remove("hidden");
}

function closeAlert() {
  document.getElementById("customAlert").classList.add("hidden");
}



        function showSideBar() {
            var sb = document.querySelector('.side-bar');
            if (sb) sb.style.transform = 'translateX(0)';
        }
        function hideSideBar() {
            var sb = document.querySelector('.side-bar');
            if (sb) sb.style.transform = 'translateX(500px)';
        }
 