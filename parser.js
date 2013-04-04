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
	searchCriteria : [],
	defaultConfiguration : {
		org : 'Infraestrutura',
		board : 'Sprint 5',
		actionFilter : 'updateCard'
	},
	initSearchCriteria : function() {
		$.each(trelloParser.validSearchKeys, function(index, data) {
			trelloParser.searchCriteria[data] = eval('trelloParser.defaultConfiguration.' + data);
		});
	},

	init : function() {
		//Trello.deauthorize();
		if(!Trello.authorized())
			Trello.authorize({type : 'popup', success: trelloParser.authorizeOk});

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
						$.each(boards, function(index, board) {
							//console.log(board.id, board.name);
							if(board.name === trelloParser.searchCriteria.board) {
								$('#boardTitle').text(board.name);
								//console.log(board.id, board.name);
								Trello.get('boards/' + board.id + '/actions', {filter : trelloParser.searchCriteria.actionFilter}, function(actions) {
									$.each(actions, function(index, action) {
										//console.log(action.data.listBefore);
										if(action.data.listBefore !== undefined)
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
		var string = $('.searchBox').val(), pattern = /[a-zA-Z0-9]+:\b[a-zA-Z0-9 ]+\b(?!:)/g, matches;

		matches = string.match(pattern);
		console.log(matches);


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
		trelloParser.items.push(
			'<div class="my-new-list">' +
				'<h3>' + action.data.card.name + '</h3>' + 
				'<ul>' +
					'<li>' + action.memberCreator.fullName + '</li>' +
					'<li>' + action.date + '</li>' +
					'<li>From: ' + action.data.listBefore.name + '</li>' +
					'<li>To: ' + action.data.listAfter.name + '</li>' +
					'<li>' + action.date + '</li>' +
				'</ul>'
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