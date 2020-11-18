$(document).ready(function(e){
    var colorPicker = new iro.ColorPicker(".secondaryColorPicker", {
    width: 130,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
    });
    colorPicker.on(["color:init"], function(color){
        var latestColor = color.hexString;
        var latestColor = localStorage.getItem('secondaryColor');
        $('.secondaryColorUpdate').css('color', latestColor);
        $('.secondaryColor').val(latestColor);
    });
    colorPicker.on(["color:change"], function(color){
        var latestColor = color.hexString;
        $('.secondaryColorUpdate').css('color', latestColor);
        $('.secondaryColor').val(latestColor);
        localStorage.setItem('secondaryColor', latestColor);
    });
});