//MENU SHOW/HIDE
document.addEventListener('keydown', function (event) {
    if (event.key === 'm' || event.key === 'M') {
      var camera = document.getElementById('camera');
      var content = document.getElementById('menu');

      if (camera.style.display === 'none') {
        // If the camera is hidden, show it and hide the content
        camera.style.display = 'flex';
        content.style.display = 'none';
      } else {
        // If the camera is visible, hide it and show the content
        camera.style.display = 'none';
        content.style.display = 'block';
      }
    }
  });