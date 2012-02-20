/* Author: Salvador Subarroca

 */
$(function() {

	var dropbox = $('.dropbox'),
		message = $('.message', dropbox);

	dropbox.filedrop({
		// The name of the $_FILES entry:
		paramname:'pic',

		maxfiles: 5,
    maxfilesize: 2, // in mb
		url: './post_file.php',
		
    docOver: function() {
        // user dragging files anywhere inside the browser document window
        dropbox.addClass('fileOnDoc');
    },
    docLeave: function() {
        // user dragging files out of the browser document window
        dropbox.removeClass('fileOnDoc');
    },
    dragOver: function() {
        // user dragging files over #dropzone
        dropbox.addClass('fileOnDrag');
    },
    dragLeave: function() {
        // user dragging files out of #dropzone
        dropbox.removeClass('fileOnDrag');
    },
    drop: function() {
        // user drops file
        dropbox.removeClass('fileOnDrag');
        dropbox.removeClass('fileOnDoc');
    },

		uploadFinished:function(i,file,response){
			// response is the JSON object that post_file.php returns
			var block = $.data(file).addClass('done');
			$('.progress',block).delay(3000).slideUp(500);
		},

    	error: function(err, file) {
			switch(err) {
				case 'BrowserNotSupported':
					showMessage('Your browser does not support HTML5 file uploads!');
					break;
				case 'TooManyFiles':
					alert('Too many files! Please select 5 at most!');
					break;
				case 'FileTooLarge':
					alert(file.name+' is too large! Please upload files up to 2mb.');
					break;
				default:
					break;
			}
		},

		// Called before each upload is started
		beforeEach: function(file){
			if(!file.type.match(/^image\//)){
				alert('Only images are allowed!');

				// Returning false will cause the
				// file to be rejected
				return false;
			}
		},

		uploadStarted:function(i, file, len){
			createImage(file);
		},

		progressUpdated: function(i, file, progress) {
			$.data(file).find('.progress').width(progress+'%');
		}

	});

var template = '<li>'+
					'<figure>'+
						'<img />'+
						'<div class="progressHolder">'+
							'<div class="progress"></div>'+
						'</div>'+
					'</figure>'+
				'</li>';

	function createImage(file){

		var preview = $(template),
			image = $('img', preview);

		var reader = new FileReader();

		reader.onload = function(e){

			// e.target.result holds the DataURL which
			// can be used as a source of the image:

			image.attr('src',e.target.result);
		};

		// Reading the file as a DataURL. When finished,
		// this will trigger the onload function above:
		reader.readAsDataURL(file);

		message.hide();
		preview.appendTo(dropbox);

		// Associating a preview container
		// with the file, using jQuery's $.data():

		$.data(file,preview);
	}
	
	function showMessage(msg){
		message.html(msg);
	}

});