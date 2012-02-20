(function( $ ){
	var time = 1000;
	
	var decimal = [1,2,3,4];
	var roman = ['I','II','III','IV'];
	var upper = ['A','B','C','D'];
	var lower = ['a','b','c','d'];
	
	var options = ['decimal', 'roman', 'upper', 'lower'];
	


  var methods = {
    init : function(  ) { 
    },
	
	//obrim un panell per defecte en iniciar
	openDefaultPanel : function(){
		window.location.hash = '#/decimal/0';
		this.panelManager('openPanel','decimal',0,0);
	},
	
	//omplim el panell amb les opcions segons el model
	fillList : function( selector, model, id, numPanel, activeId){
		var dis = this;
		
		var list = new Array;		
		var mod = eval(model);
		
		for(var i=0; i< mod.length; i++){
			list.push({
				name : mod[i]+'.'+options[i],
				model : options[i],
				id : i
			});
		}
					
		var json = {
			selector : selector,
			model : model,
			numPanel : numPanel,
			title : 'Titol del panell',
			type : 'list',
			
			actions : {
				default : {
					contents : new Array({
						type : 'list',
						//tag : 'ul',
						title : numPanel + '. ' +model+' - '+id,
						active : activeId,
						operations : new Array({
							name : 'nou',
							type : 'new',
							icon : 'plus',
							apply : 'none', // none, single, multi
							url : '',
						},{
							name : 'filtre',
							type : 'search',
							icon : 'magnifying_glass',
							apply : 'none', // none, single, multi
							url : '',
						},{
							name : 'esborra',
							type : 'delete',
							icon : 'trash_stroke',
							apply : 'multi', // none, single, multi
							url : '',
						}),
						items : list
					},{
						type : 'gallery',
						title : "Galeria",
						droppable : true,
						items : new Array({
							src : 'img/examples/img0.jpg',
							alt : 'Test alt',
							name : 'Nom',
							model : 'images',
							id : 0
						},{
							src : 'img/examples/img0.jpg',
							alt : 'Test alt',
							name : 'Nom',
							model : 'images',
							id : 1
						},{
							src : 'img/examples/img0.jpg',
							alt : 'Test alt',
							name : 'Nom',
							model : 'images',
							id : 2
						}),
						html : "<table><tr><td><figure></figure></td><td><figure></figure></td></tr><tr><td><figure></figure></td><td><figure></figure></td></tr></table>"
					},{
						type : 'html',
						title : "Bloc d'html",
						html : "<p><b>Lorem ipsum dolor sit amet</b>, consectetur adipiscing elit. Phasellus eu sapien nec metus rhoncus condimentum porta ut erat. Vestibulum et pellentesque nulla. Quisque ut eros risus. Suspendisse eu lorem quam. Integer mollis porta hendrerit. Morbi sit amet purus eu mauris elementum vehicula ac sit amet dui. Proin et risus ligula, at cursus risus. Duis sagittis elementum lacinia. Aliquam rutrum mauris nec libero cursus eget blandit dui pellentesque.</p>"+
						"<p>Integer tempor bibendum sapien sit amet convallis. Duis eu orci urna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras dictum accumsan ligula, eget facilisis orci viverra ornare. Ut est turpis, sollicitudin in bibendum quis, viverra at velit. Suspendisse ullamcorper ornare pharetra. Maecenas quis mi ac felis suscipit bibendum. Integer mollis rutrum felis et fringilla.</p>"
					}),
				},
				new : {
					contents : new Array({
						type : 'form',
						title : 'Nova entrada',
						operations : new Array({
							name : 'nou',
							type : 'new',
							icon : 'plus',
							apply : 'none', // none, single, multi
							url : '',
						}),
						items : new Array({
							name : 'title',
							type : 'text',
							label : 'T�tol',
							value : 'T�tol per defecte'
						},{
							name : 'description',
							type : 'textarea',
							label : 'Cos',
							value : 'Cos per defecte'
						},{
							name : 'model',
							type : 'select',
							label : 'Model',
							values : new Array({
								value : '0',
								label : 'decimal'
							},{
								value : '1',
								label : 'roman'
							},{
								value : '2',
								label : 'upper'
							},{
								value : '3',
								label : 'lower'
							})
						})
					})
				}
			}
		};
		
		setTimeout(function() {			
			$($(dis).panelManager('parseJson',json));			
		}, time);
	}
  };
  
  

  $.fn.panelTester = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.panelManager' );
    }    
  
  };

})( jQuery );