//per a browsers antics
if (typeof Object.create !== 'function') {
	Object.create = function(obj) {
		function F() {};
		F.prototype = obj;
		return new F();
	}
}



/**************************************
		PANEL MANAGER
***************************************/


// li passem window, document i undefined per a poder comprimir millor després
(function($, window, document, undefined) {
	var objectMatch = {
		items: 'selectableItem',
		operations: 'operationItem',
		images: 'imageItem'
	};

	/**
	 *		GENERAL OBJECT
	 *		d'on extendran tots els elements
	 */

	var GeneralObj = {

		elem: {},
		// l'element cridat
		$elem: {},
		// el node jquery de l'element
		block: {},
		// block pare
		panel: {},
		// panell avi
		mng: {},
		// panel manager
		data: {},
		// dades recuperades de l'API
		parentSelector: {},
		// el selector sobre el que aplicar events
		// inicialitzem un bloc
		init: function(options, elem) {
			options = options || {};

			this.elem = elem;
			this.$elem = $(elem);

			this.mng = options.mng;
			this.panel = options.panel;
			this.block = options.block;
			this.data = options.data || {};

			this.parentSelector = options.parentSelector;

			this.init2(options.first || false);

			return this;
		},

		// copiem totes les dades d'un objecte rebut
		copyData: function(obj) {
			this.elem = obj.elem;
			this.$elem = obj.$elem;

			this.mng = obj.mng;
			this.panel = obj.panel;
			this.block = obj.block;
			this.data = obj.data;

			this.parentSelector = obj.parentSelector;

			return this;
		},

		// apliquem el this de nou
		setElem: function(elem){
			this.elem = elem;
			this.$elem = $(elem);

			return this;
		}
	};



	/**
	 *		SELECTABLE
	 *		elements d'una llista
	 */


	var SelectableObj = {
		// exten GeneralObj
		// inicialitzem un bloc
		init2: function(first) {
			var self = this;

			if (first) {
				// activem el pare només amb la primera instància
				this.block.$elem.off('click').on('click', self.mng.options.selectors.item_link, function(e) {
					//recuperem l'objecte clicat i el seu objecte relacionat
					var selectable = $(this).parents(self.mng.options.selectors.items).data('control');

					selectable.activate()
						.mng.openLink(selectable.data.apiCall);

					e.preventDefault();
				});
			}
		},

		// fem un canvi d'element actiu
		activate: function() {
			this.$elem.addClass('active')
				.siblings()
					.removeClass('active');

			return this;
		},
	};



	/**
	 *		OPERATION
	 *		icones
	 */


	var OperationObj = {
		//exten GeneralObj
		// inicialitzem un bloc
		init2: function(first) {
			var self = this;

			// marquem que l'operació actual és 0
			this.data.current = 0;

			if (first) {
				// activem el pare només amb la primera instància
				this.block.$elem.find(this.parentSelector).off('click').on('click', self.mng.options.selectors.operation_link, function(e) {
					//recuperem l'objecte clicat i el seu objecte relacionat
					var selectable = $(this).data('control'),
						nodeData = selectable.data,
						currentNode = selectable.getCurrentAction();

					if (currentNode.apiCall) selectable.mng.openLink(currentNode.apiCall);

					// 0, 1, apply i current
					if (Object.size(nodeData) > 3) selectable.swapOperation();

					e.preventDefault();
				});
			}
		},

		// canviem a la segona opció
		swapOperation: function() {
			var button2,
				newNode;

			//excepte apply i current
			this.data.current = (++this.data.current) % (Object.size(this.data) - 2);
			newNode = this.getCurrentAction();

			button2 = $(this.mng.options.templates.operationLink(newNode));
			var a= button2.operationItem()
				.copyData(this)
				.setElem(button2);

			this.$elem.replaceWith(button2);

			return this;
		},

		// tornem el node de l'acció actual
		getCurrentAction: function(){
			return this.data[this.data.current]
		}
	};



	/**
	 *		IMAGE
	 *		imatges que s'han de maltractar (retallar, etiquetar...)
	 */



	/**
	 *		BLOCKS
	 *		llistes, forms, html, galeria...
	 */


	var BlockObj = {

		elem: {},
		// l'element cridat
		$elem: {},
		// el node jquery de l'element
		panel: {},
		// panell pare
		mng: {},
		// panel manager
		data: {},
		//dades recuperades de l'API
		// inicialitzem un bloc
		init: function(options, elem) {
			this.elem = elem;
			this.$elem = $(elem);

			this.mng = options.mng;
			this.panel = options.panel;
		},

		//carreguem tota la info que acabem de rebre
		setData: function(data) {
			this.data = data;

			this.initElements();
		},

		//agafem tots els elements i els hi apliquem els constructors
		initElements: function() {
			var self = this;

			// console.log(this.mng.options.selectors);
			$.each(this.mng.options.selectors, function(key, value) {
				if (self.data[key]) {
					var elems = self.$elem.find(self.mng.options.selectors[key]),
						data = self.data[key],
						type = objectMatch[key],
						panel = self.panel,
						mng = self.mng;

					if (key === 'operations') self.initOperations(elems, data);

					else {
						//activem cada tipus de selector
						//com que és a l'inici podem fer l'assignació de data seqüencial
						elems.each(function(i, elem) {
							$(elem)[type]({
								mng: mng,
								panel: panel,
								block: self,
								data: data[i],
								first: i == 0
							});
						});
					}
				}
			});
		},

		//inicialitzem les operacions
		initOperations: function(elems, data) {
			var self = this,
				first = true;

			//operacions de menú
			$.each([data.none, data.multi], function(i, opers) {
				$.each(opers, function(i, node) {
					var a = self.$elem.find(self.mng.options.selectors.operationMenu).find('[data-id="' + node[0].id + '"]').operationItem({
						mng: self.mng,
						panel: self.panel,
						block: self,
						data: node,
						first: first,
						parentSelector: self.mng.options.selectors.operationMenu
					});

					first = false;
				});
			});

			first = true;

			//operacions individuals
			$.each([data.single, data.multi], function(i, opers) {
				$.each(opers, function(i, node) {
					self.$elem.find(self.mng.options.selectors.operationItem).find('[data-id="' + node[0].id + '"]').operationItem({
						mng: self.mng,
						panel: self.panel,
						block: self,
						data: node,
						first: first,
						parentSelector: self.mng.options.selectors.items
					});
					first = false;
				});
			});
		}
	};



	/**
	 *		PANELS
	 */


	var PanelObj = {

		scroll: {},
		// element cridat, scroll exterior
		$scroll: {},
		// el node jquery de scroll
		$elem: {},
		// l'element scrollable interior
		data: {},
		//dades recuperades de l'API
		//inicialitzem el panel manager
		init: function(options, elem) {
			this.scroll = elem;
			this.$scroll = $(elem);

			this.mng = options.mng;

			this.$elem = this.getInnerPanel();
		},

		//carreguem tota la info que acabem de rebre i la distribuïm
		setData: function(data) {
			var self = this;

			this.data = data;

			$.each(data.blocks, function(i, block) {
				self.filterScope(block);
			});
		},

		// mirem les dades i filtrem els continguts
		// tot distribuint la lògica
		filterScope: function(blockData) {
			var block;

			blockData.operations = (blockData.operations) ? this.parseOperations(blockData) : null;

			if (blockData.blockAction === 'new') {
				block = $((this.mng.options.templates[blockData.type + 'Block']) ? this.mng.options.templates[blockData.type + 'Block'](blockData) : this.mng.options.templates.genericBlock(blockData)).appendTo(this.$elem).block({
					mng: this.mng,
					panel: this
				});
			} else {
				block = $(this.mng.options.selectors.block);
			}

			block.setData(blockData);
		},

		// separem les operacions segons 'apply'
		parseOperations: function(blockData) {
			var ops = {};
			$.each(['none', 'single', 'multi'], function(i, apply) {
				ops[apply] = $.map(blockData.operations, function(elem, i) {
					if (elem.apply === apply) return elem;
				});
			});

			return ops;
		},

		// retornem la part interior del panel
		getInnerPanel: function(){
			return this.$scroll.find('.jspPane')[0] || this.$scroll;
		}
	};



	/**
	 *		PANEL MANAGER
	 */

	var PanelMng = {
		production: !((document.location.hostname == "localhost") | (document.location.protocol == "file:")),

		scroll: {},		// element cridat, scroll exterior
		$scroll: {},	// el node jquery de scroll
		$elem: {},		// l'element scrollable interior

		$tooltip: {},	// un tooltip general per a tot

		//inicialitzem el panel manager
		init: function(options, elem) {
			this.scroll = elem;
			this.$scroll = $(elem);

			this.$elem = this.addScroll(this.$scroll).attr('id', 'scrollingContent');

			this.baseURL = (typeof options === 'string') ? options : options.baseURL;

			//extenem recursivament per copiar els objectes de dins tb
			this.options = $.extend(true, {}, $.fn.panelManager.options, options);

			this.prepareTemplates();
			this.prepareEffects();
			this.prepareTooltips();

			this.initScroll();

			this.loadData(this.options.menu);
		},

		// declarem els efectes
		prepareEffects: function() {
			$.fx.speeds._default = this.options.speed || $.fx.speeds._default;

			// $.fn.unfold = function(speed, distance) {
			// 	distance = (distance) ? distance : this.options.slide;

			// 	return $(this).css({
			// 		'opacity': 0,
			// 		'left': -distance
			// 	}).animate({
			// 		opacity: '1',
			// 		left: 0
			// 	}, speed);
			// };
		},

		// preparem tots els templates i selectors per a handlebars
		prepareTemplates: function() {
			var self = this;

			// de moment no hi ha l'opció d'accedir als pares
			// des d'un partial, això ho resol:
			// {{#$ childContextObject }}{{> yourPartial}}{{/$}}
			// accés a dades del parcial directe {{ $_.variableInParentContext }}
			Handlebars.registerHelper('$', function(child, options) {
				if (typeof child !== 'object') {
					return '';
				}
				child = child || {};
				child['$_'] = this;
				return options.fn(child);
			});

			// parcials dels templates
			$.each(this.options.partials, function(i, tmp) {
				Handlebars.registerPartial(i, tmp);
			});

			// templates
			$.each(this.options.templates, function(i, tmp) {
				self.options.templates[i] = Handlebars.compile(tmp);
			});
		},

		// marquem totes les icones com a $tooltip-ejables
		prepareTooltips: function(){
			var self = this;

			self.$tooltip = $(self.options.templates.tooltip({name:'test'}))
				.hide()
				.appendTo(self.$elem)
				.css( 'position', 'absolute');

			this.$elem.on('mouseenter', self.options.selectors.operations, this.showTooltip)
				.on('mouseleave', self.options.selectors.operations, this.hideTooltip)
				.on('click', self.options.selectors.operations, this.hideTooltip);
		},

		// situem i mostrem el tooltip
		showTooltip: function(){
			// this = button hover
			var $button = $(this),
				button = $button.data('control'),
				coords = $button.position(),
				self = button.mng,
				tip = self.$tooltip;

			tip.stop()
				.hide()
				.html(button.getCurrentAction().name)
				.appendTo(button.panel.getInnerPanel())
				.delay(self.options.effects.tooltipDelay)
				.fadeIn();

			tip.css({
				'left' : coords.left + ($button.outerWidth() - tip.outerWidth())/2,
				'top' : coords.top -$button.outerHeight()
			});
		},

		// movem i amaguem el tooltip
		hideTooltip: function(){
			// this = button out
			var $button = $(this),
				button = $button.data('control'),
				self = button.mng,
				tip = self.$tooltip;
			
			tip.stop()
				.hide()
				.appendTo(self.$elem);
		},

		// demanem dades i les processem
		loadData: function(fn, method, params) {
			var self = this;

			this.fetch(fn, method, params).fail(function(e, jqXHR) {
				console.log(jqXHR);
			}).done(function(data) {
				self.filterScope(data);
				self.initScroll();
			});
		},

		//	agafem les dades via ajax
		fetch: function(fn, method, params) {
			return $.ajax({
				url: this.baseURL + fn,
				data: params,
				dataType: 'json',
				type: method
			});
		},

		// mirem les dades i filtrem els continguts
		// tot distribuint la lògica
		filterScope: function(data) {
			var oldPanels = $(this.options.selectors.panel),
				panel,
				numPanel = data.numPanel,
				node;

			if (data.panelAction === 'new') {
				//eliminem els panells posteriors
				$($.grep(oldPanels, function(i, p){
					return $(p).data('id') >= numPanel;
				})).remove();

				panel = $((this.options.templates.panelContainer) ? this.options.templates.panelContainer(data) : this.options.templates.genericBlock(data)).appendTo(this.$elem).panel({
					mng: this
				});
			} else {
				panel = oldPanels.filter('[data-id='+numPanel+']');
			}

			panel = panel.setData(data);
		},

		// obrim un link rebut per apiCall
		openLink: function(apiCall, params) {
			console.log(apiCall);

			this.loadData(apiCall.url, apiCall.method, params);
		},



		/**
		 *	SCROLLBARS
		 */

		// preparem els objectes de scroll
		prepareScrollObjects: function() {
			this.options.visual.optionsV = {
				'verticalDragMaxHeight': this.options.visual.scrollMaxSize,
				'showArrows': true,
				'animateScroll': true,
				'animateDuration': this.options.effects.speed,
				'hijackInternalLinks': false,
				'hideFocus': true,
				//posem -6 per contrarrestar el width del css
				'verticalGutter': -6,
			};
			this.options.visual.optionsH = {
				'horizontalDragMaxWidth': this.options.visual.scrollMaxSize,
				'showArrows': true,
				'animateScroll': true,
				'animateDuration': this.options.effects.speed,
				'hijackInternalLinks': false,
				'hideFocus': true,
				'verticalGutter': 0,
			};
		},

		// afegim les barres de tota la pàgina
		addScroll: function(element) {
			return $('<div></div>').appendTo(element);
		},

		//apliquem tots els scrolls de la p�gina
		initScroll: function() {
			var self = this,
				isResizing = false
				win = $(window);

			win.on('resize', function() {
				if (!isResizing) {
					isResizing = true;

					self.resetScroll(true);
					isResizing = false;
				}
			}).trigger('resize');

			// Workaround for known Opera issue which breaks demo (see
			// http://jscrollpane.kelvinluck.com/known_issues.html#opera-scrollbar )
			$('body').css('overflow', 'hidden');

			// IE calculates the width incorrectly first time round (it
			// doesn't count the space used by the native scrollbar) so
			// we re-trigger if necessary.
			if (this.$scroll.width() != win.width()) {
				win.trigger('resize');
			}
		},

		//reiniciem tot el sistema de scrolls
		resetScroll: function(firstTime) {
			firstTime = !! firstTime;

			var win = $(window),
				end;

			this.resizePanels();

			// Temporarily make the container tiny so it doesn't influence the
			// calculation of the size of the document
			this.$scroll.css({
				'width': 1,
				'height': 1
			});
			// Now make it the size of the window...
			this.$scroll.css({
				'width': win.width(),
				'height': win.height()
			});

			end = (win.width() <= $(this.$elem).width());
			try {
				this.$scroll.data('jsp').scrollToPercentX(end ? 100 : 0, end ? true : false);
			} catch (e) {}
			this.$scroll.jScrollPane(this.options.visual.optionsH);
			this.$scroll.data('jsp').scrollToPercentX(end ? 100 : 0, true);

			// Internal scrollpanes
			$(this.options.selectors.panel).jScrollPane(this.options.visual.optionsV);
		},


		//fem un reescalat de tots els panells per adaptar-los a la mida de la p�gina
		resizePanels: function() {
			var lists = $('.list'),
				details = $('.detail'),
				panels = $(this.options.selectors.panel),
				menus = $(this.options.selectors.menu),
				bar = $('.jspHorizontalBar').outerHeight(),
				winH = $(window).height();

			// allow all panes to be side by side.
			this.$elem.css('width', Math.max(
			lists.size() * lists.outerWidth(true) + details.size() * details.outerWidth(true), panels.size() * panels.outerWidth(true)));

			//fill the whole height but scrollbar
			panels.css('height', winH - bar);
			menus.css('height', winH);
		},

	};



	/*******************************
		CONSTRUCCIÓ DELS PROTOTIPUS
	*******************************/

	function genericConstructor(elem, object, options) {
		return elem.each(function() {
			var self = $(this),
				//així tot el que hem definit a la part superior queda com a _proto
				obj = Object.create(object);

			obj.init(options, this);

			self.data('control', obj);
		}).data('control');
	}

	$.fn.selectableItem = function(options) {
		// this = objecte cridat
		var obj = $.extend({}, SelectableObj, GeneralObj);
		return genericConstructor(this, obj, options);
	};

	$.fn.operationItem = function(options) {
		// this = objecte cridat
		var obj = $.extend({}, OperationObj, GeneralObj);
		return genericConstructor(this, obj, options);
	};

	$.fn.imageItem = function(options) {
		// this = objecte cridat
		var obj = $.extend({}, ImageObj, GeneralObj);
		return genericConstructor(this, obj, options);
	};

	$.fn.block = function(options) {
		// this = objecte cridat
		return genericConstructor(this, BlockObj, options);
	};

	$.fn.panel = function(options) {
		// this = objecte cridat
		return genericConstructor(this, PanelObj, options);
	};

	$.fn.panelManager = function(options) {
		// this = objecte cridat
		return genericConstructor(this, PanelMng, options);
	};



	/*************************************
		OPCIONS
	*************************************/

	//així podem accedir-hi des d'arreu
	$.fn.panelManager.options = {
		menu: 'menu',
		effects: {
			speed: 500,
			slide: 100,
			tooltipDelay: 500
		},
		visual: {
			scrollMaxSize: 50
		},
		selectors: {
			operations: '',
			operation_link: 'button',
			items: '',
			item_link: 'a',
			panel: '.panel',
			operationMenu: '.operationMenu',
			operationItem: '.operation'
			// listLink: '',
			// form: ''
		},
		templates: {
			// panelContainer: defaultBlock,
			// panelHeader: defaultBlock,
			// formBlock: defaultBlock,
			// formSelector: defaultBlock,
			// formText: defaultBlock,
			// formTextarea: defaultBlock,
			// formGroup: defaultBlock,
			// formCheck: defaultBlock,
			// formRadio: defaultBlock,
			// formSelectSingle: defaultBlock,
			// formSelectMulti: defaultBlock,
			// formOption: defaultBlock,
			// formPlain: defaultBlock,
			// languageBlock: defaultBlock,
			// languageTab: defaultBlock,
			// languageItem: defaultBlock,
			// languageLink: defaultBlock,
			// alertContainer: defaultBlock,
			genericBlock: '<div>Si us plau, defineix una estructura per a blocs tipus {{type}}<div>',
			operationLink: '{{> operationLink }}'

			// galleryBlock: defaultBlock,
			// htmlBlock: defaultBlock,
			// listBlock: defaultBlock,
			// tipBlock: defaultBlock,
			// operationMenu: defaultBlock,
			// operationIte: defaultBlock
		}
	};



	/********************************
		HELPERS
	********************************/

	function uppercaseFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	Object.size = function(obj) {
		var size = 0,
			key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;
	};

})(jQuery, window, document);
