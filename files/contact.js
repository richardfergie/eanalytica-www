$(document).ready(function() {
    $('form[action="/contact"]').submit(function() {
        alert('submitted')
        return false;
    });
});