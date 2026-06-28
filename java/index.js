function showSideBar()
{
    var sideBar = document.querySelector('.side-bar');
    // sideBar.style.display='flex';
    sideBar.style.transform='translateX(0)';
}
function hideSideBar()
{
    var sideBar = document.querySelector('.side-bar');
    sideBar.style.transform='translateX(500px)';
}


