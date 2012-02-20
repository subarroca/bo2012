/**
 *	Dependencies:
 *		jquery 1.7.1
 *		jscrollpane
 *		mousewheel
 * 		filedrop
 */

var time = 1000;

(function($) {
	var _numPanels = 0;
	var parent;
	var mainContent;

	var defaultPanelURL = '';
	var baseURL = '';

	var speed = 500;
	var slide = 50;

	var scrollMaxSize = 100;

	// none: no depen de id, t�pic de men�
	// single: dep�n d'una sola id, no va al men�
	// multi: aplica tant a llista com a men�
	const operationMenuApply = ['none', 'multi'];
	const createOperationListApply = ['single', 'multi'];

	
	//templates HTML
	
	const PANEL_CONTAINER = '<section id="[id]" class="panel [selector]">'+
							'<span class="loading">carregant...</span>'+
						'</section>';
	
	const PANEL_HEADER = '<header>'+
							'<h2>[title]</h2>'+
							'<a class="close iconic x_alt"></a>'+
						'</header>';
	
	const GENERIC_BLOCK = '<[tag] class="block-[num] [type]-block">'+
							'<h3>[title]</h3>'+
						'</[tag]>';
						
	const LIST_ITEM = '<li class="id-[id]">'+
					'<input type="checkbox" name="[model][]" value="[id]"/>'+
					'<a href="[href]">'+
						'[name]'+
					'</a>'+
				'</li>';
				
	const GALLERY_ITEM = '<li class="id-[id]">'+
					'<span class="message"></span>'+
					'<input type="checkbox" name="[model][]" value="[id]"/>'+
					'<a>'+
						'<figure>'+
							'<img src="[src]" />'+
							'<div class="progressHolder">'+
								'<div class="progress"></div>'+
							'</div>'+
							'<figcaption>[name]</figcaption>'+
						'</figure>'+
					'</a>'+
				'</li>';
				
	const OPERATION_COUNTER ='<li class="counter">'+
						'<a class="iconic x_alt"></a>'+
						'<span class="counterText"></span>'+
					'</li>';
					
	const OPERATION_ITEM ='<li class="[apply]">'+
					'<a class="iconic [icon]"></a>'+
				'</li>';
	
	const ALERT_CONTAINER = '<div class="message_holder">'+
					'<div class="message_box">'+
						'<a class="close iconic x_alt"></a>'+
						'[message]'+
					'</div>'+
				'</div>';
				
	// errors
	const BAD_PATH = 'Ruta errònia';
	const ONLY_IMG = 'Només pots pujar imatges';
	const FILE_TOO_LARGE = '[file] massa gran. La mida màxima és [size]MB';
	const MANY_FILES = "El màxim d'arxius permès és [qty]";
	const BAD_BROSWER_UPLOAD = "El teu navegador no admet la pujada d'arxius mitjançant arrossegament";
	
	var methods = {
		//creem un panell per defecte
		init : function(options) {
			parent = this.selector;
			
			mainContent = $('<div></div>').appendTo(parent)
				.attr('id','scrollingContent');

			this.panelManager('initScrolls');

			if(window.location.hash.length < 2) {

				//TEST
				this.panelTester('openDefaultPanel');

				//PRODUCTION
				/*$.getJSON(defaultPanelURL,
				 {
				 var1 : '',
				 var2 : ''
				 },
				 function(json) {
				 parseJson(json);
				 });*/
			} else {
				this.panelManager('parseHash');
			}
		},
		
		
		//llegeix el hash actual i el retorna fins a la posici� indicada
		createHash : function(model, id, numPanel) {
			var hash = window.location.hash.slice(2);
			hash = hash.split('/').slice(0, numPanel * 2).join('/');
			return hash + '/' + model + '/' + id;
		},
		
		
		//llegim el hash, l'interpretem i obrim tots els panells corresponents
		parseHash : function() {
			var dis = this;

			var hash = window.location.hash.slice(2);
			var hashElements = hash.split('/');

			if(hashElements.length % 2 == 0) {
				var i = 0;
				var turns = Math.floor(hashElements.length / 2);
				var panelPopper = setInterval(function() {
					if(i == turns) {
						clearInterval(panelPopper);
					} else {
						$(dis).panelManager('openPanel', hashElements[i * 2], hashElements[i * 2 + 1], i, hashElements[i * 2 + 3]);
						i++;
					}
				}, speed);
			} else {
				this.panelManager('showMessage', 'BAD_PATH');
			}
		},
		
		
		/**
		*	PANELS
		*/
		
		
		//elimina tots els panells posteriors i en carrega un de nou
		openPanel : function(model, id, numPanel, activeId) {
			this.panelManager('closePanel', numPanel);
			this.panelManager('loadNewPanel', model, id, numPanel, activeId);
		},
		
		//elimina tots els panells posteriors
		closePanel : function(numPanel){
			for(var i = numPanel; i <= _numPanels; i++) {
				$(this.panelManager('getPanelID', i)).remove();
			}
			_numPanels = numPanel;
		},		
		
		//carrega un panell nou
		loadNewPanel : function(model, id, numPanel, activeId) {
			var selector = this.panelManager('createNewPanel', numPanel);

			//TEST
			this.panelTester('fillList', selector, model, id, numPanel, activeId);

			//PRODUCTION
			/*$.getJSON(baseURL,
			 {
			 var1 : '',
			 var2 : ''
			 },
			 function(json) {
			 parseJson(json);
			 });*/
		},
		
		
		//constructor d'un nou panell buit
		createNewPanel : function(numPanel) {			
			var info = {
				'[selector]' : 'rnd' + Math.round(Math.random() * 1000),
				'[id]' : this.panelManager('getPanelID', numPanel, false)
				};
			
			var section = $($(this).panelManager('cloneWithData', PANEL_CONTAINER, info)).appendTo(mainContent);
			
			$(section).css({'opacity': 0,
					'left': -slide,
					'z-index': 100 - numPanel})
				.animate({
					opacity : '1',
					left : 0},
					speed);

			this.panelManager('resetScroll');

			return '.' + info['[selector]'];
		},
		
		
		/**
		*		DATA
		*/
		
		
		//interpretem la info que ens arriba des del server
		parseJson : function(json, action) {
			var dis = this;
			var panel = this.panelManager('getContentPane', json.selector);

			$(panel).empty()
				.addClass(json.type)
				.hide();
			
			//preparem el header del panell
			var info = {
				'[title]' : json.title,
				};
				
			var header = $($(this).panelManager('cloneWithData', PANEL_HEADER, info)).appendTo(panel);
			$('.close', header).click(function(){
				$(dis).panelManager('closePanel', json.numPanel);
			});
	
			$(this).panelManager('createBlocks', action, panel, json);

			//apliquem scroll, el fem aparéixer amb fade in i ens petem la class random per evitar conflictes en el futur
			$(panel).fadeIn(speed);
			this.panelManager('resetScroll');
			$(json.selector).removeClass(json.selector.slice(1));
		},
		
		//creem tots els blocs que hem rebut via json
		createBlocks : function(action, panel, json){			
			var dis = this;
			
			action = (action != undefined) ? action : 'default';
			
			//afegim un bloc per a cada node de contents						
			$.each(json.actions[action].contents, function(i, content) {
				var info = {
					'[tag]' : (content.tag) ? content.tag : 'div',
					'[type]' : content.type,
					'[num]' : i,
					'[title]' : (content.title) ? content.title : '',
					};
				
				$($(dis).panelManager('cloneWithData', GENERIC_BLOCK, info)).appendTo(panel);

				var block = json.selector + ' ' + " .block-" + i;
				var futureSelector = '#panel' + json.numPanel + ' ' + " .block-" + i;
				var operations;

				if(content.operations) {
					$($(dis).panelManager('createOperationList', futureSelector, content, true)).appendTo(block).addClass('operationsMenu');
					operations = $(dis).panelManager('createOperationList', futureSelector, content, false).addClass('operations');
				}
				
				//creem cada bloc segons el tipus especificat
				switch(content.type) {
					case 'list':
						$(dis).panelManager('createListBlock', block, futureSelector, content, json.numPanel + 1, operations);
						break;
					case 'html':
						$(block).append(content.html);
						break;
					case 'gallery':
						$(dis).panelManager('createGalleryBlock', block, futureSelector, content, content.cols, json.numPanel + 1, operations);
						break;
					default:
						throw "Tipus " + content.type + " no trobat";
				}
				
				if(content.active) {
					$(json.selector + ' .id-' + content.active).addClass('active');
				}
			});
		},
		
		//creem un li en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createListBlock : function(selector, futureSelector, content, nextPanel, operations) {
			var dis = this;			
				
			var container = $('<ul class="elements"></ul>').appendTo(selector);

			$.each(content.items, function(i, item) {
				var info = {
					'[id]' : item.id,
					'[model]' : item.model,
					'[name]' : item.name,
					'[href]' : '#/' + $(dis).panelManager('createHash', item.model, item.id, nextPanel),
					};
					
				var li = $(dis).panelManager('cloneWithData', LIST_ITEM, info, item);
				$(li).appendTo(container);
				
				//info
				$(dis).panelManager('createPanelLink',$('a', li), futureSelector, item, nextPanel);
					
				//incloem les operacions individuals
				if(operations) {
					$(operations).clone(true).appendTo(li);
				}
			});
			//activem la selecci� d'elements i mostrem o amaguem les operacions
			$(selector + " :checkbox").click(function() {
				$(dis).panelManager('manageCheckboxes', futureSelector);
			});
		},
		
		
		//creem un li en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createGalleryBlock : function(selector, futureSelector, content, cols, nextPanel, operations) {
			var dis = this;
				
			var container = $('<ul class="elements"></ul>').appendTo(selector);
						
			$.each(content.items, function(i, item) {
				var info = {
					'[id]' : item.id,
					'[model]' : item.model,
					'[name]' : item.name,
					'[src]' : item.src,
					};
					
				var li = $(dis).panelManager('cloneWithData', GALLERY_ITEM, info, item);
				$(li).appendTo(container);

				//info
				$(dis).panelManager('createPanelLink',$('a', li), futureSelector, item, nextPanel);
									
				//incloem les operacions individuals
				if(operations) {
					$(operations).clone(true).appendTo(li);
				}
			});
			
			if(content.droppable) {
				$(this).panelManager('createDroppableArea',container);
			}
			
			//activem la selecci� d'elements i mostrem o amaguem les operacions
			$(selector + " :checkbox").click(function() {
				$(dis).panelManager('manageCheckboxes', futureSelector);
			});
		},
		
		
		//carreguem una llista d'opcions a fer, filtrades segons apply
		// none: no depen de id, t�pic de men�
		// single: dep�n d'una sola id, no va al men�
		// multi: aplica tant a llista com a men�
		createOperationList : function(selector, content, menu) {
			var dis = $(this);
			var apply = (menu)? operationMenuApply : createOperationListApply;
			
			var container = $('<ul></ul>');
			
			//fem un espai per comptar la quantitat d'elements seleccionats
			if(menu){
				$(OPERATION_COUNTER).appendTo(container).hide();
				
				$('a', OPERATION_COUNTER).click(function(){
						$(selector+' input[type=checkbox]').attr("checked", false);
						$(dis).panelManager('manageCheckboxes', selector);
					});				
			}
							
			//construim l'arbre d'operacions
			$.each(content.operations, function(i, operation) {
				if($.inArray(operation.apply, apply) > -1) {
					var info = {
						'[apply]' : operation.apply,
						'[icon]' : operation.icon,
						};
						
					var li = $(dis).panelManager('cloneWithData', OPERATION_ITEM, info, operation)
						.appendTo(container);

					$(dis).panelManager((menu) ? 'createMenuOperationLink' : 'createItemOperationLink', $('a', li), selector, operation);
				}
			});
				
			return container;
		},
		
		//definim una operació no dependent d'id o que rep multiples id [none, multi]
		createMenuOperationLink : function(objects, selector, operation){
			var dis = this;

			$(objects).click(function(){
				switch(operation.apply){
					case 'none':
						alert(operation.type);
						break;
					case 'multi':
						var values = []
						$(selector+' input[type=checkbox]').each( function() {
							if( $(this).is(':checked') ) values.push( $(this).val() );
						});
						id = values.join(',');
						alert(operation.type+ ' ' + id);
						break;
				}
			});
		},
		
		//definim una operació que ha de rebre una sola id malgrat sigui multi [single, multi]
		createItemOperationLink : function(objects, selector, operation){
			var dis = this;
			
			$(objects).click(function(){
				id = $(this).parents('.operations').parents('li').data('id');
				alert(operation.type+ ' ' + id);
			});
		},
		
		//creem un enllaç per a obrir un panell nou
		createPanelLink : function(objects, futureSelector, item, nextPanel){
			var dis = this;
			
			$(objects).click(function(){
				$(futureSelector + ' .active').removeClass('active');
				$(this).parent().addClass('active');
				$(dis).panelManager('openPanel', item.model, item.id, nextPanel);
			});
		},
		
		//creem una imatge un cop l'han deixat anar
		createDroppedImage : function(file){
			var preview = $(GALLERY_ITEM),
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
		},
		
		/**
		*	INTERACTION
		*/
		
		
		//controlem els elements seleccionats
		manageCheckboxes : function(selector){			
			var checks = $(selector + " input[type=checkbox]");
				
			$.each(checks, function(i, operation) {
				if($(this).is(':checked'))
					$(this).parent().addClass('selected');
				else
					$(this).parent().removeClass('selected');
			});
				
			var checked = $(selector + " :checked");
			if( checked.length > 0){
				$(selector + " .operationsMenu .multi").css('visibility','visible');
				$(selector + " .counterText").html(checked.length + ' element' + ((checked.length > 1) ? 's' : ''));
				$(selector + " .counter").show();
				$(selector + " .elements").addClass('selectedChildren');
			}else{
				$(selector + " .operationsMenu .multi").css('visibility','hidden');
				$(selector + " .counter").hide();
				$(selector + " .elements").removeClass('selectedChildren');
			}
		},
		
		//creem una zona on deixar arxius
		createDroppableArea : function(object){
			var dis = this;
			var dropbox = $(object).addClass('dropbox');
			
			dropbox.filedrop({
				// The name of the $_FILES entry:
				paramname:'pic',
		
				maxfiles: 5,
		    	maxfilesize: 2, // in mb
				url: './post_file.php',
			
				//drag over browser window	
			    docOver: function() {
			        dropbox.addClass('fileOnDoc');
			    },
			    docLeave: function() {
			        dropbox.removeClass('fileOnDoc');
			    },
			    
			    // drag over #dropzone
			    dragOver: function() {
			        dropbox.addClass('fileOnDrag');
			    },
			    dragLeave: function() {
			        dropbox.removeClass('fileOnDrag');
			    },
			    
			    drop: function() {
			        // user drops file
			        dropbox.removeClass('fileOnDrag');
			        dropbox.removeClass('fileOnDoc');
			    },
			
				uploadFinished:function(i,file,response){
					// response is the JSON object that php returns
					var block = $.data(file).addClass('done');
					$('.progress',block).delay(3000).slideUp(500);
				},
			
				error: function(err, file) {
					switch(err) {
						case 'BrowserNotSupported':
							$(dis).panelManager('showMessage', BAD_BROSWER_UPLOAD);
							break;
						case 'TooManyFiles':
							$(dis).panelManager('showMessage', MANY_FILES, {'[qty]': this.maxfiles});
							break;
						case 'FileTooLarge':
							$(dis).panelManager('showMessage', FILE_TOO_LARGE, {'[file]': file.name, '[size]': this.maxfilesize});
							break;
						default:
							break;
					}
				},
			
				// Called before each upload is started
				beforeEach: function(file){
					if(!file.type.match(/^image\//)){
						$(dis).panelManager('showMessage', ONLY_IMG);
			
						// Returning false will cause the
						// file to be rejected
						return false;
					}
				},
			
				uploadStarted:function(i, file, len){
					$(dis).panelManager('createImageDropped', file, dropbox);
				},
		
				progressUpdated: function(i, file, progress) {
					$.data(file).find('.progress').width(progress+'%');
				}
			});

		},
		
		createImageDropped : function (file, dropbox){
			var preview = $(GALLERY_ITEM),
				image = $('img', preview);
				
			$('.progressHolder', preview).css('display', 'block');
	
			var reader = new FileReader();
	
			reader.onload = function(e){
	
				// e.target.result holds the DataURL which
				// can be used as a source of the image:
	
				image.attr('src',e.target.result);
			};
	
			// Reading the file as a DataURL. When finished,
			// this will trigger the onload function above:
			reader.readAsDataURL(file);
	
			preview.appendTo(dropbox);
	
			// Associating a preview container
			// with the file, using jQuery's $.data():
	
			$.data(file,preview);
		},
	
		
		
		/**
		*	SCROLLBARS
		*/
		
		
		//apliquem tots els scrolls de la p�gina
		initScrolls : function() {
			var dis = this;			
			var isResizing = false;
			
			var win = $(window);
			win.bind('resize', function() {
				if(!isResizing) {
					isResizing = true;

					$(dis).panelManager('resetScroll',true);
					isResizing = false;
				}
			}).trigger('resize');

			// Workaround for known Opera issue which breaks demo (see
			// http://jscrollpane.kelvinluck.com/known_issues.html#opera-scrollbar )
			$('body').css('overflow', 'hidden');

			// IE calculates the width incorrectly first time round (it
			// doesn't count the space used by the native scrollbar) so
			// we re-trigger if necessary.
			if($(parent).width() != win.width()) {
				win.trigger('resize');
			}
		},
		
		
		//reiniciem tot el sistema de scrolls
		resetScroll : function(firstTime) {
			firstTime = (firstTime == undefined) ? false : firstTime;
			
			var win = $(window);
			
			var optionsV = {
				'verticalDragMaxHeight' : scrollMaxSize,
				'showArrows' : true,
				'animateScroll' : true,
				'animateDuration' : speed,
				'hijackInternalLinks' : true,
				'hideFocus' : true,
				//posem -6 per contrarrestar el width del css
				'verticalGutter' : -6,
			};

			var optionsH = {
				'horizontalDragMaxWidth' : scrollMaxSize,
				'showArrows' : true,
				'animateScroll' : true,
				'animateDuration' : speed,
				'hijackInternalLinks' : true,
				'hideFocus' : true,
				'verticalGutter' : 0,
			}

			this.panelManager('resizePanels');

			// Temporarily make the container tiny so it doesn't influence the
			// calculation of the size of the document
			$(parent).css({
				'width' : 1,
				'height' : 1
			});
			// Now make it the size of the window...
			$(parent).css({
				'width' : win.width(),
				'height' : win.height()
			});
			
			var end = (win.width() <= $(mainContent).width());
			try{ $(parent).data('jsp').scrollToPercentX(end ? 100 : 0, end ? true : false); }catch(e){}
			$(parent).jScrollPane(optionsH);
			$(parent).data('jsp').scrollToPercentX(end ? 100 : 0, true);

			// Internal scrollpanes
			$('.panel').jScrollPane(optionsV);
		},
		
		
		//fem un reescalat de tots els panells per adaptar-los a la mida de la p�gina
		resizePanels : function() {
			var lists = $('.list');
			var details = $('.detail');

			var panels = $('.panel');

			// allow all panes to be side by side.
			$(mainContent).css('width', Math.max(
				lists.size() * lists.outerWidth(true) + details.size() * details.outerWidth(true),
				panels.size() * panels.outerWidth(true)));

			var bar = $('.jspHorizontalBar').outerHeight();

			//fill the whole height but scrollbar
			$('.panel').css('height', $(window).height() - bar);
		},
		
		
		/**
		*	HELPERS
		*/
		
				
		//constructor d'id
		getPanelID : function(number, hash) {
			hash = (hash != undefined) ? hash : true;

			if(hash)
				return '#panel' + number;
			else
				return 'panel' + number;
		},
		
		
		//obtenim la div on colocar les dades
		getContentPane : function(selector) {
			var element = $(selector).jScrollPane();
			var api = element.data('jsp');
			return api.getContentPane();
		},
		
		
		//substituïm els valors especificats a l'array
		//omplim el 'data' de l'objecte principal amb totes les dades de node
		cloneWithData : function(template, values, node) {
			var tmp = template;
			
			//canviem els params de string per a totes les aparicions
			$.each(values, function(key, value) {
			  while (tmp.toString().indexOf(key) != -1)
			      tmp = tmp.replace(key,value);
			});
			
			var tmp2 = $(tmp);
				
			if(node){
				//afegim data al pare
				$.each(node, function(key, value) {
					//$(tmp2).attr('data-'+key,value);
					$(tmp2).data(key,value);
				});
				var a = 0;
			}
			
			return $(tmp2);
		},
		
		
		//en cas d'error retornem un missatge
		showMessage : function(message, params) {
			if(params){
				$.each(params, function(key, value) {
				  while (message.toString().indexOf(key) != -1)
				      message = message.replace(key,value);
				});
			}
			
			var msg = $($(this).panelManager('cloneWithData', ALERT_CONTAINER, {'[message]' : message})).appendTo('body');
			$('.close', msg).click(function(){
				$(msg).remove();
			});
		},
	};

	$.fn.panelManager = function(method) {

		// Method calling logic
		if(methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.panelManager');
		}

	};
})(jQuery);
