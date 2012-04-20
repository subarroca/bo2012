<?php

$mod = 'decimal';
$list = array();

$decimal = array(1,2,3,4);
$roman = array('I','II','III','IV');
$upper = array('A','B','C','D');
$lower = array('a','b','c','d');

$options = array('decimal', 'roman', 'upper', 'lower');

for($i=0; $i< count($decimal); $i++){
	array_push( $list, array(
		name => $decimal[$i]+'.'+$options[$i],
		model => $options[$i],
		id => $i,
		order => $i,
		apiCall => array(
			url => 'bla',
			method => 'blo',
		),
	));
}

echo json_encode(array(

	panelAction => 'new', //	new, update
	numPanel => 1,

	selector => 'selector',
	model => 'model',
	title => 'Titol del panell',
	type => 'list',
	
	blocks => array(
		array(
			blockAction => 'new',	//	new, update
			numBlock => 0,

			type => 'list',
			title => 'numPanel + .  +model+ - +id',
			active => 'activeId',
			operations => array(
				array(
					apply => 'none', // none, single, multi
					array(
						name => 'nou',
						id => 'new',
						icon => 'plus',
						apiCall => array(
							url => 'new',
							method => 'blo',
						)
					)
				),array(
					apply => 'none', // none, single, multi
					array(
						name => 'ordena',
						id => 'sort',
						icon => 'move_vertical',
					),array(
						name => 'desa',
						id => 'sort',
						icon => 'upload',
						apiCall => array(
							url => 'bla',
							method => 'blo',
						),
					)
				),array(
					apply => 'none', // none, single, multi
					array(
						name => 'filtre',
						id => 'search',
						icon => 'magnifying_glass',
						apiCall => array(
							url => 'search',
							method => 'blo',
						),
					)
				),array(
					apply => 'multi', // none, single, multi
					array(
						name => 'esborra',
						id => 'delete',
						icon => 'trash_stroke',
						apiCall => array(
							url => 'delete',
							method => 'blo',
						),
					)
				)
			),
			items => $list
		),array(
			blockAction => 'new',	//	new, update
			numBlock => 1,

			type => 'tip',
			//tag => ul,
			title => 'Ajuda',
			operations => array(
				array(
					apply => 'none', // none, single, multi
					array(
						name => 'següent',
						id => 'next',
						icon => 'arrow_right',
					)
				),array(
					apply => 'none', // none, single, multi
					array(
						name => 'amaga',
						id => 'hide',
						icon => 'aperture',
					),
					array(
						name => 'mostra',
						id => 'show',
						icon => 'eye',
					)
				),array(
					apply => 'none', // none, single, multi
					array(
						name => 'anterior',
						id => 'prev',
						icon => 'arrow_left',
					)
				)
			),
			items => array(
				'tip #1',
				'tip #2',
				'tip #3',
				'tip #4'
			)
		),array(
			blockAction => 'new',	//	new, update
			numBlock => 2,

			type => 'gallery',
			title => "Galeria",
			extras => array('droppable', 'sortable'),
			operations => array(
				array(
					apply => 'none', // none, single, multi
					array(
						name => 'nou',
						id => 'new',
						icon => 'plus',
						apiCall => array(
							url => 'new',
							method => 'blo',
						)
					)
				),array(
					apply => 'none', // none, single, multi
					array(
						name => 'ordena',
						id => 'sort',
						icon => 'move_vertical',
					),array(
						name => 'desa',
						id => 'sort',
						icon => 'upload',
						apiCall => array(
							url => 'bla',
							method => 'blo',
						),
					)
				),array(
					apply => 'none', // none, single, multi
					array(
						name => 'filtre',
						id => 'search',
						icon => 'magnifying_glass',
						apiCall => array(
							url => 'search',
							method => 'blo',
						),
					)
				),array(
					apply => 'multi', // none, single, multi
					array(
						name => 'esborra',
						id => 'delete',
						icon => 'trash_stroke',
						apiCall => array(
							url => 'delete',
							method => 'blo',
						),
					)
				)
			),
			items => array(
				array(
					src => 'img/examples/img0.jpg',
					alt => 'Test alt',
					name => 'Nom',
					model => 'images',
					id => 0
				),array(
					src => 'img/examples/img0.jpg',
					alt => 'Test alt',
					name => 'Nom',
					model => 'images',
					id => 1
				),array(
					src => 'img/examples/img0.jpg',
					alt => 'Test alt',
					name => 'Nom',
					model => 'images',
					id => 2
				)
			),
		/*),array(
			blockAction => 'new',	//	new, update
			numBlock => 3,

			type => 'html',
			title => "Bloc dhtml",
			html => "<p><b>Lorem ipsum dolor sit amet</b>, consectetur adipiscing elit. Phasellus eu sapien nec metus rhoncus condimentum porta ut erat. Vestibulum et pellentesque nulla. Quisque ut eros risus. Suspendisse eu lorem quam. Integer mollis porta hendrerit. Morbi sit amet purus eu mauris elementum vehicula ac sit amet dui. Proin et risus ligula, at cursus risus. Duis sagittis elementum lacinia. Aliquam rutrum mauris nec libero cursus eget blandit dui pellentesque.</p>".
			"<p>Integer tempor bibendum sapien sit amet convallis. Duis eu orci urna. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras dictum accumsan ligula, eget facilisis orci viverra ornare. Ut est turpis, sollicitudin in bibendum quis, viverra at velit. Suspendisse ullamcorper ornare pharetra. Maecenas quis mi ac felis suscipit bibendum. Integer mollis rutrum felis et fringilla.</p>"
		*/)
	)
)
);