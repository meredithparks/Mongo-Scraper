// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    for (let i = 0; i < data.length; i++) {
        // Display information
        $("#articles").append(`<div class="card shadow-lg p-3 mb-5 bg-white rounded">
                                    <div class="card-body"> 
                                        <div class="card-title"><h6 data-id=${data[i]._id}>${data[i].title}</h6>
                                            <p class="card-text">${data[i].summary}</p>
                                            <a href="www.nytimes.com${data[i].link}" target="_blank">www.nytimes.com${data[i].link}
                                        </div>
                                    </div>
                                </div>`);

    }
});

// Whenever someone clicks a h6 tag
$(document).on("click", "h6", function () {
    // Empty the notes from the note section
    $("#notes").empty();
    // Save the id from the h6 tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            $("#notes").append(`<h4>${data.title}</h4>`);
            $("#notes").append("<textarea id='noteInput' name='body' placeholder='Write notes here'></textarea><br>");
            // A button to submit a new note, with the id of the article saved to it
            $("#notes").append(`<button class="btn btn-info" data-id="${data._id}" id="saveNote">Save</button><br><br>`);


            // If there's a note in the article
            if (data.note) {
                // Place the the note in the body textarea
                $("#noteInput").val(data.note.body);
            }
        });
});

// When you click the savenote button
$(document).on("click", "#saveNote", function () {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: `/articles/${thisId}`,
        data: {
            body: $("#noteInput").val()
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#notes").empty();
        });

    // Also, remove the values entered in the input and textarea for note entry
    $("#noteInput").val("");
});