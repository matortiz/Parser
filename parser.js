Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
//Transformar esto en un objeto de verdad, mover los métodos dentro del prototype, limpiar la mugre y definir el constructor
var trelloParser = {
	items : [],
	blocks : [],
	jsonFile : 'css.json',
	board : {
		id : '',
		name : '',
		description : ''
	},
	lists : {},
	orgName : 'Infraestrutura',
	boardName : 'Sprint 5',
	actionsFilter : 'updateCard',
	validSearchKeys : ['org', 'board', 'actionFilter'],
	validFilterKeys : ['by', 'fromList', 'toList'],
	searchCriteria : [],
	filterCriteria : [],
	defaultConfiguration : {
		org : 'Infraestrutura',
		board : 'Sprint 5',
		actionFilter : 'updateCard'
	},
	emptyListMock : {
		name : 'noList'
	},
	initSearchCriteria : function() {
		$.each(trelloParser.validSearchKeys, function(index, data) {
			//refactor eval
			trelloParser.searchCriteria[data] = eval('trelloParser.defaultConfiguration.' + data);
		});
	},

	init : function() {
		//Trello.deauthorize();
		console.log(Trello.authorized());
		
		if(!Trello.authorized())
			Trello.authorize({type : 'popup', success: trelloParser.authorizeOk, error: trelloParser.authorizeError});
		console.log(Trello.authorized());

		trelloParser.parseSearchString();
		
		//Hay que meter estas dos lineas dentro de un metodo clearScreen o una cosa asi
		trelloParser.items = [];
		$('div.my-new-list').remove();

    	Trello.get("members/me/organizations", function(organizations) {
			$.each(organizations, function(index, organization){
				if(organization.displayName === trelloParser.searchCriteria.org) {
					//console.log(organization.id, organization.name, organization.displayName);
					$('#orgTitle').text(organization.displayName);
					Trello.get("members/me/boards", function(boards) {
						console.log(organization.id);
						console.log(boards);
						$.each(boards, function(index, board) {
						//	console.log(board.id, board.name, board.idOrganization);
							if(board.name === trelloParser.searchCriteria.board && board.idOrganization === organization.id) {
								$('#boardTitle').text(board.name);
								//console.log(board.id, board.name);
								Trello.get('boards/' + board.id + '/actions', {filter : trelloParser.searchCriteria.actionFilter}, function(actions) {
									console.log(actions);
									$.each(actions, function(index, action) {
										console.log(action.data.listBefore);
										//Ver estos mock horribles, hacer una solución genérica
										//Por lo menos, poner en lugar de noList la lista en la que está ahora
										if(action.data.listBefore === undefined) {
											action.data.listBefore = trelloParser.emptyListMock;
										}
										if(action.data.listAfter === undefined) {
											action.data.listAfter = trelloParser.emptyListMock;
										}
										trelloParser.fillData(action);
									});
									trelloParser.printData();
								});
								
							}
						});
					});
				}
			});
    	});
	},
	authorizeOk : function() {
		alert('Hell yeah!!');
	},

	authorizeError : function() {
		alert('Ops! not gonna happen');
	},
	
//org:infraestrutura actionFilter:updateCard
	parseSearchString : function() {
		trelloParser.initSearchCriteria();
		//var string = $('.searchBox').val(), pattern = /[a-zA-Z]+:[a-zA-Z0-9,]+ ?/g, matches;
		var string = $('.searchBox').val(), pattern = /[a-zA-Z0-9]+:\b[a-zA-Z0-9\- ]+\b(?!:)/g, matches;

		matches = string.match(pattern);
		//console.log(matches);

		$.each(matches, function(index, data) {
			data = data.trim();
			var criteria = data.split(':');
			if(trelloParser.validSearchKeys.indexOf(criteria[0]) === -1) return true;
			trelloParser.searchCriteria[criteria[0]] = criteria[1];
		});

		//console.log(trelloParser.searchCriteria);
/*
		var searchCriteria = {
			fromList : '',
			toList : 'done',
			by : '',
			title : ''
		};
*/
		//return searchCriteria;
	},
	parseFilterString : function() {
		var matches = trelloParser.getMatches($('.filterBox').val());

		//console.log(matches);
		trelloParser.filterCriteria = [];		
		console.log(matches);
		if(matches !== null) {
			$.each(matches, function(index, data) {
				console.log('no deberia estar aca');
				data = data.trim();
				//console.log(data);
				var criteria = data.split(':');
				if(trelloParser.validFilterKeys.indexOf(criteria[0]) === -1) return true;
				trelloParser.filterCriteria[criteria[0].toLowerCase()] = criteria[1].toLowerCase();
				//console.log('tre');
			});
		}
		//console.log(trelloParser.filterCriteria);
		trelloParser.filter();
	},
	filter : function() {
		//muestro todos y elimino el attt
		//console.log('llego');
		$('div.my-new-list').removeAttr('__remain').show();

		if(Object.size(trelloParser.filterCriteria) > 0) {
			var filterAttributes = '';
			//Hacer refactor de este for in por dios...
			for(var propt in trelloParser.filterCriteria) {
				//console.log('li[__' + propt + '=' + trelloParser.filterCriteria[propt] + ']');
				//$('li[__' + propt + '="' + trelloParser.filterCriteria[propt] + '"]').parents('div.my-new-list').attr('__remain', true);
				filterAttributes += '[__' + propt + '="' + trelloParser.filterCriteria[propt] + '"]';
			}
			console.log(filterAttributes);
			$('ul' + filterAttributes).parents('div.my-new-list').attr('__remain', true);
			$('div.my-new-list[__remain!=true]').hide('slow');
			//$('div.my-new-list[__remain!=true]').hide('slow');
		}
	},
	getMatches : function(searchString) {
		var string = searchString, pattern = /[a-zA-Z0-9]+:\b[a-zA-Z0-9 ]+\b(?!:)/g, matches;

		matches = string.match(pattern);
		//console.log(matches);
		return matches;
	},
/*
	fileIterator : function(data) {
		$.each(data, function(key, val) {
			if(typeof(val) === 'object' && val !== null) {
				trelloParser.fillData(val != 'null' ? val : key);
			} else {
				trelloParser.items.push('<li id="' + key + '">' + key + ': ' + val + '</li>');
			}
		});		
	},
*/
	fillData : function(action) {
		console.log(action.memberCreator);
		trelloParser.items.push(
			'<div class="my-new-list">' +
				'<h3>' + action.data.card.name + '</h3>' + 
				'<ul __by="' + action.memberCreator.fullName.toLowerCase() + '" __fromlist="' + action.data.listBefore.name.toLowerCase() + '" __tolist="' + action.data.listAfter.name.toLowerCase() + '">' +
					'<li __by="' + action.memberCreator.fullName.toLowerCase() + '">' + action.memberCreator.fullName + '</li>' +
					'<li>' + action.date + '</li>' +
					'<li __fromlist="' + action.data.listBefore.name.toLowerCase() + '">From: ' + action.data.listBefore.name + '</li>' +
					'<li __tolist="' + action.data.listAfter.name.toLowerCase() + '">To: ' + action.data.listAfter.name + '</li>' +
					'<li>' + action.date + '</li>' +
				'</ul>' +
			'</div>'
		);			
	},

	printData : function() {
		//console.log(trelloParser.items);
		$('<div/>', {
			'class': 'my-new-list',
			html: trelloParser.items.join('')
		}).appendTo('.results');	
	}
};