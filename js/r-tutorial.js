$(document).ready( function() {
    $('div.answer').children('div.chunk').wrap('<div class="toggleanswer"></div>')
    $('div.toggleanswer').children('div.chunk').hide()
    $('div.toggleanswer').prepend('<a href="#" class="answertoggle">Show</a>')
    $('a.answertoggle').click(function (e) {
        $(this).parent('div.toggleanswer').children('div.chunk').show()
        $(this).remove()
        e.preventDefault();
    });
});
