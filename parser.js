var trelloParser = {
	items : [],
	blocks: [],
	board: {
		id : '',
		name : '',
		description : ''
	},

	
	loadFile : function() {
		$.getJSON('ccs.json', function(data) {
			trelloParser.board.id = data.id;
			trelloParser.board.name = data.name;
			trelloParser.board.description = data.desc;
			console.log(trelloParser.board);
			trelloParser.fillData(data);
			trelloParser.printData();
		});
	},

	fillData : function(data) {
		$.each(data, function(key, val) {
			if(typeof(val) === 'object' && val !== null) {
				if(key !== 'actions') return true;
				trelloParser.history(val);
				//trelloParser.items.push('<li><h3>' + key + '</h3></li>');
				trelloParser.items.push('<li><h3>' + key + ' <span class="details">-</span></h3></li>');
				trelloParser.fillData(val != 'null' ? val : key);
			} else {
				//if(val === 'fabianemsantos')
					trelloParser.items.push('<li id="' + key + '">' + key + ': ' + val + '</li>');
			}
		});
	},

	history : function(data) {

	},

	printData : function() {
		$('<ul/>', {
			'class': 'my-new-list',
			html: trelloParser.items.join('')
		}).appendTo('.results');	
	}
};