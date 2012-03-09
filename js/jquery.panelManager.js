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

	var config = {
		speed : 500,
		slide : 100,
		delay : 3000,

		scrollMaxSize : 100,

		dragOpacity: .8,

		baseURL : ''
	}

	// none: no depen de id, t�pic de men�
	// single: dep�n d'una sola id, no va al men�
	// multi: aplica tant a llista com a men�
	const MENU_APPLY = ['none', 'multi'];
	const LIST_APPLY = ['single', 'multi'];

	
	/*
	*	TEMPLATES HTML
	*/
	
	const PANEL_CONTAINER = '<section id="[id]" class="panel [selector]">'+
							'<span class="loading">carregant...</span>'+
						'</section>';
	
	const PANEL_HEADER = '<header>'+
							'<h2>[title]</h2>'+
							'<a class="close icon x_alt"></a>'+
						'</header>';
	
	const GENERIC_BLOCK = '<[tag] class="block-[num] [type]-block">'+
							'<h3>[title]</h3>'+
						'</[tag]>';
				
	// OPERACIONS

	const OPERATION_COUNTER ='<li class="counter">'+
						'<a class="icon x_alt"></a>'+
						'<span class="counterText"></span>'+
					'</li>';
					
	const OPERATION_ITEM ='<li class="[apply] [type]">'+
					'<a class="icon [icon]"></a>'+
				'</li>';

	const OPERATION_SELECTOR = '.icon';

	// FORM
				
	const FORM_BLOCK = '<div class="form update"></div>';

	const FORM_SELECTOR = '.update';
				
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
				
	// GALLERY

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
						
	// LIST

	const LIST_UL = '<ul class="elements"></ul>';

	const LIST_ITEM = '<li data-id="[id]">'+
					'<input type="checkbox" name="[model]" value="[id]"/>'+
					'<a href="[href]">'+
						'[name]'+
					'</a>'+
				'</li>';

	const LIST_UL_SELECTOR = '.elements';
	const LIST_ITEM_SELECTOR = LIST_UL_SELECTOR+'>li';
	const LIST_LINK_SELECTOR = LIST_ITEM_SELECTOR +' a:not('+OPERATION_SELECTOR+')';

	// LANGUAGE
					
	const LANGUAGE_BOX = '<div>'+
					'</div>';
	
	const LANGUAGE_TAB = '<div>'+
					'</div>';
	
	const LANGUAGE_CONTENT = 'div'+
					'</div>';
	
	const LANGUAGE_LINK = '<div>'+
					'</div>';

	// MESSAGE
	
	const ALERT_CONTAINER = '<div class="message_holder">'+
					'<div class="message_box">'+
						'<header>'+
							'[title]'+
							'<a class="close icon x_alt"></a>'+
						'</header>'+
						'[message]'+
					'</div>'+
				'</div>';

	// TIP

	const TIP_UL = '<ul class="tips"></ul>';
	const TIP_ITEM = '<li>[item]</div>';
	const TIP_ICON = '<span class="icon question_mark"></span>';

				
	// errors
	const BAD_PATH = 'Ruta errònia';
	const ONLY_IMG = 'Només pots pujar imatges';
	const FILE_TOO_LARGE = '[file] massa gran. La mida màxima és [size]MB';
	const MANY_FILES = "El màxim d'arxius permès és [qty]";
	const BAD_BROSWER_UPLOAD = "El teu navegador no admet la pujada d'arxius mitjançant arrossegament";
	
	var methods = {
		//creem un panell per defecte
		init : function(_config) {
			$.extend(config, _config);
			$.fx.speeds._default = config.speed;

			parent = $(this.selector);
			
			mainContent = $('<div></div>')
				.appendTo(parent)
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
			hash = hash.split('/')
				.slice(0, numPanel * 2)
				.join('/');
			return hash + '/' + model + '/' + id;
		},
				
		//llegim el hash, l'interpretem i obrim tots els panells corresponents
		parseHash : function() {
			var $this = $(this),
				hash = window.location.hash.slice(2),
				hashElements = hash.split('/');

			if(hashElements.length % 2 == 0) {
				var i = 0,
					turns = Math.floor(hashElements.length / 2),

					panelPopper = setInterval(function() {
						if(i == turns) {
							clearInterval(panelPopper);
						} else {
							$this.panelManager('openPanel', hashElements[i * 2], hashElements[i * 2 + 1], i, hashElements[i * 2 + 3]);
							i++;
						}
					});
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
			var $this = $(this),
				selector = this.panelManager('createNewPanel', numPanel);
			
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
						 $this.panelManager('parseJson',json);		
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
				},
				section = $($(this).panelManager('cloneWithData', PANEL_CONTAINER, info))
					.appendTo(mainContent);
			
			section.css({'opacity': 0,
					'left': -config.slide,
					'z-index': 100 - numPanel})
				.animate({
					opacity : '1',
					left : 0});

			this.panelManager('resetScroll');

			return '.' + info.selector;
		},
		

		
		/**
		*		DATA
		*/		
		
		//interpretem la info que ens arriba des del server
		parseJson : function(json, action) {
			var $this = $(this),
				panel = $this.panelManager('getContentPane', json.selector);

			panel.empty()
				.addClass(json.type)
				.hide();
			
			//preparem el header del panell
			var info = {
					title : json.title,
				},
				header = $(StringHandler.multiReplace(PANEL_HEADER, info))
					.appendTo(panel);

			$('.close', header).on('click',function(){
				$this.panelManager('closePanel', json.numPanel);
			});
	
			$this.panelManager('createBlocks', panel, json);

			//apliquem scroll, el fem aparéixer amb fade in i ens petem la class random per evitar conflictes en el futur
			panel.fadeIn();
			this.panelManager('resetScroll');
			$(json.selector).removeClass(json.selector.slice(1));
		},
		
		//creem tots els blocs que hem rebut via json
		createBlocks : function(panel, json){			
			var $this = $(this);
						
			//afegim un bloc per a cada node de contents						
			$.each(json.contents, function(i, content) {
				var info = {
						tag : (content.tag) ? content.tag : 'div',
						type : content.type,
						num : i,
						title : (content.title) ? content.title : '',
					},
					blockSelector = json.selector + ' ' + " .block-" + i,
					futureSelector = '#panel-' + json.numPanel + ' ' + " .block-" + i,
					operations,
					block;
				
				$(StringHandler.multiReplace(GENERIC_BLOCK, info))
					.appendTo(panel);

				if(content.operations) {
					$($this.panelManager('createOperationList', futureSelector, content, true))
						.appendTo(blockSelector)
						.addClass('operationsMenu');
					operations = $this.panelManager('createOperationList', futureSelector, content, false)
						.addClass('operations');

					$this.panelManager('createOperationLink', OPERATION_SELECTOR, futureSelector);
				}
								
				//creem cada bloc segons el tipus especificat
				switch(content.type) {
					case 'form':
						block = $this.panelManager('createFormBlock', blockSelector, content);
						break;
					case 'gallery':
						block = $this.panelManager('createGalleryBlock', blockSelector, futureSelector, content, json.numPanel + 1, operations);
						break;
					case 'html':
						block = $(content.html).appendTo(blockSelector);
						break;
					case 'list':
						block = $this.panelManager('createListBlock', blockSelector, futureSelector, content, json.numPanel + 1, operations);
						break;
					case 'tip':
						block = $this.panelManager('createTipBlock', blockSelector, content);
						break;
					default:
						Cnsl.log("Tipus " + content.type + " no trobat");
				}
				
				if(content.extras) {
					$.each(content.extras, function(i, extra) {
						switch(extra){
							case 'droppable':
								$this.panelManager('createDroppableArea',block);
								break;
							case 'sortable':
								break;
							default:
								Cnsl.log("Extra " + extra + " no definit");
						}
					});
				}
				
				if(content.active) {
					$(json.selector + ' .id-' + content.active).addClass('active');
				}
			});
		},
		
		//creem un enllaç per a obrir un panell nou
		createPanelLink : function(objectSelector, futureSelector, nextPanel){
			var $this = $(this),
				slct = $(futureSelector);

			slct.on('click', objectSelector, function(e){
				var li = $(this).parent(),
					item = li.data('node');

				li.addClass('active')
					.siblings()
						.removeClass('active');
				$this.panelManager('openPanel', item.model, item.id, nextPanel);
			});
		},

		//fem una crida a la resposta segons l'operació i les dades donades
		sendResponse : function(url, method, params){
			var _params = '';

			if(params){
				$.each(params, function(key,value){
					_params+=key+' : '+value+' / ';
				});
			}

			$(this).panelManager('showMessage',url+' // '+method+' // '+_params);
		},



		/**
		*	LIST
		*/
		
		//creem una llista en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createListBlock : function(selector, futureSelector, content, nextPanel, operations) {
			var $this = $(this),
				slct = $(selector),
				container = $(LIST_UL)
					.appendTo(selector);

			$.each(content.items, function(i, item) {
				var info = {
						id : item.id,
						model : item.model,
						name : item.name,
						href : '#/' + $this.panelManager('createHash', item.model, item.id, nextPanel),
					},
					li = $this.panelManager('cloneWithData', LIST_ITEM, info, item);

				li.appendTo(container);				
					
				//incloem les operacions individuals
				if(operations) {
					operations.clone(true).appendTo(li);
				}
			});

			//interacció
			$this.panelManager('createPanelLink',LIST_LINK_SELECTOR, futureSelector, nextPanel);
			
			//activem la selecci� d'elements i mostrem o amaguem les operacions
			slct.on('click',':checkbox',function() {
				$this.panelManager('manageCheckboxes', futureSelector);
			});
			
			return container;
		},

		sortListBlock : function(selector){
			var slct = $(selector).find(LIST_UL_SELECTOR);

			slct.sortable({
				axis: 'y',
				cursor: 'move',
				opacity: config.dragOpacity,
				placeholder: "emptyListItem",
				revert: true
			});
			slct.disableSelection();
		},

		saveSortListBlock : function(selector){
			var id = [],
				slct = $(selector);

			slct.find(LIST_UL_SELECTOR).sortable('destroy');

			slct.find(LIST_ITEM_SELECTOR).each(function(i){
					id.push($(this).data('id'));
				});

			return {id:id};
		},

		//tornem tots els elements on eren abans de fer sort
		cancelListBlock : function(selector){
			slct.find(LIST_UL_SELECTOR).sortable('cancel')
				.sortable('destroy');
		},



		/**
		*	GALLERY + IMAGES
		*/		
		
		//creem una galeria en base al que hem rebut via json
		// per escriure fem servir selector, que és un rand; per a clicks fem servir futureSelector que és la id fixa
		createGalleryBlock : function(selector, futureSelector, content, nextPanel, operations) {
			var $this = $(this),
				slct = $(selector),
				container = $(LIST_UL)
					.appendTo(selector);
						
			$.each(content.items, function(i, item) {
				var info = {
						id : item.id,
						model : item.model,
						name : item.name,
						src : item.src,
					},
					li = $this.panelManager('cloneWithData', GALLERY_ITEM, info, item);

				li.appendTo(container);
									
				//incloem les operacions individuals
				if(operations) {
					operations.clone(true).appendTo(li);
				}
			});

			//interacció
			$this.panelManager('createPanelLink',LIST_LINK_SELECTOR, futureSelector, nextPanel);
			
			//activem la selecci� d'elements i mostrem o amaguem les operacions
			slct.on('click',':checkbox',function() {
				$this.panelManager('manageCheckboxes', futureSelector);
			});
			
			return container;
		},
		
		//creem una imatge un cop l'han deixat anar
		createDroppedImage : function(file){
			var preview = $(GALLERY_ITEM),
				image = $('img', preview),
				reader = new FileReader();
	
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

		//creem una zona on deixar arxius
		createDroppableArea : function(object){
			var $this = $(this),
				dropbox = $(object).addClass('dropbox'),
				message = $('<span class="message"></span>').appendTo(dropbox),
				dropboxes = $('.dropbox');
			
			dropbox.filedrop({
				// The name of the $_FILES entry:
				paramname:'pic',
		
				maxfiles: 5,
		    	maxfilesize: 2, // in mb
				url: './post_file.php',
			
				//drag over browser window	
			    docOver: function(e) {
					dropboxes.addClass('fileOnDoc');
					message.html("Arrossega-ho fins aquí");
					Cnsl.log(e);
			    },
			    docLeave: function() {
			        dropboxes.removeClass('fileOnDoc');
			    },
			    
			    // drag over #dropzone
			    dragOver: function() {
					dropbox.addClass('fileOnDrag');
					message.html("Arrossega-ho fins aquí");
			    },
			    dragLeave: function() {
			        dropbox.removeClass('fileOnDrag');
			    },
			    
			    drop: function() {
			        // user drops file
			        dropbox.removeClass('fileOnDrag');
			        dropboxes.removeClass('fileOnDoc');
			        message.html("");
			    },
			
				uploadFinished:function(i,file,response){
					// response is the JSON object that php returns
					var block = $.data(file).addClass('done');
					$('.progress',block).delay(config.delay).slideUp();
				},
			
				error: function(err, file) {
					switch(err) {
						case 'BrowserNotSupported':
							$this.panelManager('showMessage', BAD_BROSWER_UPLOAD);
							break;
						case 'TooManyFiles':
							$this.panelManager('showMessage', MANY_FILES, {'qty': this.maxfiles});
							break;
						case 'FileTooLarge':
							$this.panelManager('showMessage', FILE_TOO_LARGE, {'file': file.name, 'size': this.maxfilesize});
							break;
						default:
							break;
					}
				},
			
				// Called before each upload is started
				beforeEach: function(file){
					if(!file.type.match(/^image\//)){
						$this.panelManager('showMessage', ONLY_IMG);
			
						// Returning false will cause the
						// file to be rejected
						return false;
					}
				},
			
				uploadStarted:function(i, file, len){
					$this.panelManager('createImageDropped', file, dropbox);
				},
		
				progressUpdated: function(i, file, progress) {
					$.data(file).find('.progress').width(progress+'%');
				}
			});
		},
		
		//creem un holder temporal per a mostrar la imatge en progrés
		createImageDropped : function (file, dropbox){
			var preview = $(GALLERY_ITEM),
				image = $('img', preview),
				reader = new FileReader();
				
			$('.progressHolder', preview).css('display', 'block');
		
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
		*	FORM
		*/
		
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
			var $this = $(this);
								
			$.each(items, function(i, item) {
				var info = {
						value : item.value,
					},
					div;
				
				switch(item.type){
					case 'select':
					case 'check':
					case 'radio':
						info.value = JsonHandler.getOptionLabel(info.value,item.options)
				}
							
				div = $this.panelManager('cloneWithData', FORM_PLAIN, info, item)
					.appendTo(container);
			});
		},
		
		//desem les dades del form i passem a text pla
		saveEditFormBlock : function(selector) {
			var $this = $(this),
				slct = $(selector),
				items = slct.data('items'),
			 	i=0;
				
			//desem les dades
			$.each(items, function(i, item) {
				var values = new Array,
					element;
				
				switch(item.type){
					case 'text':
					case 'textarea':
					case 'password':
						element = $(':input[name="'+item.name+'"]',slct);
						values = element.val();
						break;
					case 'radio':
					case 'check':
						$('[name="'+item.name+'"]:checked',slct).each(function() {
							values.push($(this).val());
						});
						break;
					case 'select':
						$('[name="'+item.name+'"] :selected',slct).each(function() {
							values.push($(this).val());
						});
						break;
					default:
						Cnsl.log('Tipus no trobat : '+item.type);
				}
				item.value = values;
			});
			
			//carreguem les dades en format text
			slct.empty();
			$(this).panelManager('fillPlainFormBlock', slct, items);

			this.panelManager('resetScroll');
		},
		
		//creem un formulari en base a les dades emmagatzemades
		editFormBlock : function(selector) {
			var $this = $(this),
				container = $(selector).empty();

			$.each(container.data('items'), function(i, item) {
				var info = {
						name : item.name,
						label : item.label,
						value : item.value,
						type : item.type,
					},
					infoOption = {
						name : item.name,
					},
					template,
					selections = '[name="'+item.name+'"]',
					options,
					div;

				switch(item.type){
					case 'text':
						template = FORM_TEXT;
						break;
					case 'textarea':
						template = FORM_TEXTAREA;
						break;
					case 'select':
						template = (item.multiple) ? FORM_SELECT_MULTI : FORM_SELECT_SINGLE;
						options = $this.panelManager('createFormOptions', item.options, FORM_OPTION, infoOption);
						break;
					case 'check':
						template = FORM_GROUP;
						options = $this.panelManager('createFormOptions', item.options, FORM_CHECK, infoOption);
						break;
					case 'radio':
						template = FORM_GROUP;
						options = $this.panelManager('createFormOptions', item.options, FORM_RADIO, infoOption);
						break;
					default:
						Cnsl.log("Tipus d'item a formulari no trobat : "+item.type);
				}
				if(options) info.options = options.join('');

				div = $this.panelManager('cloneWithData', template, info, item)
					.appendTo(container);
				$(selections,div).val(item.value);
			});	
			
			this.panelManager('resetScroll');
		},

		//eliminem els canvis del formulari i recuperem l'antic
		cancelFormBlock : function(selector) {			
		},
		
		//helper per als selects, construeix tots els 'option'
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



		/**
		*	TIPS
		*/

		//crea un nou bloc de consells
		createTipBlock : function(selector, content){
			var $this = $(this),
				slct = $(selector),
				container = $(TIP_UL)
					.appendTo(selector);

			slct.find('h3').prepend(TIP_ICON);

			$.each(content.items, function(i, item) {
				var info = { item : item },
					li = $this.panelManager('cloneWithData', TIP_ITEM, info, item);

				li.appendTo(container);
			});
			
			return container;
		},
		
		
		
		/**
		 * OPERATIONS
		 */
		
		//carreguem una llista d'opcions a fer, filtrades segons apply
		// none: no depen de id, t�pic de men�
		// single: dep�n d'una sola id, no va al men�
		// multi: aplica tant a llista com a men�
		createOperationList : function(selector, content, menu) {
			var $this = $(this),
				slct = $(selector),
				apply = (menu)? MENU_APPLY : LIST_APPLY,
				container = $('<ul></ul>'),
				counter;
			
			//fem un espai per comptar la quantitat d'elements seleccionats
			if(menu){
				counter = $(OPERATION_COUNTER).appendTo(container)
					.hide()
					.on('click','a',function(){
						$('input[type=checkbox]',slct).attr("checked", false);
						$this.panelManager('manageCheckboxes', slct);
					});				
			}
							
			//construim l'arbre d'operacions
			$.each(content.operations, function(i, operation) {
				if($.inArray(operation.apply, apply) > -1) {
					var info = {
							apply : operation.apply,
							icon : operation.icon,
							type : operation.type
						},						
						op = new Object,
						li;

					//si el botó és dual omplim 2 acions
					op.primary = ObjectHandler.cloneObject(operation);
					if(operation.second){
						op.secondary = ObjectHandler.cloneObject(operation.second);
						op.secondary.apply = operation.apply;
					}
					op.current = 'primary';
					op.menu = menu;
						
					li = $this.panelManager('cloneWithData', OPERATION_ITEM, info, op)
						.appendTo(container);
				}
			});
				
			return container;
		},
		
		//definim una operació no dependent d'id o que rep multiples id [none, multi]
		createOperationLink : function(objectSelector, selector){
			var $this = $(this),
				slct = $(selector);
			
			slct.on('click', objectSelector, function(){
				var icon = $(this),
					node = icon.parent().data('node'),
					operation = node[node.current],
					id = [],
					liData,
					operation_type = operation.type + ((node.current == 'secondary') ? '-'+node.primary.type : '');

				if(node.menu){
					switch(operation.apply){
						case 'none':
							// operacions: edita, nou, filtre...
							$this.panelManager('processOperation', operation_type, selector);
							break;
						case 'multi':
							// operacions: esborra multi....
							$('input:checked', slct).each( function(){
								id.push($(this).val());
							});
							$this.panelManager('processOperation', operation_type, selector, id);
							break;
					}
				}else{
					// operacions: esborra simple...
					$this.panelManager('processOperation', operation_type, selector, icon.closest(LIST_ITEM_SELECTOR).data('id'));
				}
			});
		},
		
		//parsegem la funció i decidim quina operació hem de fer
		processOperation : function(operation_type, selector, id){
			var $this = $(this),
				slct = $(selector),
				currentPanel = selector.split(' ')[0].split('#panel-')[1],
				currentBlock = selector.split(' ')[2].split('.block-')[1],
				button = $('.operationsMenu .'+operation_type.split('-')[0], slct),
				node = button.data('node'),
				apiCall = node[node.current].apiCall,
				params;

			id = ($.isArray(id)) ? id.join(',') : id;
			
			switch(operation_type){
				case 'delete':
					params = {id:id};
					break;

				case 'edit':
					$this.panelManager('changeButtonAction',button, selector);
					$this.panelManager('editFormBlock',selector+' '+FORM_SELECTOR);
					break;
					
				case 'save-edit':
					$this.panelManager('changeButtonAction',button, selector);
					$this.panelManager('saveEditFormBlock',selector+' '+FORM_SELECTOR);
					break;
					
				case 'cancel-edit':
					$this.panelManager('changeButtonAction',button, selector);
					$this.panelManager('cancelEditFormBlock',selector+' '+FORM_SELECTOR);
					break;

				case 'new':
					//$this.panelManager('openPanel', item.model, item.id, nextPanel);
					break;

				case 'sort':
					$this.panelManager('changeButtonAction',button, selector);
					$this.panelManager('sortListBlock',selector);
					break;
					
				case 'save-sort':
					$this.panelManager('changeButtonAction',button, selector);
					params = $this.panelManager('saveSortListBlock',selector);
					break;
					
				case 'cancel-sort':
					$this.panelManager('changeButtonAction',button, selector);
					$this.panelManager('cancelSortListBlock',selector);
					break;
					
				default:
					alert(operation_type+" panel:"+currentPanel+" block:"+currentBlock+" id:"+id);
					break;
			}

			if(apiCall) $this.panelManager('sendResponse',apiCall.url,apiCall.method,params);
		},
		
		//canviem els botons per a la funció alternativa
		changeButtonAction : function(button, selector){
			var node = button.data('node'),
				slct = $(selector),
				info,
				button2;

			node.current = (node.current == 'primary') ? 'secondary' : 'primary';			
			info = node[node.current];

			button2 = $(StringHandler.multiReplace(OPERATION_ITEM, info, true))
				.data('node', $.extend( true, {}, node));
			button.replaceWith(button2);

			//el link es fa a través dels clicks al block filtrats per OPERATION_SELECTOR
		},	
		
		//controlem els elements seleccionats
		manageCheckboxes : function(selector){			
			var slct = $(selector),
				checks = $("input[type=checkbox]",slct),
				checked = $(":checked",slct);
				
			$.each(checks, function(i, operation) {
				if($(this).is(':checked'))
					$(this).parent().addClass('selected');
				else
					$(this).parent().removeClass('selected');
			});
			
			//activem o desactivem les opcions
			if( checked.length > 0){
				$(".operationsMenu .multi",slct).css('visibility','visible');
				$(".counterText",slct).html(checked.length + ' element' + ((checked.length > 1) ? 's' : ''));
				$(".counter",slct).show();
				$(".elements",slct).addClass('selectedChildren');
			}else{
				$(".operationsMenu .multi",slct).css('visibility','hidden');
				$(".counter",slct).hide();
				$(".elements",slct).removeClass('selectedChildren');
			}
		},
			
		
		
		/**
		*	SCROLLBARS
		*/
				
		//apliquem tots els scrolls de la p�gina
		initScrolls : function() {
			var $this = $(this),
				isResizing = false,
				win = $(window);

			win.bind('resize', function() {
				if(!isResizing) {
					isResizing = true;

					$this.panelManager('resetScroll',true);
					isResizing = false;
				}
			}).trigger('resize');

			// Workaround for known Opera issue which breaks demo (see
			// http://jscrollpane.kelvinluck.com/known_issues.html#opera-scrollbar )
			$('body').css('overflow', 'hidden');

			// IE calculates the width incorrectly first time round (it
			// doesn't count the space used by the native scrollbar) so
			// we re-trigger if necessary.
			if(parent.width() != win.width()) {
				win.trigger('resize');
			}
		},
		
		
		//reiniciem tot el sistema de scrolls
		resetScroll : function(firstTime) {
			firstTime = (firstTime == undefined) ? false : firstTime;
			
			var win = $(window),
				optionsV = {
					'verticalDragMaxHeight' : config.scrollMaxSize,
					'showArrows' : true,
					'animateScroll' : true,
					'animateDuration' : config.speed,
					'hijackInternalLinks' : false,
					'hideFocus' : true,
					//posem -6 per contrarrestar el width del css
					'verticalGutter' : -6,
				},
				optionsH = {
					'horizontalDragMaxWidth' : config.scrollMaxSize,
					'showArrows' : true,
					'animateScroll' : true,
					'animateDuration' : config.speed,
					'hijackInternalLinks' : false,
					'hideFocus' : true,
					'verticalGutter' : 0,
				},
				end;

			this.panelManager('resizePanels');

			// Temporarily make the container tiny so it doesn't influence the
			// calculation of the size of the document
			parent.css({
				'width' : 1,
				'height' : 1
			});
			// Now make it the size of the window...
			parent.css({
				'width' : win.width(),
				'height' : win.height()
			});
			
			end = (win.width() <= $(mainContent).width());
			try{
				parent.data('jsp').scrollToPercentX(end ? 100 : 0, end ? true : false);
			}catch(e){}
			parent.jScrollPane(optionsH);
			parent.data('jsp').scrollToPercentX(end ? 100 : 0, true);

			// Internal scrollpanes
			$('.panel').jScrollPane(optionsV);
		},
		
		
		//fem un reescalat de tots els panells per adaptar-los a la mida de la p�gina
		resizePanels : function() {
			var lists = $('.list'),
				details = $('.detail'),
				panels = $('.panel'),
				bar = $('.jspHorizontalBar').outerHeight();

			// allow all panes to be side by side.
			mainContent.css('width', Math.max(
				lists.size() * lists.outerWidth(true) + details.size() * details.outerWidth(true),
				panels.size() * panels.outerWidth(true)));

			//fill the whole height but scrollbar
			panels.css('height', $(window).height() - bar);
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
			return $(selector).jScrollPane().data('jsp').getContentPane();
		},		
		
		//substituïm els valors especificats a l'array
		//omplim el 'data' de l'objecte principal amb totes les dades de node
		cloneWithData : function(template, pairs, node) {			
			var tmp = $(StringHandler.multiReplace(template, pairs));
				
			//afegim data al pare
			tmp.data('node', ObjectHandler.cloneObject(node));
			
			return tmp;
		},		
		
		//en cas d'error retornem un missatge
		showMessage : function(message, params) {
			var msg;

			if(params){
				$.each(params, function(key, value) {
				  while (message.toString().indexOf(key) != -1)
				      message = message.replace(key,value);
				});
			}
			
			msg = $(StringHandler.multiReplace(ALERT_CONTAINER, {'message' : message}))
				.appendTo('body');
			$('.close', msg).on('click',function(){
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