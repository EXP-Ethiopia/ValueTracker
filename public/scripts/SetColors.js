

function hexToRgb(hex) {
    let r = parseInt(hex.slice(1,3),16),
    g = parseInt(hex.slice(3,5),16),
    b = parseInt(hex.slice(5,7),16)

    if(hex.length == 4) {
        r = parseInt(hex[1] + hex[1],16)
        g = parseInt(hex[2] + hex[2],16)
        b = parseInt(hex[3] + hex[3],16)

    }

    console.log("rgb ("+ r + "," + g + ","+ b +")"+ "====> " + (r+g+b));
}

document.getElementById("colorbtn").addEventListener("click", () => {
    var colors = document.getElementById("colors").value;
    hexToRgb(colors)
})


