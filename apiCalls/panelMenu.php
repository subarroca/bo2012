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
			url => 'panelList.php',
			method => 'GET',
		),
	));
}

echo json_encode(array(

	panelAction => 'new', //	new, update
	numPanel => 0,

	selector => 'selector',
	model => 'model',
	title => 'Titol del panell',
	type => 'menu',
	
	blocks => array(
		array(
			blockAction => 'new',	//	new, update
			numBlock => 0,

			type => 'menu',
			title => 'numPanel + .  +model+ - +id',
			active => 'activeId',
			items => $list
		)
	)
)
);