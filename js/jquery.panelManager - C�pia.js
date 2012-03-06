/**
 *	Dependencies:
 *		jquery 1.7.1
 *		jscrollpane
 *		mousewheel
 * 		filedrop
 */

var time = 1000;

(function($) {
	var production = !((document.location.hostname == "localhost") | (document.location.protocol == "file:"));
	
	var _numPanels = 0;
	var parent;
	var mainContent;

	var defaultPanelURL = '';
	var baseURL = '';

	const SPEED = 500;
	const SLIDE = 50;
	const DELAY = 3000;

	const SCROLL_MAX_SIZE = 100;

	// none: no depen de id, t�pic de men�
	// single: dep�n d'una sola id, no va al men�
	// multi: aplica tant a llista com a men�
	const MENU_APPLY = ['none', 'multi'];
	const LIST_APPLY = ['single', 'multi'];

	
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
					'<input type="checkbox" name="[model]" value="[id]"/>'+
					'<a href="[href]">'+
						'[name]'+
					'</a>'+
				'</li>';
				
	const GALLERY_ITEM = '<li class="id-[id]">'+
					'<span class="message"></span>'+
					'<input type="checkbox" name="[model]" value="[id]"/>'+
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
					
	const OPERATION_ITEM ='<li class="[apply] [type]">'+
					'<a class="iconic [icon]"></a>'+
				'</li>';
	
	const ALERT_CONTAINER = '<div class="message_holder">'+
					'<div class="message_box">'+
						'<header>'+
							'[title]'+
							'<a class="close iconic x_alt"></a>'+
						'</header>'+
						'[message]'+
					'</div>'+
				'</div>';
				
	const FORM_BLOCK = '<div class="form update"></div>';
				
	const FORM_TEXT = '<div class="[type]">'+
						'<label for=[name]>[label]</label>'+
						'<input type ="text" id="[name]" name="[name]" placeholder="[label]" value="[value]"/>'+
					'</div>';
					
	const FORM_TEXTAREA = '<div class="[type]">'+
						'<label for=[name]>[label]</label>'+
						'<textarea id="[name]" name="[name]" placeholder="[label]">[value]</textarea>'+
					'</div>';
					
	const FORM_GROUP = '<div class="[type]">'+
						'<label>[label]</label>'+
						'[options]'+
					'</div>';
					
	const FORM_CHECK = '<div>'+
						'<input type ="checkbox" id="[name]-[i]" name="[name]" value="[value]"/>'+
						'<label for="[name]-[i]">[label]</label>'+
					'</div>';
					
	const FORM_RADIO = '<div>'+
						'<input type ="radio" id="[name]-[i]" name="[name]" value="[value]"/>'+
						'<label for="[name]-[i]">[label]</label>'+
					'</div>';
				
	const FORM_SELECT_SINGLE = '<div class="[type]">'+
						'<label for=[name]>[label]</label>'+
						'<select id="[name]" name="[name]">[options]</select>'+
					'</div>';
				
	const FORM_SELECT_MULTI = '<div class="[type]">'+
						'<label for=[name]>[label]</label>'+
						'<select multiple="multiple" id="[name]" name="[name]">[options]</select>'+
					'</div>';
						
	const FORM_OPTION = '<option value="[value]">[label]</option>';
	
	const FORM_PLAIN = '<div>'+
						'<span>[value]</span>'+
					'</div>';
					
	const LANGUAGE_BOX = '<div>'+
					'</div>';
	
	const LANGUAGE_TAB = '<div>'+
					'</div>';
	
	const LANGUAGE_CONTENT = 'div'+
					'</div>';
	
	const LANGUAGE_LINK = '<div>'+
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

				if(production)
					this.panelManager('openPanel','clients',0,0);
				else
					this.panelTester('openDefaultPanel');
				 
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
				}, SPEED);
			} else {
				this.panelManager('showMessage', BAD_PATH);
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
			var dis = this;
			var selector = this.panelManager('createNewPanel', numPanel);
			
			if(production){
				//PRODUCTION
				$.getJSON("http://kiwity-lab.com/test/yiiBO2012/api/"+model,//+(id>0) ? "/"+id : '',
					{
						requestMethod : "GET",
						numPanel : numPanel,
						selector : selector,
						activeId : activeId
					 },
					 function(json) {
						 $($(dis).panelManager('parseJson',json));		
					 });
			}else{
				switch(numPanel){
					case 0:
						this.panelTester('fillList', selector, model, id, numPanel, activeId);
						break;
					default:
						this.panelTester('fillDetail', selector, model, id, numPanel, activeId);
						break;
				}
			}
		},
		
		
		//constructor d'un nou panell buit
		createNewPanel : function(numPanel) {			
			var info = {
				selector : 'rnd' + Math.round(Math.random() * 1000),
				id : this.panelManager('getPanelID', numPanel, false)
				};
			
			var section = $($(this).panelManager('cloneWithData', PANEL_CONTAINER, info)).appendTo(mainContent);
			
			$(section).css({'opacity': 0,
					'left': -SLIDE,
					'z-index': 100 - numPanel})
				.animate({
					opacity : '1',
					left : 0},
					SPEED);

			this.panelManager('resetScroll');

			return '.' + info.selector;
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
				title : json.title,
				};
				
			var header = $(StringHandler.multiReplace(PANEL_HEADER, info)).appendTo(panel);
			$('.close', header).click(function(){
				$(dis).panelManager('closePanel', json.numPanel);
			});
	
			$(this).panelManager('createBlocks', panel, json);

			//apliquem scroll, el fem aparéixer amb fade in i ens petem la class random per evitar conflictes en el futur
			$(panel).fadeIn(SPEED);
			this.panelManager('resetScroll');
			$(json.selector).removeClass(json.selector.slice(1));
		},
		
		//creem tots els blocs que hem rebut via json
		createBlocks : function(panel, json){			
			var dis = this;
						
			//afegim un bloc per a cada node de contents						
			$.each(json.contents, function(i, content) {
				var info = {
					tag : (content.tag) ? content.tag : 'div',
					type : content.type,
					num : i,
					title : (content.title) ? content.title : '',
					};
				
				$(StringHandler.multiReplace(GENERIC_BLOCK, info)).appendTo(panel);

				var blockSelector = json.selector + ' ' + " .block-" + i,
					futureSelector = '#panel-' + json.numPanel + ' ' + " .block-" + i,
					operations;

				if(content.operations) {
					$($(dis).panelManager('createOperationList', futureSelector, content, true)).appendTo(blockSelector).addClass('operationsMenu');
					operations = $(dis).panelManager('createOperationList', futureSelector, content, false).addClass('operations');
				}
				
				var block;
				
				//creem cada bloc segons el tipus especificat
				switch(content.type) {
					case 'list':
						block = $(dis).panelManager('createListBlock', blockSelector, futureSelector, content, json.numPanel + 1, operations);
						break;
					case 'html':
						block = $(blockSelector).append(content.html);
						break;
					case 'gallery':
						block = $(dis).panelManager('createGalleryBlock', blockSelector, futureSelector, content, json.numPanel + 1, operations);
						break;
					case 'form':
						block = $(dis).panelManager('createFormBlock', blockSelector, content);
						break;
					default:
						throw "Tipus " + content.type + " no trobat";
				}
				
				if(content.extras) {
					$.each(content.extras, function(i, extra) {
						switch(extra){
							case 'droppable':
								$(dis).panelManager('createDroppableArea',block);
								break;
							case 'sortable':
								break;
							default:
								throw "Extra " + extra + " no definit";
						}
					});
				}
				
				if(content.active) {
					$(json.selector + ' .id-' + content.active).addClass('active');
				}
			});
		},
		
		//creem una llista en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createListBlock : function(selector, futureSelector, content, nextPanel, operations) {
			var dis = this;			
				
			var container = $('<ul class="elements"></ul>').appendTo(selector);

			$.each(content.items, function(i, item) {
				var info = {
					id : item.id,
					model : item.model,
					name : item.name,
					href : '#/' + $(dis).panelManager('createHash', item.model, item.id, nextPanel),
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
			
			return container;
		},
		
		
		//creem una galeria en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createGalleryBlock : function(selector, futureSelector, content, nextPanel, operations) {
			var dis = this;
				
			var container = $('<ul class="elements"></ul>').appendTo(selector);
						
			$.each(content.items, function(i, item) {
				var info = {
					id : item.id,
					model : item.model,
					name : item.name,
					src : item.src,
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
			
			//activem la selecci� d'elements i mostrem o amaguem les operacions
			$(selector + " :checkbox").click(function() {
				$(dis).panelManager('manageCheckboxes', futureSelector);
			});
			
			return container;
		},
		
		//creem un formulari en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createFormBlock : function(selector, content) {
			var container = $(FORM_BLOCK).appendTo(selector);
			$(this).panelManager('fillPlainFormBlock', container, content.items);
			container.data('items',content.items);
			
			return container;
		},
		
		//omplim el formulari
		fillPlainFormBlock : function(container, items){
			var dis = this;
								
			$.each(items, function(i, item) {
				var info = {
					value : item.value,
					};
				
				switch(item.type){
					case 'select':
					case 'check':
					case 'radio':
						info.value = JsonHandler.getOptionLabel(info.value,item.options)
				}
							
				var div = $(dis).panelManager('cloneWithData', FORM_PLAIN, info, item);
				$(div).appendTo(container);
			});
		},
		
		//desem les dades del form i passem a text pla
		uneditFormBlock : function(selector) {
			var dis = this;
			var container = $(selector);
				
			//desem les dades
			var items = container.data('items'),
			 		i=0;
			 		
			$.each(items, function(i, item) {
				var values = new Array;
				
				switch(item.type){
					case 'text':
					case 'textarea':
					case 'password':
						var element = $(':input[name="'+item.name+'"]',selector);
						values = element.val();
						break;
					case 'radio':
					case 'check':
						$('[name="'+item.name+'"]:checked',selector).each(function() {
							values.push($(this).val());
						});
						break;
					case 'select':
						$('[name="'+item.name+'"] :selected',selector).each(function() {
							values.push($(this).val());
						});
						break;
					default:
						throw 'Tipus no trobat : '+item.type;
				}
				item.value = values;
			});
			
			//carreguem les dades en format text
			container.empty();
			$(this).panelManager('fillPlainFormBlock', container, items);

			this.panelManager('resetScroll');
		},
		
		//creem un formulari en base a les dades emmagatzemades
		editFormBlock : function(selector) {
			var dis = this;
				
			var container = $(selector).empty();
			$.each(container.data('items'), function(i, item) {
				var info = {
						name : item.name,
						label : item.label,
						value : item.value,
						type : item.type,
					},
					infoOption = {
						name : item.name,
					}
					
				var template,
					selections = '[name="'+item.name+'"]';
				switch(item.type){
					case 'text':
						template = FORM_TEXT;
						break;
					case 'textarea':
						template = FORM_TEXTAREA;
						break;
					case 'select':
						template = (item.multiple) ? FORM_SELECT_MULTI : FORM_SELECT_SINGLE;
						var options = $(dis).panelManager('createFormOptions', item.options, FORM_OPTION, infoOption);
					  	info.options = options.join('');
						break;
					case 'check':
						template = FORM_GROUP;
						var options = $(dis).panelManager('createFormOptions', item.options, FORM_CHECK, infoOption);
					  	info.options = options.join('');
						break;
					case 'radio':
						template = FORM_GROUP;
						var options = $(dis).panelManager('createFormOptions', item.options, FORM_RADIO, infoOption);
					  	info.options = options.join('');
						break;
					default:
						throw "Tipus d'item a formulari no trobat : "+item.type;
				}
				var div = $(dis).panelManager('cloneWithData', template, info, item);
				$(div).appendTo(container);
				$(selections,div).val(item.value);
			});			
			
			this.panelManager('resetScroll');
		},
		
		createFormOptions : function(options,template, info){
			var ops = new Array;
			
			$.each(options, function(i,option){
				var infoOption = {
					value : option.value,
					label : option.label,
					i : i,
				};
				
				ops.push(StringHandler.multiReplace(template, $.extend(infoOption, info), true));
		  });
		  
		  return ops;
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
		 * OPERATIONS
		 */
		
		//carreguem una llista d'opcions a fer, filtrades segons apply
		// none: no depen de id, t�pic de men�
		// single: dep�n d'una sola id, no va al men�
		// multi: aplica tant a llista com a men�
		createOperationList : function(selector, content, menu) {
			var dis = $(this);
			var apply = (menu)? MENU_APPLY : LIST_APPLY;
			
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
						apply : operation.apply,
						icon : operation.icon,
						type : operation.type
						};
					
					//si el botó és dual omplim 2 acions
					var op = new Object;
					op.primary = ObjectHandler.cloneObject(operation);
					if(operation.save){
						op.secondary = ObjectHandler.cloneObject(operation.save);
						op.secondary.apply = operation.apply;
					}
					op.current='primary';
						
					var li = $(dis).panelManager('cloneWithData', OPERATION_ITEM, info, op)
						.appendTo(container);

					$(dis).panelManager((menu) ? 'createMenuOperationLink' : 'createItemOperationLink', $('a', li), selector, op.primary);
				}
			});
				
			return container;
		},
		
		//definim una operació no dependent d'id o que rep multiples id [none, multi]
		createMenuOperationLink : function(objects, selector, operation){
			var dis = this;
			
			objects.click(function(){
				switch(operation.apply){
					case 'none':
						$(dis).panelManager('processOperation', operation.type, selector);
						break;
					case 'multi':
						var id = []
						$('input[type=checkbox]', selector).each( function() {
							if( $(this).is(':checked') ) id.push( $(this).val() );
						});
						$(dis).panelManager('processOperation', operation.type, selector, id);
						break;
				}
			});
		},
		
		//definim una operació que ha de rebre una sola id malgrat sigui multi [single, multi]
		createItemOperationLink : function(objects, selector, operation){
			var dis = this;
			
			$(objects).click(function(){
				var node = $(this).parents('.operations').parents('li').data('node');
				$(dis).panelManager('processOperation', operation.type, selector, node.id);
			});
		},
		
		//parsegem la funció i decidim quina operació hem de fer
		processOperation : function(operation_type, selector, id){
			var dis = this;
			id = ($.isArray(id)) ? id.join(',') : id;

			var currentPanel = selector.split(' ')[0].split('#panel-')[1],
				currentBlock = selector.split(' ')[2].split('.block-')[1],
				button = $('.operationsMenu .'+operation_type, selector);	
			
			switch(operation_type){
				case 'new':
					//$(dis).panelManager('openPanel', item.model, item.id, nextPanel);
					break;
					
				case 'edit':
					$(dis).panelManager('changeButtonAction',button, selector);
					$(dis).panelManager('editFormBlock',selector+" .update");
					break;
					
				case 'save':
					$(dis).panelManager('changeButtonAction',button, selector);
					$(dis).panelManager('uneditFormBlock',selector+" .update");
					break;
					
				default:
					alert(operation_type+" panel:"+currentPanel+" block:"+currentBlock+" id:"+id);
					break;
			}
		},
		
		//canviem els botons per a la funció alternativa
		changeButtonAction : function(button, selector){
			var node = button.data('node'),
				info;
			
			if(node.current == 'primary'){
				info = node.secondary;
				node.current = 'secondary';
			}else{
				info = node.primary;
				node.current = 'primary';
			}
			
			var button2 = $(StringHandler.multiReplace(OPERATION_ITEM, info, true))
				.data('node', $.extend( true, {}, node));
				
			button.replaceWith(button2);
			
			this.panelManager('createMenuOperationLink', $('.'+info.type+' a', selector), selector, info);		
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
			var dropbox = $(object).addClass('dropbox')
			var message = $('<span class="message"></span>').appendTo(dropbox);
			
			dropbox.filedrop({
				// The name of the $_FILES entry:
				paramname:'pic',
		
				maxfiles: 5,
		    maxfilesize: 2, // in mb
				url: './post_file.php',
			
				//drag over browser window	
			    docOver: function() {
			        dropbox.addClass('fileOnDoc');
			        $(message).html("Arrossega-ho fins aquí");
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
			        $(message).html("");
			    },
			
				uploadFinished:function(i,file,response){
					// response is the JSON object that php returns
					var block = $.data(file).addClass('done');
					$('.progress',block).delay(DELAY).slideUp(SPEED);
				},
			
				error: function(err, file) {
					switch(err) {
						case 'BrowserNotSupported':
							$(dis).panelManager('showMessage', BAD_BROSWER_UPLOAD);
							break;
						case 'TooManyFiles':
							$(dis).panelManager('showMessage', MANY_FILES, {'qty': this.maxfiles});
							break;
						case 'FileTooLarge':
							$(dis).panelManager('showMessage', FILE_TOO_LARGE, {'file': file.name, 'size': this.maxfilesize});
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
				'verticalDragMaxHeight' : SCROLL_MAX_SIZE,
				'showArrows' : true,
				'animateScroll' : true,
				'animateDuration' : SPEED,
				'hijackInternalLinks' : true,
				'hideFocus' : true,
				//posem -6 per contrarrestar el width del css
				'verticalGutter' : -6,
			};

			var optionsH = {
				'horizontalDragMaxWidth' : SCROLL_MAX_SIZE,
				'showArrows' : true,
				'animateScroll' : true,
				'animateDuration' : SPEED,
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
				return '#panel-' + number;
			else
				return 'panel-' + number;
		},
		
		
		//obtenim la div on colocar les dades
		getContentPane : function(selector) {
			var element = $(selector).jScrollPane();
			var api = element.data('jsp');
			return api.getContentPane();
		},
		
		
		//substituïm els valors especificats a l'array
		//omplim el 'data' de l'objecte principal amb totes les dades de node
		cloneWithData : function(template, pairs, node) {			
			var tmp = $(StringHandler.multiReplace(template, pairs));
				
			//afegim data al pare
			$(tmp).data('node',	ObjectHandler.cloneObject(node));
			
			return $(tmp);
		},
		
		
		//en cas d'error retornem un missatge
		showMessage : function(message, params) {
			if(params){
				$.each(params, function(key, value) {
				  while (message.toString().indexOf(key) != -1)
				      message = message.replace(key,value);
				});
			}
			
			var msg = $(StringHandler.multiReplace(ALERT_CONTAINER, {'message' : message}))
				.appendTo('body');
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


var StringHandler = {
	//afegim també uns brackets
	multiReplace : function(string, pairs){
			//canviem els params de string per a totes les aparicions
			$.each(pairs, function(key, value) {
				key = '['+key+']';
			  while (string.toString().indexOf(key) != -1)
			      string = string.replace(key,value);
			});
			return string;
	}
};

var JsonHandler = {
	getOptionLabel : function(values, options){
		var label = new Array;
		
		$.each(values, function(i,value){
			$.each(options, function(j,option){
				if(value == option.value)
					label.push(option.label);
			});
		});
		return label.join(', ');
	},
	getIndexByName : function(name, items) {
		var index;
		//name = name.split('[]')[0];
		
		$.each(items, function(i, item) {
			if(name == item.name)
				index = i;
		});
		return index;
	}
}

var ObjectHandler = {
    //public method
    cloneObject : function(oldObject) {
        var tempClone = {};

        if (typeof(oldObject) == "object")
            for (prop in oldObject)
                // for array use private method cloneArray
                if ((typeof(oldObject[prop]) == "object") &&
                                (oldObject[prop]).__isArray)
                    tempClone[prop] = this.cloneArray(oldObject[prop]);
                // for object make recursive call to cloneObject
                else if (typeof(oldObject[prop]) == "object")
                    tempClone[prop] = this.cloneObject(oldObject[prop]);
                // normal (non-object type) members
                else
                    tempClone[prop] = oldObject[prop];

        return tempClone;
    },

    //private method (to copy array of objects) - cloneObject will use this internally
    cloneArray : function(oldArray) {
        var tempClone = [];

        for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
            if (typeof(oldArray[arrIndex]) == "object")
                tempClone.push(this.cloneObject(oldArray[arrIndex]));
            else
                tempClone.push(oldArray[arrIndex]);

        return tempClone;
    }
};


var Cnsl = {
	log : function(obj) {
		console.groupCollapsed(({}).toString.call(obj).split(' ')[1].split(']')[0]);
		for (var k in obj) obj.hasOwnProperty(k) && console.log(k + ': ', obj[k]);
		console.log('__proto__: ', obj.__proto__);
		console.groupEnd();
	}
};