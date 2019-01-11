$(document).ready(function () {
    $("#photoFormSubmit").click(function (event) {
        event.preventDefault();
        $('#thanks').hide()
        $('#message').html('')
        $("#photoFormSubmit").prop("disabled", true);
        $('#image').html('<img src="/files/ajax-loader.gif"/>');
        var form = $('#photoForm')[0];
        var data = new FormData(form);
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: "https://europe-west1-erg-screen-reader.cloudfunctions.net/Process-Screen",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            success: function (data) {
                console.log(data);
                $("#photoFormSubmit").prop("disabled", false);
                result = $.parseJSON(data)
                $('#file').val(result.file ? result.file : "unknown");
                $('#hours').val(result.result.time.hour ? result.time.hour : 0);
                $('#minutes').val(result.result.time.minute ? result.result.time.minute : 0);
                $('#seconds').val(result.result.time.second ? result.result.time.second : 0);
                $('#tenths').val(result.result.time.tenth ? result.result.time.second : 0);
                $('#distance').val(result.result.distance ? result.result.distance : 0);
                $('#result').show()
                $('#image').html('<img src="http://storage.googleapis.com/ergscreens_resized/'+result.file+'"/>');
            },
            error: function (e) {
                console.log(e);
                $("#photoFormSubmit").prop("disabled", false);
                try {
                    json_error = $.parseJSON(e.responseText);
                    if (json_error.rawText) {
                        message = json_error.status + ". The API returned <pre>"+json_error.rawText+"</pre> and it is not yet possible to turn this into an erg score"
                    } else {
                        message = json_error.status
                    }
                    $('#message').html('<strong>Error:</strong> '+message+'<p>Try a different file?</p>');
                    $('#image').html('<img src="http://storage.googleapis.com/ergscreens_resized/'+json_error.file+'"/>');
                }
                catch(error) {
                  $('#message').html("<strong>Error:</strong> This error is so bad I can't even.<p>It is probably not your fault. Try the same image again or a different image.</p>")
                  $('#image').html('')
                }
            }
        });
    });

    $("#edit").change(function() {
        if(this.checked) {
            $('#hours').prop("disabled", false)
            $('#minutes').prop("disabled", false)
            $('#seconds').prop("disabled", false)
            $('#tenths').prop("disabled", false)
            $('#distance').prop("disabled", false)
            $('#resultFormSubmit').prop("value","Send Corrections")
        } else {
            $('#hours').prop("disabled", true)
            $('#minutes').prop("disabled", true)
            $('#seconds').prop("disabled", true)
            $('#tenths').prop("disabled", true)
            $('#distance').prop("disabled", true)
            $('#resultFormSubmit').prop("value","All Looks Good!")
        }
    });

    $('#resultFormSubmit').click( function(event) {
        event.preventDefault();
        $("#resultFormSubmit").prop("disabled", true);
        $('#hours').prop("disabled", false)
        $('#minutes').prop("disabled", false)
        $('#seconds').prop("disabled", false)
        $('#tenths').prop("disabled", false)
        $('#distance').prop("disabled", false)
        data = $('#resultForm').serializeArray();
        json = {}
        $.each(data, function() {
            json[this.name] = this.value || '';
        });
        $.ajax({
            type: "POST",
            url: "https://europe-west1-erg-screen-reader.cloudfunctions.net/Save-user-corrections",
            data: JSON.stringify(json),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }).done( function() { $('#result').hide(); $('#thanks').show(); $("#resultFormSubmit").prop("disabled", false); $("#photoFormSubmit").prop("disabled", false);});
    });

});
