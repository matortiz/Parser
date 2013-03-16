var trelloParser = {
	items : [],
	loadFile : function() {
		$.getJSON('ccs.json', function(data) {
			trelloParser.fillData(data);
			trelloParser.printData();
		});
	},

	fillData : function(data) {
		$.each(data, function(key, val) {
			if(typeof(val) === 'object' && val !== null) {
				trelloParser.items.push('<li><h3>' + key + '</h3></li>');
				trelloParser.fillData(val != 'null' ? val : key);
			} else {
				//if(val === 'fabianemsantos')
					trelloParser.items.push('<li id="' + key + '">' + key + ': ' + val + '</li>');
			}
		});
	},

	printData : function() {
		$('<ul/>', {
			'class': 'my-new-list',
			html: trelloParser.items.join('')
		}).appendTo('body');	
	}
};