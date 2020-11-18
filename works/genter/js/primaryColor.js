$(document).ready(function(e){
    var colorPicker = new iro.ColorPicker(".primaryColorPicker", {
    width: 130,
    color: "#b7ff00",
    borderWidth: 1,
    // borderColor: "#fff",
    });
    // https://iro.js.org/guide.html#color-picker-events

    colorPicker.on(["color:init"], function(color){
        var latestColor = color.hexString;
        var latestColor = localStorage.getItem('primaryColor');
        console.log('latestColor', latestColor);
        $('.primaryColorUpdate').css('background', latestColor);
        $('.primaryColor').val(latestColor);
        console.log('localStorage', localStorage);
    });
    colorPicker.on(["color:change"], function(color){
        var latestColor = color.hexString;
        $('.primaryColorUpdate').css('background', latestColor);
        $('.primaryColor').val(latestColor);
        localStorage.setItem('primaryColor', latestColor);
    });
});