$('document').ready(function () {
    let imgUrl = '/assets/images/bg.png?' + Date.now().toString();
    $('#head').css('background', `#f4f4f4 url('${imgUrl}') top center`);
});