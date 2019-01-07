$(document).ready( function() {
    $('.container.narrow').contents().wrap('<div class="row normal"><div class="col c10"></div></div>')
    $('.row').append('<div class="col c1 help"></div>')
    $('.help').each( function(i) {
        $(this).attr("id","help"+i)
    })
        $('.content').each( function(i) {
        $(this).attr("id","content"+i)
    })


        $('.help').html(function () {
            i = $(this).attr("id").substr(4)
            url = "http://www.eanalytica.com"+window.location.pathname+"#content"+i
            escapedurl = escape(url)
            href = "https://twitter.com/intent/tweet?url="+escapedurl+"&text=@RichardFergie%20I%27m%20stuck%20"
            return ("<a href='"+href+"' class='btn btn-sm'>Get help</a>")
        })

    $('div.row').mouseenter(function() {
        $(this).children('div.help').show()
    }).mouseleave(function () {
        $(this).children('div.help').hide()
    });

    $('div.answer').children('div.chunk').wrap('<div class="toggleanswer"></div>')
    $('div.toggleanswer').children('div.chunk').hide()
    $('div.toggleanswer').prepend('<a href="#" class="answertoggle">Show</a>')
    $('a.answertoggle').click(function (e) {
        $(this).parent('div.toggleanswer').children('div.chunk').show()
        $(this).remove()
        e.preventDefault();
    });
});
