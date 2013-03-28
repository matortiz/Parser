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
		
		//boards = Trello.get({'board' : '5130d7d41a4de96d7e00373b'});
		 //Trello.members.get("me", function(member){
        	//console.log(member.fullName);
    	Trello.get("members/me/organizations", function(organizations) {
			$.each(organizations, function(index, organization){
				if(organization.displayName === trelloParser.searchCriteria.org) {
					console.log(organization.id, organization.name, organization.displayName);
					Trello.get("members/me/boards", function(boards) {
						$.each(boards, function(index, board) {
							//console.log(board.id, board.name);
							if(board.name === trelloParser.searchCriteria.board) {
								console.log(board.id, board.name);
								Trello.get('boards/' + board.id + '/actions', {filter : trelloParser.searchCriteria.actionFilter}, function(actions) {
									$.each(actions, function(index, action) {
										console.log(action.data.card.name);
									});
								});
							}
						});
					});
				}
			});
    	});
		/*
		 Trello.get("members/me/cards", function(cards) {
            //$cards.empty();
            $.each(cards, function(ix, card) {
            	console.log(card.name);
            });  
        });
*/

	//	});
		
		//console.log(boards);

	},
	authorizeOk : function() {
		alert('Hell yeah!!');
	},

	authorizeError : function() {
		alert('Ops! not gonna happen');
	},
	
	loadFile : function() {
		$.getJSON('css.json', function(data) {
			trelloParser.board.id = data.id;
			trelloParser.board.name = data.name;
			trelloParser.board.description = data.desc;
			console.log(trelloParser.board);
			//trelloParser.fillData(data);
			//trelloParser.printData();
		});
	},
//org:infraestrutura actionFilter:updateCard
	parseSearchString : function() {
		trelloParser.initSearchCriteria();
		var string = $('.searchBox').val(), pattern = /[a-zA-Z]+:[a-zA-Z0-9,]+/g, matches;

		matches = string.match(pattern);


		$.each(matches, function(index, data) {
			var criteria = data.split(':');
			if(trelloParser.validSearchKeys.indexOf(criteria[0]) === -1) return true;
			trelloParser.searchCriteria[criteria[0]] = criteria[1];
		});

		console.log(trelloParser.searchCriteria);
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

	fileIterator : function(data) {
		$.each(data, function(key, val) {
			if(typeof(val) === 'object' && val !== null) {
				trelloParser.fillData(val != 'null' ? val : key);
			} else {
				trelloParser.items.push('<li id="' + key + '">' + key + ': ' + val + '</li>');
			}
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